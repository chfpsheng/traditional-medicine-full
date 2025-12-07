<template>
  <div class="doctors-container">
    <div class="tab-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="地图视图" name="map">
          <div class="map-wrapper">
            <div class="map-placeholder">
              <h3>地图视图</h3>
              <p>由于环境限制，这里显示模拟地图效果</p>
              <div class="doctor-markers">
                <div 
                  v-for="doctor in doctors" 
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
            <el-table :data="doctors" style="width: 100%">
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
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Doctors',
  data() {
    return {
      activeTab: 'map',
      doctors: [],
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
      } catch (error) {
        this.$message.error('加载医生信息失败')
      }
    },
    
    selectDoctor(doctor) {
      this.selectedDoctor = doctor
    }
  }
}
</script>

<style scoped>
.doctors-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-container {
  height: calc(100vh - 200px);
  overflow: hidden;
}

.map-wrapper {
  display: flex;
  gap: 20px;
  height: calc(100vh - 250px);
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

.table-wrapper {
  height: calc(100vh - 250px);
  overflow: auto;
}

:deep(.el-table) {
  height: 100%;
}
</style>