<template>
  <div class="prescriptions-container">
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
                <!-- 百度地图组件 -->
                <div ref="mapContainer" class="map-container"></div>
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

export default {
  name: 'Doctors',
  components: {
    User,
    Refresh
  },
  data() {
    return {
      activeTab: 'map',
      doctors: [],
      filteredDoctors: [],
      searchKeyword: '',
      selectedDoctor: null,
      // 百度地图配置
      mapInstance: null, // 地图实例
      markers: [], // 标记点数组
      infoWindow: null // 信息窗口实例
    }
  },
  created() {
    this.loadDoctors()
  },
  mounted() {
    // 在组件挂载后初始化地图
    this.loadBaiduMapScript()
  },
  methods: {
    async loadDoctors() {
      try {
        const res = await request.get('/doctors')
        this.doctors = res.data
        this.filteredDoctors = res.data
        // 如果地图已经初始化，更新标记点
        if (this.mapInstance) {
          this.updateMarkers()
        }
      } catch (error) {
        this.$message.error('加载医生信息失败')
      }
    },
    
    selectDoctor(doctor) {
      this.selectedDoctor = doctor
      // 显示信息窗口
      if (this.mapInstance && this.infoWindow) {
        const point = new window.BMapGL.Point(doctor.lng, doctor.lat)
        this.infoWindow.setContent(`
          <div class="info-window-content">
            <h4>${doctor.name}</h4>
            <p>${doctor.clinicName}</p>
            <p>${doctor.address}</p>
          </div>
        `)
        this.infoWindow.open(this.mapInstance, point)
      }
    },
    
    handleSearch() {
      this.filterDoctors()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.filteredDoctors = this.doctors
      this.selectedDoctor = null
      // 更新标记点
      this.updateMarkers()
    },
    
    filterDoctors() {
      if (!this.searchKeyword) {
        this.filteredDoctors = this.doctors
      } else {
        const keyword = this.searchKeyword.toLowerCase()
        this.filteredDoctors = this.doctors.filter(doctor => 
          doctor.name.toLowerCase().includes(keyword) ||
          doctor.clinicName.toLowerCase().includes(keyword) ||
          doctor.address.toLowerCase().includes(keyword)
        )
      }
      this.selectedDoctor = null
      // 更新标记点
      this.updateMarkers()
    },
    
    // 加载百度地图脚本
    loadBaiduMapScript() {
      // 检查百度地图API是否已加载
      if (window.BMapGL) {
        this.initMap()
        return
      }
      
      // 创建脚本标签
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://api.map.baidu.com/api?v=3.0&type=webgl&ak=wtLrV8MKKXRFGIo9LaL4EEfDtrbaYrZK&callback=initBaiduMap`
      document.head.appendChild(script)
      
      // 将初始化函数挂载到window对象上
      window.initBaiduMap = () => {
        this.initMap()
      }
    },
    
    // 初始化地图
    initMap() {
      // 创建地图实例
      this.mapInstance = new window.BMapGL.Map(this.$refs.mapContainer)
      // 设置地图中心点和缩放级别
      const point = new window.BMapGL.Point(116.404, 39.915)
      this.mapInstance.centerAndZoom(point, 12)
      
      // 添加地图控件
      this.mapInstance.addControl(new window.BMapGL.ScaleControl())
      this.mapInstance.addControl(new window.BMapGL.ZoomControl())
      
      // 启用鼠标滚轮缩放
      this.mapInstance.enableScrollWheelZoom(true)
      // 启用键盘缩放
      this.mapInstance.enableKeyboard(true)
      // 启用双击缩放
      this.mapInstance.enableDoubleClickZoom(true)
      // 启用拖拽
      this.mapInstance.enableDragging(true)
      // 设置缩放级别限制（3-18级）
      this.mapInstance.setMinZoom(3)
      this.mapInstance.setMaxZoom(18)
      
      // 创建信息窗口实例
      this.infoWindow = new window.BMapGL.InfoWindow('')
      
      // 添加标记点
      this.updateMarkers()
    },
    
    // 更新地图上的标记点
    updateMarkers() {
      if (!this.mapInstance) return
      
      // 清除现有的标记点
      this.markers.forEach(marker => {
        this.mapInstance.removeOverlay(marker)
      })
      this.markers = []
      
      // 添加新的标记点
      this.filteredDoctors.forEach(doctor => {
        const point = new window.BMapGL.Point(doctor.lng, doctor.lat)
        const marker = new window.BMapGL.Marker(point)
        
        // 添加点击事件
        marker.addEventListener('click', () => {
          this.selectDoctor(doctor)
        })
        
        this.mapInstance.addOverlay(marker)
        this.markers.push(marker)
      })
    }
  }
}
</script>

<style scoped>
/* 全局容器 */
.prescriptions-container {
  width: 100%;
  background-color: #f5f7fa;
}



/* 主要内容区域 */
.main-content {
  padding: 20px;
  overflow: hidden;
}

/* 内容区 */
.content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
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

/* 地图容器样式 */
.map-container {
  flex: 1;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

/* 信息窗口样式 */
.info-window-content {
  width: 200px;
}

.info-window-content h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.info-window-content p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

/* 旧的模拟地图样式，保留但隐藏 */
.map-placeholder {
  display: none;
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