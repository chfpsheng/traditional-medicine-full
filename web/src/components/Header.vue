<template>
  <div class="header">
    <div class="logo">
      <el-icon><Reading /></el-icon>
      <span>中医验方宝典</span>
    </div>
    <div class="nav-buttons">
      <el-button 
        :type="isActive('prescriptions') ? 'primary' : 'primary'" 
        :plain="!isActive('prescriptions')"
        @click="navigateTo('prescriptions')"
      >
        验方集
      </el-button>
      <el-button 
        :type="isActive('doctors') ? 'primary' : 'primary'" 
        :plain="!isActive('doctors')"
        @click="navigateTo('doctors')"
      >
        验医集
      </el-button>
    </div>
    <div class="header-actions">
      <el-icon class="search-icon"><Search /></el-icon>
      <el-button 
        type="text" 
        @click="handleLogout"
        class="logout-button"
      >
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script>
import { Reading, Search } from '@element-plus/icons-vue'

export default {
  name: 'Header',
  components: {
    Reading,
    Search
  },
  methods: {
    isActive(page) {
      const currentPath = this.$route.path
      if (page === 'prescriptions') {
        return currentPath === '/' || currentPath === '/prescriptions'
      } else if (page === 'doctors') {
        return currentPath === '/doctors'
      }
      return false
    },
    navigateTo(page) {
      this.$router.push(`/${page}`).catch(err => {
        console.error('导航失败:', err)
      })
    },
    handleLogout() {
      // 清除token
      localStorage.removeItem('token')
      // 跳转到登录页
      this.$router.push('/login').catch(err => {
        console.error('退出登录失败:', err)
      })
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.logo .el-icon {
  font-size: 24px;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-icon {
  font-size: 18px;
  cursor: pointer;
  color: #606266;
}

.logout-button {
  margin-left: 10px;
  color: #606266;
}

.logout-button:hover {
  color: #F56C6C;
}
</style>
