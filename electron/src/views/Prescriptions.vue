<template>
  <div class="prescriptions-container">
    <div class="search-bar">
      <el-select v-model="searchForm.type" placeholder="按类型搜索" clearable>
        <el-option label="偏方" value="偏方"></el-option>
        <el-option label="验方" value="验方"></el-option>
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    
    <div class="content-wrapper">
      <div class="tree-container">
        <h3>病症分类</h3>
        <el-tree
          ref="tree"
          :data="categories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          :default-expanded-keys="['内科', '外科', '妇科', '儿科']"
        ></el-tree>
      </div>
      
      <div class="table-container">
        <h3>方子列表</h3>
        <el-table :data="prescriptions" style="width: 100%">
          <el-table-column prop="type" label="类型" width="100"></el-table-column>
          <el-table-column prop="category" label="大分类" width="100"></el-table-column>
          <el-table-column prop="subCategory" label="小分类" width="100"></el-table-column>
          <el-table-column prop="content" label="内容" min-width="200"></el-table-column>
          <el-table-column prop="note" label="注意事项" min-width="150"></el-table-column>
          <el-table-column prop="source" label="来源" min-width="100"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Prescriptions',
  data() {
    return {
      categories: [],
      prescriptions: [],
      allPrescriptions: [],
      searchForm: {
        type: ''
      },
      currentCategory: '',
      currentSubCategory: '',
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  created() {
    this.loadCategories()
    this.loadPrescriptions()
  },
  methods: {
    async loadCategories() {
      try {
        const res = await request.get('/categories')
        this.categories = res.data
      } catch (error) {
        this.$message.error('加载分类失败')
      }
    },
    
    async loadPrescriptions() {
      try {
        const res = await request.get('/prescriptions')
        this.prescriptions = res.data
        this.allPrescriptions = res.data
      } catch (error) {
        this.$message.error('加载方子失败')
      }
    },
    
    handleNodeClick(data, node) {
      if (node.level === 1) {
        // 点击的是一级分类（如内科、外科）
        this.currentCategory = data.label
        this.currentSubCategory = ''
        this.filterPrescriptions()
      } else if (node.level === 2) {
        // 点击的是二级分类（如感冒、咳嗽）
        this.currentSubCategory = data.label
        // 获取父节点的label作为一级分类
        this.currentCategory = node.parent.data.label
        this.filterPrescriptions()
      }
    },
    
    handleSearch() {
      this.filterPrescriptions()
    },
    
    handleReset() {
      this.searchForm.type = ''
      this.currentCategory = ''
      this.currentSubCategory = ''
      this.prescriptions = this.allPrescriptions
      // 重置树形结构选中状态
      this.$refs.tree.setCurrentKey(null)
    },
    
    filterPrescriptions() {
      let filtered = this.allPrescriptions
      
      // 按类型筛选
      if (this.searchForm.type) {
        filtered = filtered.filter(item => item.type === this.searchForm.type)
      }
      
      // 按一级分类筛选
      if (this.currentCategory) {
        filtered = filtered.filter(item => item.category === this.currentCategory)
      }
      
      // 按二级分类筛选
      if (this.currentSubCategory) {
        filtered = filtered.filter(item => item.subCategory === this.currentSubCategory)
      }
      
      this.prescriptions = filtered
    }
  }
}
</script>

<style scoped>
.prescriptions-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.tree-container {
  width: 250px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}

.tree-container h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.table-container {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

:deep(.el-table) {
  flex: 1;
  overflow: auto;
}
</style>