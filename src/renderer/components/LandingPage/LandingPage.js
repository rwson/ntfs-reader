import nodeDisks from 'nodejs-disks';

import { 
    readFsTab, 
    addToFsTab, 
    deleteFsTabItem 
} from '@/python';

const PYTHON_MODULE = 'main';

let cacheList = [],
    loading;

const mountToName = (mountpoint) => {
    const arr = mountpoint.split('/'),
        { length } = arr;
    return arr[length - 1];
};

const getDisks = () => {
    return new Promise((resolve) => {
        try {
            nodeDisks.drives((error, drives) => {
                if (error) {
                    resolve({
                        success: false,
                        error
                    });
                    return;
                }
                nodeDisks.drivesDetail(drives, async(error, disks) => {
                    const mounted = await readFsTab(PYTHON_MODULE);
                    if (!mounted.success) {
                        resolve(mounted);
                        return;
                    }
                    disks = disks.filter((disk) => {
                        return (disk.mountpoint !== '/') && (disk.mountpoint.indexOf('private') === -1);
                    }).map((disk) => {
                        disk.name = mountToName(disk.mountpoint);
                        disk.size = [parseFloat(disk.total.replace(' GB')).toFixed(1), 'GB'].join(' ');
                        disk.mounted = mounted.res.indexOf(disk.name) !== -1;
                        return disk;
                    });

                    setTimeout(() => {
                        resolve({
                            success: true,
                            disks
                        });
                    }, 1000);
                });
            });
        } catch (error) {
            resolve({
                success: false,
                error
            });
        }
    });
};

const processWhiteSpace = (name) => (name.replace(/\ /g, '\\40'));

export default {
    name: 'landing-page',
    methods: {
        cancelMount(item) {
            const { name } = item.row;
            this.$confirm(`此操作将导致您无法继续往${name}上写入任何内容, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.operating = true;
                const res = await deleteFsTabItem(PYTHON_MODULE, [name]);
                this.operating = false;
                if  (res.success) {
                    this.$notify({
                        title: '提示',
                        type: 'success',
                        duration: 1500,
                        message: '取消挂载成功!'
                    });
                } else {
                    this.$notify({
                        title: '错误',
                        type: 'error',
                        duration: 1500,
                        message: '操作失败, 请重试!'
                    });
                }
            }).catch(() => {
                this.$notify.info({
                    title: '提示',
                    duration: 1500,
                    message: '你取消了本次操作!'
                });
            });
        },
        async mountDisk(item) {
            this.operating = true;
            const { name } = item.row,
                res = await addToFsTab(PYTHON_MODULE, [name]);
            this.operating = false;
        },
        async init() {
            this.reading = true;
            const disk = await getDisks();
            if (disk.success) {
                this.diskList = disk.disks;
                this.reading = false;
                this.error = false;
            } else {
                this.diskList = [];
                this.reading = false;
                this.error = true;
            }
        }
    },
    data() {
        return {
            diskList: [],
            reading: false,
            operating: false,
            error: false
        };
    },
    watch: {
        reading() {
            const { reading } = this;
            if (reading) {
                loading = this.$loading({
                    lock: true,
                    text: '正在读取外部硬盘列表, 请稍候!',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            } else {
                if (loading) {
                    loading.close();
                }
            }
        },
        operating() {
            const { operating } = this;
            if (operating) {
                loading = this.$loading({
                    lock: true,
                    text: '正在操作, 请稍候!',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            } else {
                if (loading) {
                    loading.close();
                }
            }
        }
    },
    async created() {
        await this.init();
    }
};