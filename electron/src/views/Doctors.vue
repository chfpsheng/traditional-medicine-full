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
          <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
            <el-tab-pane label="地图视图" name="map">
              <div class="map-wrapper">
                <!-- 百度地图组件 -->
                <div ref="mapContainer" class="map-container"></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="表格视图" name="table">
              <div class="table-wrapper">
                <div class="table-header" style="margin-bottom: 10px; display: flex; justify-content: flex-end;">
                  <el-button type="primary" @click="handleAddDoctor" v-if="activeTab === 'table'"><el-icon><Plus /></el-icon> 新增医生</el-button>
                </div>
                <el-table :data="filteredDoctors" style="width: 100%">
                  <el-table-column prop="name" label="姓名" width="100"></el-table-column>
                  <el-table-column prop="clinicName" label="诊所名称" width="150"></el-table-column>
                  <el-table-column prop="region" label="省市" width="150"></el-table-column>
                  <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
                  <el-table-column prop="specialize" label="擅长" min-width="150"></el-table-column>
                  <el-table-column prop="introduction" label="简介" min-width="200" show-overflow-tooltip>
                    <template #default="scope">
                      {{ scope.row.introduction || '暂无简介' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="scope">
                      <el-button type="text" size="small" @click="handleEditDoctor(scope.row)" title="编辑医生">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button type="text" size="small" @click="handleDeleteDoctor(scope.row)" title="删除医生">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 编辑医生对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" placeholder="请输入医生姓名"></el-input>
      </el-form-item>
      <el-form-item label="诊所名称">
        <el-input v-model="form.clinicName" placeholder="请输入诊所名称"></el-input>
      </el-form-item>
      <el-form-item label="省市">
        <el-cascader
          v-model="form.region"
          :options="regionOptions"
          :props="regionProps"
          placeholder="请选择省份和城市"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="地址" required>
        <el-input v-model="form.address" placeholder="请输入详细地址"></el-input>
      </el-form-item>
      <el-form-item label="擅长">
        <el-input v-model="form.specialize" placeholder="请输入医生擅长领域"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <el-input 
          v-model="form.introduction" 
          placeholder="请输入医生简介" 
          type="textarea" 
          :rows="3" 
          :maxlength="256" 
          show-word-limit
        ></el-input>
      </el-form-item>
      <!-- 经纬度输入框，不显示，通过地址自动获取 -->
      <el-input v-model="form.lng" type="hidden"></el-input>
      <el-input v-model="form.lat" type="hidden"></el-input>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import request from '../utils/request'
import { User, Refresh, Edit, Delete, Plus } from '@element-plus/icons-vue'

export default {
  name: 'Doctors',
  components: {
    User,
    Refresh,
    Edit,
    Delete,
    Plus
  },
  data() {
    return {
      activeTab: 'map',
      doctors: [],
      filteredDoctors: [],
      searchKeyword: '',
      selectedDoctor: null,
      // 省市数据（级联选择器格式）
      regionOptions: [
        { label: '北京市', value: '北京市', children: [{ label: '北京市', value: '北京市' }] },
        { label: '上海市', value: '上海市', children: [{ label: '上海市', value: '上海市' }] },
        { label: '天津市', value: '天津市', children: [{ label: '天津市', value: '天津市' }] },
        { label: '重庆市', value: '重庆市', children: [{ label: '重庆市', value: '重庆市' }] },
        { label: '四川省', value: '四川省', children: [
          { label: '成都市', value: '成都市' },
          { label: '绵阳市', value: '绵阳市' },
          { label: '德阳市', value: '德阳市' },
          { label: '自贡市', value: '自贡市' },
          { label: '泸州市', value: '泸州市' },
          { label: '内江市', value: '内江市' },
          { label: '乐山市', value: '乐山市' },
          { label: '南充市', value: '南充市' },
          { label: '宜宾市', value: '宜宾市' },
          { label: '达州市', value: '达州市' },
          { label: '雅安市', value: '雅安市' },
          { label: '广安市', value: '广安市' },
          { label: '遂宁市', value: '遂宁市' },
          { label: '眉山市', value: '眉山市' },
          { label: '凉山彝族自治州', value: '凉山彝族自治州' },
          { label: '甘孜藏族自治州', value: '甘孜藏族自治州' },
          { label: '阿坝藏族羌族自治州', value: '阿坝藏族羌族自治州' },
          { label: '攀枝花市', value: '攀枝花市' },
          { label: '广元市', value: '广元市' },
          { label: '巴中市', value: '巴中市' },
          { label: '资阳市', value: '资阳市' }
        ]},
        { label: '广东省', value: '广东省', children: [
          { label: '广州市', value: '广州市' },
          { label: '深圳市', value: '深圳市' },
          { label: '东莞市', value: '东莞市' },
          { label: '佛山市', value: '佛山市' },
          { label: '中山市', value: '中山市' },
          { label: '珠海市', value: '珠海市' },
          { label: '汕头市', value: '汕头市' },
          { label: '惠州市', value: '惠州市' },
          { label: '江门市', value: '江门市' },
          { label: '湛江市', value: '湛江市' },
          { label: '肇庆市', value: '肇庆市' },
          { label: '茂名市', value: '茂名市' },
          { label: '揭阳市', value: '揭阳市' },
          { label: '清远市', value: '清远市' },
          { label: '韶关市', value: '韶关市' },
          { label: '阳江市', value: '阳江市' },
          { label: '梅州市', value: '梅州市' },
          { label: '汕尾市', value: '汕尾市' },
          { label: '河源市', value: '河源市' },
          { label: '潮州市', value: '潮州市' },
          { label: '云浮市', value: '云浮市' }
        ]},
        { label: '江苏省', value: '江苏省', children: [
          { label: '南京市', value: '南京市' },
          { label: '苏州市', value: '苏州市' },
          { label: '无锡市', value: '无锡市' },
          { label: '常州市', value: '常州市' },
          { label: '南通市', value: '南通市' },
          { label: '徐州市', value: '徐州市' },
          { label: '连云港市', value: '连云港市' },
          { label: '淮安市', value: '淮安市' },
          { label: '盐城市', value: '盐城市' },
          { label: '扬州市', value: '扬州市' },
          { label: '泰州市', value: '泰州市' },
          { label: '宿迁市', value: '宿迁市' },
          { label: '镇江市', value: '镇江市' }
        ]}
      ],
      // 级联选择器配置
      regionProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true
      },
      // 编辑对话框配置
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: '',
        name: '',
        clinicName: '',
        region: [], // 级联选择器的值，格式为 [省份, 城市]
        address: '',
        specialize: '',
        introduction: '',
        lng: 0,
        lat: 0
      },
      isAdd: false,
      // 百度地图配置
      mapInstance: null, // 地图实例
      markers: [], // 标记点数组
      scriptLoaded: false, // 百度地图脚本是否已加载
      initMapCalled: false // 初始化地图函数是否已调用
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
      console.log('selectDoctor called:', doctor)
      this.selectedDoctor = doctor
      // 显示信息窗口
      console.log('mapInstance:', this.mapInstance)
      
      // 确保地图实例和BMapGL对象都存在
      if (!this.mapInstance) {
        console.error('Map instance not found')
        return
      }
      
      if (!window.BMapGL) {
        console.error('BMapGL not loaded')
        return
      }
      
      try {
        // 使用BMapGL.Point创建点
        const point = new window.BMapGL.Point(doctor.lng, doctor.lat)
        console.log('Created point:', point)
        
        // 使用BMapGL.InfoWindow创建信息窗口
        const infoWindow = new window.BMapGL.InfoWindow('')
        console.log('Created infoWindow:', infoWindow)
        console.log('InfoWindow prototype:', Object.getPrototypeOf(infoWindow))
        console.log('InfoWindow methods:', Object.getOwnPropertyNames(infoWindow))
        
        // 设置信息窗口内容
        infoWindow.setContent(`
          <div class="info-window-content">
            <h4>${doctor.name}</h4>
            ${doctor.clinicName ? `<p><strong>诊所名称：</strong>${doctor.clinicName}</p>` : ''}
            <p><strong>地址：</strong>${doctor.address}</p>
            ${doctor.specialize ? `<p><strong>擅长：</strong>${doctor.specialize}</p>` : ''}
            ${doctor.introduction ? `<p><strong>简介：</strong>${doctor.introduction}</p>` : ''}
          </div>
        `)
        
        // 直接调用open方法
        console.log('Calling infoWindow.open()')
        infoWindow.open(this.mapInstance, point)
      } catch (error) {
        console.error('Error in selectDoctor:', error)
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
      // 确保只加载一次脚本
      if (this.scriptLoaded) return
      
      // 创建脚本标签
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://api.map.baidu.com/api?v=3.0&type=webgl&ak=wtLrV8MKKXRFGIo9LaL4EEfDtrbaYrZK&callback=initBaiduMap`
      document.head.appendChild(script)
      
      // 将初始化函数挂载到window对象上
      const that = this
      window.initBaiduMap = () => {
        that.scriptLoaded = true
        that.initMap()
      }
      
      this.scriptLoaded = true
    },
    
    // 初始化地图
    initMap() {
      console.log('initMap called, mapContainer:', this.$refs.mapContainer)
      // 确保地图容器存在
      if (!this.$refs.mapContainer) {
        console.error('Map container not found!')
        return
      }
      
      try {
        // 创建地图实例
        this.mapInstance = new window.BMapGL.Map(this.$refs.mapContainer)
        console.log('Map instance created:', this.mapInstance)
        
        // 设置地图中心点和缩放级别为成都天府广场
        const point = new window.BMapGL.Point(104.065850, 30.657361)
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
        
        // 添加标记点
        this.updateMarkers()
        this.initMapCalled = true
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    },
    
    // 更新地图上的标记点
    updateMarkers() {
      console.log('updateMarkers called, mapInstance:', this.mapInstance)
      if (!this.mapInstance) return
      
      // 清除现有的标记点
      this.markers.forEach(marker => {
        this.mapInstance.removeOverlay(marker)
      })
      this.markers = []
      
      console.log('Adding markers for doctors:', this.filteredDoctors)
      // 添加新的标记点
      this.filteredDoctors.forEach(doctor => {
        const point = new window.BMapGL.Point(doctor.lng, doctor.lat)
        const marker = new window.BMapGL.Marker(point)
        
        // 添加点击事件
        marker.addEventListener('click', () => {
          console.log('Marker clicked:', doctor)
          this.selectDoctor(doctor)
        })
        
        this.mapInstance.addOverlay(marker)
        this.markers.push(marker)
      })
    },
    
    // 添加医生
    handleAddDoctor() {
      this.dialogTitle = '添加医生'
      this.form = {
        id: '',
        name: '',
        clinicName: '',
        region: [],
        address: '',
        specialize: '',
        introduction: '',
        lng: 104.065850,
        lat: 30.657361
      }
      this.isAdd = true
      this.dialogVisible = true
    },
    
    // 编辑医生
    handleEditDoctor(row) {
      console.log(222222, row)
      this.dialogTitle = '编辑医生'
      // 构建级联选择器的region值
      const region = []
      // 如果row.region存在，解析省份和城市
      if (row.region) {
        // 简单处理，假设region格式为"省份城市"
        // 实际应用中可能需要更复杂的解析逻辑
        const provincePattern = /^(北京市|上海市|天津市|重庆市|四川省|广东省|江苏省)/
        const provinceMatch = row.region.match(provincePattern)
        if (provinceMatch) {
          region.push(provinceMatch[1])
          // 提取城市部分
          const city = row.region.replace(provinceMatch[1], '')
          if (city) {
            region.push(city)
          }
        }
      }
      
      this.form = {
        id: row.id,
        name: row.name,
        clinicName: row.clinicName,
        region: region,
        address: row.address,
        specialize: row.specialize,
        introduction: row.introduction || '',
        lng: row.lng,
        lat: row.lat
      }
      this.isAdd = false
      this.dialogVisible = true
    },
    
    // 对话框确定按钮
    handleDialogConfirm() {
      // 表单验证
      if (!this.form.name.trim()) {
        this.$message.error('请输入医生姓名')
        return
      }
      if (!this.form.address.trim()) {
        this.$message.error('请输入诊所地址')
        return
      }
      
      // 构建完整地址用于地理编码
      let fullAddress = this.form.address
      if (this.form.region && this.form.region.length > 0) {
        fullAddress = `${this.form.region.join('')}${fullAddress}`
      }
      
      // 使用百度地图API进行地理编码获取经纬度
      const geocoder = new window.BMapGL.Geocoder()
      geocoder.getPoint(fullAddress, (point) => {
        if (point) {
          // 获取到经纬度，赋值给form
          this.form.lng = point.lng
          this.form.lat = point.lat
          
          // 构建请求数据，将region数组转换为字符串
          const requestData = {
            ...this.form,
            region: this.form.region.join('') // 将省份和城市合并为一个字符串，如"四川省成都市"
          }
          
          if (this.isAdd) {
            // 添加操作
            request.post('/doctors', requestData).then(res => {
              this.$message.success('添加成功')
              this.dialogVisible = false
              // 重新加载医生数据
              this.loadDoctors()
            }).catch(err => {
              this.$message.error(err.message || '添加失败，请稍后重试')
            })
          } else {
            // 编辑操作
            request.put(`/doctors/${this.form.id}`, requestData).then(res => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              // 重新加载医生数据
              this.loadDoctors()
            }).catch(err => {
              this.$message.error(err.message || '编辑失败，请稍后重试')
            })
          }
        } else {
          // 地理编码失败
          this.$message.error('无法获取地址的经纬度，请检查地址是否正确')
        }
      }, '')
    },
    
    // 删除医生
    handleTabChange(tab) {
      console.log('Tab changed to:', tab)
      if (tab === 'map') {
        // 当切换到地图视图时，等待下一帧确保容器已渲染
        console.log('Switching to map view, preparing to initialize map...')
        this.$nextTick(() => {
          console.log('Next tick, mapContainer:', this.$refs.mapContainer)
          // 重新初始化地图，确保容器引用正确
          this.mapInstance = null
          this.loadBaiduMapScript()
        })
      }
    },
    
    handleDeleteDoctor(row) {
      this.$confirm('确定要删除该医生吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端删除接口
        request.delete(`/doctors/${row.id}`).then(res => {
          this.$message.success('删除成功')
          // 重新加载医生数据
          this.loadDoctors()
        }).catch(err => {
          this.$message.error(err.message || '删除失败，请稍后重试')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
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
  height: calc(100vh - 200px);
  overflow: hidden;
}

/* 地图容器样式 */
.map-container {
  width: 100%;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

/* 信息窗口样式 */
.info-window-content {
  width: 300px;
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

/* 表格操作列样式 */
:deep(.el-table__column--selection .el-button) {
  display: inline-block;
  margin: 0;
  padding: 0 4px;
  line-height: 1;
}

:deep(.el-table .el-button--text) {
  display: inline-block;
  margin: 0 1px;
  padding: 4px 5px;
  line-height: 1;
  min-width: auto;
  height: auto;
  vertical-align: middle;
}

:deep(.el-table .el-button--text .el-icon) {
  font-size: 14px;
  vertical-align: middle;
}

/* 确保操作列单元格内容在同一行 */
:deep(.el-table__cell--right) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table__cell--fixed-right) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>