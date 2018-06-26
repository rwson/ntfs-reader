<template>
    <div>
        <div class="disks-list" v-if="!error && !reading">
            <h5 class="list-title">磁盘列表</h5>
            <el-table :data="diskList" style="width: 360px">
                <el-table-column prop="name" label="名称" width="120"></el-table-column>
                <el-table-column prop="size" label="容量" width="120"></el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-tooltip v-if="scope.row.mounted" effect="dark" content="取消后, 您将不能继续往NTFS分区格式的硬盘内写入任何内容" placement="top-start">
                            <el-button type="danger" size="mini" plain @click="cancelMount(scope)">取消</el-button>
                        </el-tooltip>
                        <el-tooltip v-if="!scope.row.mounted" effect="dark" content="挂载后, 您将可以往NTFS分区格式的硬盘内写入内容" placement="top-start">
                            <el-button type="success" size="mini" plain @click="mountDisk(scope)">挂载</el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="error" v-if="error && !reading">
            <div class="error-ico"></div>
            <p class="error-description">额, 好像读取失败了, 点击下方按钮重试下呗!</p>
            <div class="error-button">
                <el-button size="mini" plain @click="init()">重试</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import LandingPage from './LandingPage';
    export default LandingPage;
</script>

<style scoped>
    @import url('./LandingPage.css');
</style>
