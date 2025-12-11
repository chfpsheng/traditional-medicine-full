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
      <el-button type="primary" plain size="small">批量地址上传</el-button>
      <el-icon class="search-icon"><Search /></el-icon>
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
</style>
