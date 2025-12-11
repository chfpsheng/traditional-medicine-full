<template>
  <div class="prescriptions-container">
    <!-- 公共顶部导航栏 -->
    <Header />
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 内容区 -->
      <div class="content">
        <!-- 搜索栏 -->
        <div class="search-section">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索医生姓名、诊所或地址" 
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
          </el-input>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon></el-button>
        </div>
        
        <!-- 医生列表 -->
        <div class="doctors-content">
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="地图视图" name="map">
              <div class="map-wrapper">
                <div class="map-placeholder">
                  <h3>地图视图</h3>
                  <p>由于环境限制，这里显示模拟地图效果</p>
                  <div class="doctor-markers">
                    <div 
                      v-for="doctor in filteredDoctors" 
                      :key="doctor.id"
                      class="doctor-marker"
                      @click="selectDoctor(doctor)"
                    >
                      <div class="marker-content">
                        <h4>{{ doctor.name }}</h4>
                        <p>{{ doctor.clinicName }}</p>
                        <p>{{ doctor.address }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="doctor-detail" v-if="selectedDoctor">
                  <h3>医生详情</h3>
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="姓名">{{ selectedDoctor.name }}</el-descriptions-item>
                    <el-descriptions-item label="诊所名称">{{ selectedDoctor.clinicName }}</el-descriptions-item>
                    <el-descriptions-item label="地址">{{ selectedDoctor.address }}</el-descriptions-item>
                    <el-descriptions-item label="擅长">{{ selectedDoctor.specialize }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="表格视图" name="table">
              <div class="table-wrapper">
                <el-table :data="filteredDoctors" style="width: 100%">
                  <el-table-column prop="name" label="姓名" width="100"></el-table-column>
                  <el-table-column prop="clinicName" label="诊所名称" width="150"></el-table-column>
                  <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
                  <el-table-column prop="specialize" label="擅长" min-width="150"></el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'
import { User, Refresh } from '@element-plus/icons-vue'
import Header from '../components/Header.vue'

export default {
  name: 'Doctors',
  components: {
    User,
    Refresh,
    Header
  },
  data() {
    return {
      activeTab: 'map',
      doctors: [],
      filteredDoctors: [],
      searchKeyword: '',
      selectedDoctor: null
    }
  },
  created() {
    this.loadDoctors()
  },
  methods: {
    async loadDoctors() {
      try {
        const res = await request.get('/doctors')
        this.doctors = res.data
        this.filteredDoctors = res.data
      } catch (error) {
        this.$message.error('加载医生信息失败')
      }
    },
    
    selectDoctor(doctor) {
      this.selectedDoctor = doctor
    },
    
    handleSearch() {
      this.filterDoctors()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.filteredDoctors = this.doctors
      this.selectedDoctor = null
    },
    
    filterDoctors() {
      if (!this.searchKeyword) {
        this.filteredDoctors = this.doctors
        return
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      this.filteredDoctors = this.doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(keyword) ||
        doctor.clinicName.toLowerCase().includes(keyword) ||
        doctor.address.toLowerCase().includes(keyword)
      )
      this.selectedDoctor = null
    }
  }
}
</script>

<style scoped>
/* 全局容器 */
.prescriptions-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}



/* 主要内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧分类树 */
.sidebar {
  width: 180px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  padding: 20px 0;
}

.sidebar-title {
  margin: 0 20px 15px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 树节点样式 */
:deep(.el-tree) {
  background-color: transparent;
}

:deep(.el-tree-node__content) {
  padding: 6px 20px;
}

:deep(.el-tree-node__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409EFF;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__label) {
  color: #409EFF;
}

/* 右侧内容区 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 搜索栏 */
.search-section {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

:deep(.el-select) {
  width: 120px;
}

/* 医生内容 */
.doctors-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 地图视图 */
.map-wrapper {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.map-placeholder {
  flex: 1;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: auto;
}

.map-placeholder h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.map-placeholder p {
  margin: 0 0 30px 0;
  color: #909399;
}

.doctor-markers {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.doctor-marker {
  width: 200px;
  padding: 15px;
  background-color: #fff;
  border: 2px solid #409eff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.doctor-marker:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  border-color: #66b1ff;
}

.marker-content h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.marker-content p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.doctor-detail {
  width: 300px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  overflow-y: auto;
}

.doctor-detail h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

/* 表格视图 */
.table-wrapper {
  height: calc(100vh - 200px);
  overflow: auto;
}

:deep(.el-table) {
  height: 100%;
}

:deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

:deep(.el-table__header th) {
  font-weight: bold;
  background-color: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-table__body td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table__row:hover > td) {
  background-color: #f5f7fa;
}
</style>