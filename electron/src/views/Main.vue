<template>
  <div class="main-container">
    <div class="sidebar">
      <div class="logo">
        <h3>传统医学应用</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="prescriptions">
          <el-icon><Collection /></el-icon>
          <span>验方集</span>
        </el-menu-item>
        <el-menu-item index="doctors">
          <el-icon><Map /></el-icon>
          <span>验医集</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <div class="header">
        <h2>{{ currentTitle }}</h2>
        <div class="user-info">
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { Collection, Map } from '@element-plus/icons-vue'

export default {
  name: 'Main',
  components: {
    Collection,
    Map
  },
  data() {
    return {
      activeMenu: 'prescriptions',
      currentTitle: '验方集'
    }
  },
  created() {
    this.updateMenuAndTitle()
  },
  watch: {
    $route: {
      handler() {
        this.updateMenuAndTitle()
      },
      immediate: true
    }
  },
  methods: {
    updateMenuAndTitle() {
      const path = this.$route.path
      if (path === '/prescriptions') {
        this.activeMenu = 'prescriptions'
        this.currentTitle = '验方集'
      } else if (path === '/doctors') {
        this.activeMenu = 'doctors'
        this.currentTitle = '验医集'
      }
    },
    handleMenuSelect(key) {
      this.$router.push(`/${key}`)
    },
    handleLogout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #304156;
  color: #fff;
  height: 100%;
  overflow-y: auto;
}

.logo {
  padding: 20px;
  background-color: #263445;
  text-align: center;
  border-bottom: 1px solid #405065;
}

.logo h3 {
  color: #fff;
  margin: 0;
  font-size: 16px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

:deep(.el-menu-vertical-demo) {
  background-color: #304156;
  border-right: none;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-menu-item.is-active:hover) {
  background-color: #66b1ff;
  color: #fff;
}
</style>