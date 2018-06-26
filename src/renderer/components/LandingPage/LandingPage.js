import fs from 'fs';
import cp from 'child_process';
import sudo from 'sudo';
import fsSudo from '@mh-cbon/sudo-fs';

const PATH = '/etc/fstab',
    CMD = 'diskutil list',
    CHMOD_CMD = ['chmod', '755', '/etc/fstab'],
    SUDO_OPTIONS = {
		cachePassword: false,
	    spawnOptions: {
	    	stdio: 'pipe'
	    }
    };

let cacheList = [];

const execPromise = (cmd) => {
    return new Promise((resolve) => {
        try {
            cp.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        success: false,
                        ...error
                    });
                } else {
                    resolve({
                        success: true,
                        stdout
                    });
                }
            });
        } catch (error) {
            resolve({
                success: false,
                ...error
            });
        }
    });
};

const chmodSpawn = (cmd, password) => {
    return new Promise((resolve) => {
        try {
        	const spawn = sudo(cmd, SUDO_OPTIONS);
            spawn.stdout.on("data", (data) => {
                spawn.stdin.write(`${password}\n`);
            });

            spawn.stderr.on("data", (data) => {
                spawn.stdin.write(`${password}\n`);
            });
            spawn.on("close", (code) => {
                switch (code) {
                	case 0:
                		resolve({
                			success: true
                		});
                	break;

                	default:
                		resolve({
                			success: false
                		});
                	break;
                }
            });
        } catch (error) {
            resolve({
                success: false,
                ...error
            });
        }
    });
};

const fileToString = (path) => {
    try {
        const stream = fs.readFileSync(path);
        return {
            success: true,
            content: stream.toString()
        };
    } catch (error) {
        return {
            success: false,
            ...error
        };
    }
};

const getNtfsDisks = (disks) => {
    return disks.filter((disk) => {
        for (let i = 0, { length } = disk; i < length; i++) {
            if (disk[i] === 'Windows_NTFS') {
                return true;
            }
        }
        return false;
    });
};

const parseDiskList = (diskList) => {
    try {
        const str = diskList.stdout,
            disks = str.split(/\n/g).filter((disk) => {
                return disk.length > 0;
            }).map((disk) => {
                disk = disk.split(/ +/g);
                return disk;
            }),
            res = getNtfsDisks(disks);
        return {
            success: true,
            res: res.map((item) => ({
                name: item[3],
                size: item[4]
            }))
        };
    } catch (error) {
        return {
            success: false,
            ...error
        }
    }
};

const parseFstab = (str) => {
    const res = [];
    cacheList = str.split(/\n/g).filter((item) => {
        return item.length;
    });
    str.split(/\n/g).forEach((item) => {
        if (item.length) {
            item = item.split(' ')[0];
            item = item.split('=')[1];
            res.push(item);
        }
    });
    return res;
};

const arrayToFile = (arr) => {
	return new Promise((resolve) => {
	    try {
	        const str = (arr.length > 0) ? arr.join('\n') : '';
	        fs.writeFileSync(PATH, str);
	        resolve({
	        	success: true
	        });
	    } catch (error) {
	    	console.log(error);
	        resolve({
	        	success: true,
	        	...error
	        });
	    }
	});
};

const processWhiteSpace = (name) => name.replace(/\ /g, '\\040');

const replaceWhiteSpace = (name) => name.replace(/\\40/g, ' ');

export default {
    name: 'landing-page',
    methods: {
        cancelMount(item) {
        	this.$prompt('登录密码', '请输入登录密码', {
				confirmButtonText: '确定',
	          	cancelButtonText: '取消'
        	}).then(async({ value }) => {
                const { row, $index } = item,
                appendArr = [].concat(cacheList).filter((cfg) => {
                	return cfg.indexOf(`LABEL=${processWhiteSpace(item.row.name)}`) === -1;
                });
                let write, chmod;

                console.log(appendArr);

                chmod = await chmodSpawn(CHMOD_CMD, value);
                write = await arrayToFile(appendArr);

                console.log(write);

                if(!chmod.success) {
	                this.$notify.error({
	                    title: '错误',
	                    message: '您输入的密码不正确!'
	                });
                	return;
                }

        	}).catch((e) => {
        		console.log(e);
                this.$notify.error({
                    title: '错误',
                    message: '您取消了操作!'
                });
        	});
        },
        mountDisk(item) {
            this.$prompt('登录密码', {
                inputPlaceholder: '请输入登录密码',
                callback: async(action, instance) => {
                    switch (action) {
                        case 'confirm':
                            const { row, $index } = item,
                            appendArr = [].concat(cacheList);
                            let write, chmod;

                            appendArr.push(`LABEL=${processWhiteSpace(item.row.name)} none ntfs rw,auto,nobrowse`);
                            chmod = await chmodSpawn(CHMOD_CMD);
                            break;

                        default:
                            this.$notify.error({
                                title: '错误',
                                message: '您取消了操作!'
                            });
                            break;
                    }
                    console.log(action, instance);
                }
            });
        },
        async init() {
	        const diskList = await execPromise(CMD),
	            content = fileToString(PATH);
	        let parsed, mounted;
	        if (diskList.success && content.success) {
	            parsed = parseDiskList(diskList);
	            mounted = parseFstab(content.content);
	            this.diskList = parsed.res.map((item) => {
	                item.mounted = false;
	                if (mounted.indexOf(item.name) > -1) {
	                    item.mounted = true;
	                }
	                item.size = /GB$/.test(item.size) ? item.size : [item.size, 'GB'].join(' ');
	                item.progress = 50;
	                return item;
	            });
	        }
        }
    },
    data() {
        return {
            diskList: [],
            reading: false,
            error: false
        };
    },
    async created() {
    	await this.init();
    }
};