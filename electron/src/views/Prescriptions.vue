<template>
  <div class="prescriptions-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧分类树 -->
      <div class="sidebar">
        <el-tree
          ref="tree"
          :data="categories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          :highlight-current="true"
          node-key="id"
          :expand-on-click-node="false"
        >
          <template #default="{ node, data }">
            <span class="tree-node-label" @click="toggleOperations(node, data)">
              {{ data.label }}
            </span>
            <span class="tree-node-operations">
              <el-button
                v-if="node.level < 2"
                type="text"
                size="small"
                @click.stop="handleAddChild(data, node)"
                title="添加子分类"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
              <el-button
                type="text"
                size="small"
                @click.stop="handleEdit(data, node)"
                title="编辑分类"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="text"
                size="small"
                @click.stop="handleDelete(data, node)"
                title="删除分类"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </span>
          </template>
        </el-tree>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="content">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="search-left">
            <el-button type="primary" @click="handleAddPrescription"><el-icon><Plus /></el-icon> 新增方剂</el-button>
          </div>
          <div class="search-right">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索方剂名称、病症或内容" 
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
            </el-input>
            <el-select v-model="searchForm.type" placeholder="按类型筛选" clearable>
              <el-option label="偏方" value="偏方"></el-option>
              <el-option label="验方" value="验方"></el-option>
            </el-select>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon></el-button>
          </div>
        </div>
        
        <!-- 方剂列表 -->
        <div class="prescriptions-table">
          <el-table :data="prescriptions" style="width: 100%">
            <el-table-column prop="type" label="类型" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.type === '验方' ? 'success' : 'info'" size="small">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="subCategory" label="病症" width="120"></el-table-column>
            <el-table-column prop="category" label="方剂名称" width="180"></el-table-column>
            <el-table-column prop="content" label="内容摘要" min-width="300">
              <template #default="scope">
                <div class="content-summary">{{ scope.row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="作者" width="120"></el-table-column>
            <el-table-column prop="notes" label="注意事项" min-width="200">
              <template #default="scope">
                <div class="content-summary">{{ scope.row.notes }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="120"></el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button type="text" size="small" @click="handleViewPrescription(scope.row)" title="查看详情">
                  <el-icon><Search /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="handleEditPrescription(scope.row)" title="编辑方剂">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="handleDeletePrescription(scope.row)" title="删除方剂">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.label" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 添加/编辑方剂对话框 -->
    <el-dialog
      v-model="prescriptionDialogVisible"
      :title="prescriptionDialogTitle"
      width="50%"
    >
      <el-form :model="prescriptionForm" label-width="100px">
        <el-form-item label="类型" required>
          <el-radio-group v-model="prescriptionForm.type">
            <el-radio label="验方">验方</el-radio>
            <el-radio label="偏方">偏方</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="一级分类" required>
          <el-select v-model="prescriptionForm.category" placeholder="请选择一级分类">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.label" 
              :value="category.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类" required>
          <el-select v-model="prescriptionForm.subCategory" placeholder="请选择二级分类">
            <template v-for="category in categories" :key="category.id">
              <el-option 
                v-for="subCategory in category.children" 
                :key="subCategory.id" 
                :label="subCategory.label" 
                :value="subCategory.label"
                v-if="prescriptionForm.category === category.label"
              ></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="方剂内容" required>
          <el-input 
            v-model="prescriptionForm.content" 
            placeholder="请输入方剂内容" 
            type="textarea" 
            :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="prescriptionForm.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="注意事项">
          <el-input 
            v-model="prescriptionForm.notes" 
            placeholder="请输入注意事项" 
            type="textarea" 
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="prescriptionForm.source" placeholder="请输入方剂来源"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="prescriptionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePrescriptionDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'
import { Edit, Delete, Plus, User, Search, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'Prescriptions',
  components: {
    Edit,
    Delete,
    Plus,
    User,
    Search,
    Refresh
  },
  data() {
    return {
      categories: [],
      prescriptions: [],
      allPrescriptions: [],
      searchKeyword: '',
      searchForm: {
        type: ''
      },
      currentCategory: '',
      currentSubCategory: '',
      defaultProps: {
        children: 'children',
        label: 'label',
        id: 'id'
      },
      // 分类对话框
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: '',
        label: '',
        parentId: null
      },
      currentNode: null,
      currentData: null,
      isAdd: false,
      selectedNode: null,
      selectedNodeData: null,
      currentNodeKey: null,
      currentOperationsNode: null,
      // 方剂对话框
      prescriptionDialogVisible: false,
      prescriptionDialogTitle: '',
      prescriptionForm: {
        id: '',
        type: '验方',
        category: '',
        subCategory: '',
        content: '',
        author: '',
        notes: '',
        source: ''
      },
      isPrescriptionAdd: false
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
      // 更新选中节点信息
      this.selectedNode = node
      this.selectedNodeData = data
      this.currentNodeKey = data.label

      // 筛选方子
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
    
    toggleOperations(node, data) {
      // 点击节点时切换操作图标显示状态
      if (this.currentOperationsNode === node) {
        this.currentOperationsNode = null
      } else {
        this.currentOperationsNode = node
      }
    },
    
    handleSearch() {
      this.filterPrescriptions()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.searchForm.type = ''
      this.currentCategory = ''
      this.currentSubCategory = ''
      this.prescriptions = this.allPrescriptions
      // 重置树形结构选中状态
      this.$refs.tree.setCurrentKey(null)
      this.currentNodeKey = null
    },
    
    filterPrescriptions() {
      let filtered = this.allPrescriptions
      
      // 按搜索关键字筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(item => 
          item.content.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword) ||
          item.subCategory.toLowerCase().includes(keyword)
        )
      }
      
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
    },

    // 添加根分类
    handleAddRoot() {
      this.dialogTitle = '添加分类'
      this.form = { id: '', label: '', parentId: null }
      this.currentNode = null
      this.currentData = null
      this.isAdd = true
      this.dialogVisible = true
    },

    // 添加子分类
    handleAddChild(data, node) {
      this.dialogTitle = '添加子分类'
      this.form = { id: '', label: '', parentId: data.id }
      this.currentNode = node
      this.currentData = data
      this.isAdd = true
      this.dialogVisible = true
    },

    // 编辑分类
    handleEdit(data, node) {
      this.dialogTitle = '编辑分类'
      this.form = { id: data.id, label: data.label, parentId: data.parentId || null }
      this.currentNode = node
      this.currentData = data
      this.isAdd = false
      this.dialogVisible = true
    },

    // 删除分类
    handleDelete(data, node) {
      this.$confirm('确定要删除该分类吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端删除接口
        request.delete(`/categories/${data.id}`).then(res => {
          this.$message.success('删除成功')
          // 重新加载分类数据
          this.loadCategories()
          // 重置选中状态
          this.currentNodeKey = null
          // 重置筛选条件
          this.handleReset()
        }).catch(err => {
          this.$message.error(err.message || '删除失败，请稍后重试')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 对话框确定按钮
    handleDialogConfirm() {
      if (!this.form.label.trim()) {
        this.$message.error('请输入分类名称')
        return
      }

      if (this.isAdd) {
        // 添加操作
        const params = {
          parentId: this.form.parentId,
          label: this.form.label
        }
        
        // 调用后端添加接口
        request.post('/categories', params).then(res => {
          if (res.code === 200) {
            this.$message.success('添加成功')
            this.dialogVisible = false
            // 重新加载分类数据
            this.loadCategories()
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          this.$message.error('添加失败，请稍后重试')
        })
      } else {
        // 编辑操作
        const params = {
          id: this.form.id,
          label: this.form.label
        }
        
        // 调用后端编辑接口
        request.put('/categories', params).then(res => {
          if (res.code === 200) {
            this.$message.success('编辑成功')
            this.dialogVisible = false
            // 重新加载分类数据
            this.loadCategories()
            // 重新加载方子数据
            this.loadPrescriptions()
          } else {
            this.$message.error(res.message)
          }
        }).catch(err => {
          this.$message.error('编辑失败，请稍后重试')
        })
      }
    },
    
    // 查看方剂详情
    handleViewPrescription(row) {
      this.$message.info('查看方剂详情功能开发中')
      // 这里可以添加查看方剂详情的逻辑，例如打开详情对话框
    },
    
    // 编辑方剂
    handleEditPrescription(row) {
      this.prescriptionDialogTitle = '编辑方剂'
      this.prescriptionForm = {
        id: row.id,
        type: row.type,
        category: row.category,
        subCategory: row.subCategory,
        content: row.content,
        author: row.author,
        notes: row.notes,
        source: row.source
      }
      this.isPrescriptionAdd = false
      this.prescriptionDialogVisible = true
    },
    
    // 新增方剂
    handleAddPrescription() {
      this.prescriptionDialogTitle = '新增方剂'
      this.prescriptionForm = {
        id: '',
        type: '验方',
        category: '',
        subCategory: '',
        content: '',
        author: '',
        notes: '',
        source: ''
      }
      this.isPrescriptionAdd = true
      this.prescriptionDialogVisible = true
    },
    
    // 方剂对话框确定按钮
    handlePrescriptionDialogConfirm() {
      // 表单验证
      if (!this.prescriptionForm.type) {
        this.$message.error('请选择方剂类型')
        return
      }
      if (!this.prescriptionForm.category) {
        this.$message.error('请选择一级分类')
        return
      }
      if (!this.prescriptionForm.subCategory) {
        this.$message.error('请选择二级分类')
        return
      }
      if (!this.prescriptionForm.content.trim()) {
        this.$message.error('请输入方剂内容')
        return
      }
      
      if (this.isPrescriptionAdd) {
        // 新增操作
        request.post('/prescriptions', this.prescriptionForm).then(res => {
          this.$message.success('新增成功')
          this.prescriptionDialogVisible = false
          // 重新加载方剂数据
          this.loadPrescriptions()
        }).catch(err => {
          this.$message.error(err.message || '新增失败，请稍后重试')
        })
      } else {
        // 编辑操作
        request.put(`/prescriptions/${this.prescriptionForm.id}`, this.prescriptionForm).then(res => {
          this.$message.success('编辑成功')
          this.prescriptionDialogVisible = false
          // 重新加载方剂数据
          this.loadPrescriptions()
        }).catch(err => {
          this.$message.error(err.message || '编辑失败，请稍后重试')
        })
      }
    },
    
    // 删除方剂
    handleDeletePrescription(row) {
      this.$confirm('确定要删除该方剂吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端删除接口
        request.delete(`/prescriptions/${row.id}`).then(res => {
          this.$message.success('删除成功')
          // 重新加载方剂数据
          this.loadPrescriptions()
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
  width: 100%;
}

:deep(.el-tree-node__content) {
  padding: 6px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

/* 自定义节点样式 */
.tree-node-label {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex: 1;
}

.tree-node-label:hover {
  background-color: #f0f0f0;
}

/* 操作图标样式 */
.tree-node-operations {
  display: none;
  gap: 1px;
  margin-left: auto;
  padding-left: 5px;
}

:deep(.el-tree-node__content:hover) .tree-node-operations {
  display: flex;
}

:deep(.tree-node-operations .el-button) {
  padding: 2px 3px;
  margin: 0;
  font-size: 11px;
  line-height: 1;
  min-width: auto;
  height: auto;
}

:deep(.tree-node-operations .el-icon) {
  font-size: 13px;
  display: inline-block;
  vertical-align: middle;
}

/* 移除按钮默认边框和背景 */
:deep(.tree-node-operations .el-button--text) {
  border: none;
  background: transparent;
  color: #606266;
}

:deep(.tree-node-operations .el-button--text:hover) {
  color: #409EFF;
  background: transparent;
  border: none;
}

/* 表格操作列样式 */
:deep(.el-table__column--selection .el-table__cell) {
  padding: 8px 0;
}

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
}

:deep(.el-table .el-button--text .el-icon) {
  font-size: 14px;
  vertical-align: middle;
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
  justify-content: space-between;
}

.search-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

:deep(.el-select) {
  width: 120px;
}

/* 方剂列表 */
.prescriptions-table {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.el-table) {
  border: none;
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

/* 内容摘要样式 */
.content-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
</style>