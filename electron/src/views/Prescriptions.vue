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
        <div class="tree-header">
          <h3>病症分类</h3>
          <div class="tree-actions">
            <el-tooltip content="添加分类" placement="top">
              <el-button type="primary" size="small" @click="handleAddRoot">
                <el-icon><Plus /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <el-tree
          ref="tree"
          :data="categories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          :highlight-current="true"
          current-node-key="currentNodeKey"
          node-key="id"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ data.label }}</span>
              <span v-if="data.label === currentNodeKey">
                <el-tooltip content="添加子节点" placement="top">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="() => handleAddChild(data, node)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="编辑节点" placement="top">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="() => handleEdit(data, node)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除节点" placement="top">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="() => handleDelete(data, node)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </span>
            </span>
          </template>
        </el-tree>

        <!-- 添加/编辑对话框 -->
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
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

export default {
  name: 'Prescriptions',
  components: {
    Edit,
    Delete,
    Plus
  },
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
        label: 'label',
        id: 'id'
      },
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
      currentNodeKey: null
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
      this.currentNodeKey = null
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

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.tree-actions {
  display: flex;
  gap: 5px;
}

.custom-tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.custom-tree-node span {
  flex: 1;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-tree-node .el-button {
  padding: 4px 6px;
  font-size: 12px;
  margin-left: 2px;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 0 8px;
}

:deep(.el-tree-node__label) {
  flex: 1;
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