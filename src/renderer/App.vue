<template>
    <div id="app">
        <img class="logo" src="./assets/ico.png" />
        <h3 class="title">NTFS-READER</h3>
        <p class="sub-title">Mac平台下的NTFS文件系统驱动</p>
        <landing-page></landing-page>
    </div>
</template>

<script>
    import LandingPage from '@/components/LandingPage/LandingPage.vue'

    export default {
    name: 'ntfs-reader',
        components: {
            LandingPage
        }
    }
</script>
<style>
    * {
        margin: 0;
        padding: 0;
    }

    .logo {
        display: block;
        width: 100px;
        height: auto;
        margin: 5px auto 0;
    }

    .title {
        font-size: 18px;
        line-height: 36px;
        font-weight: normal;
        color: #555;
        text-align: center;
    }

    .sub-title {
        font-size: 14px;
        line-height: 28px;
        color: #888;
        text-align: center;
    }
</style>
