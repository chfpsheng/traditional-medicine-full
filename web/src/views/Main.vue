<template>
  <div class="main-container">
    <!-- 公共顶部导航栏 -->
    <Header />
    <!-- 直接显示路由内容，去掉左侧菜单 -->
    <router-view />
  </div>
</template>

<script>
import Header from '../components/Header.vue'

export default {
  name: 'Main',
  components: {
    Header
  },
  methods: {
  }
}
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>