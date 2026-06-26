<template>
  <div class="login-new-container">
    <!-- 左侧装饰区域 -->
    <div class="login-left">
      <div class="left-content">
        <h1 class="app-title">中医验方宝典</h1>
        <p class="app-description">传承千年中医智慧，守护健康生活</p>
        <div class="decorative-icons">
          <el-icon class="icon-herb"><Menu /></el-icon>
          <el-icon class="icon-pill"><Setting /></el-icon>
          <el-icon class="icon-book"><Reading /></el-icon>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="login-card">
        <div class="card-header">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-subtitle">请输入您的账号和密码</p>
        </div>
        
        <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="top" class="login-form">
          <!-- 用户名输入 -->
          <el-form-item prop="username" class="form-item">
            <div class="input-wrapper">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入账号" 
                class="custom-input"
                :prefix-icon="User"
              ></el-input>
            </div>
          </el-form-item>
          
          <!-- 密码输入 -->
          <el-form-item prop="password" class="form-item">
            <div class="input-wrapper">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码" 
                class="custom-input"
                :prefix-icon="Lock"
                show-password
              ></el-input>
            </div>
          </el-form-item>
          
          <!-- 登录按钮 -->
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              @click="handleLogin" 
              class="login-btn"
              :loading="loading"
            >
              登录
              <el-icon class="btn-icon" v-if="!loading"><Right /></el-icon>
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 演示账号提示 -->
        <div class="demo-info">
          <el-icon class="info-icon"><WarningFilled /></el-icon>
          <span class="info-text">演示账号：任意账号密码均可登录</span>
        </div>
        
        <!-- 底部装饰 -->
        <div class="card-footer">
          <el-divider class="footer-divider"></el-divider>
          <div class="footer-text">© 2026 中医验方宝典 - 传承中医文化</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import { 
  Menu, 
  Setting, 
  Reading, 
  User, 
  Lock, 
  Right, 
  WarningFilled 
} from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

// 加载状态
const loading = ref(false)

// 登录表单引用
const loginFormRef = ref(null)

// 登录处理函数
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      request.post('/login', loginForm.value)
        .then(res => {
          if (res.code === 200) {
            localStorage.setItem('token', res.data.token)
            router.push('/').catch(err => {
              console.error('路由跳转失败:', err)
              ElMessage.error('登录成功，但跳转失败，请刷新页面')
            })
          } else {
            ElMessage.error(res.message)
          }
        })
        .catch(err => {
          ElMessage.error('登录失败，请检查网络或用户名密码')
          console.error('登录失败:', err)
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>

<style scoped>
.login-new-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 左侧装饰区域 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: fadeInLeft 0.6s ease-out;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.left-content {
  text-align: center;
  color: white;
  z-index: 1;
  max-width: 400px;
}

.app-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
  animation: slideUp 0.8s ease-out 0.2s both;
}

.app-description {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  animation: slideUp 0.8s ease-out 0.4s both;
}

.decorative-icons {
  display: flex;
  justify-content: space-around;
  animation: slideUp 0.8s ease-out 0.6s both;
}

.icon-herb, .icon-pill, .icon-book {
  font-size: 3rem;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.icon-herb:hover, .icon-pill:hover, .icon-book:hover {
  transform: scale(1.1) rotate(5deg);
}

/* 右侧登录表单 */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: fadeInRight 0.6s ease-out;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  padding: 2.5rem;
  animation: slideUp 0.8s ease-out 0.3s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0,0,0,0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #666;
  font-weight: 400;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 1.5rem;
}

/* 输入框样式 */
.input-wrapper {
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.input-wrapper:focus-within {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 移除自定义输入框样式，使用Element Plus默认样式 */
:deep(.el-input__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.el-input__inner) {
  background: transparent;
  border: none;
  height: 52px;
  font-size: 1rem;
  border-radius: 12px;
}

:deep(.el-input--prefix .el-input__inner) {
  padding-left: 1.5rem;
}

/* 移除输入框聚焦时的默认边框和阴影 */
:deep(.el-input__wrapper:focus-within) {
  box-shadow: none;
  border: none;
}

/* 按钮样式 */
.login-btn {
  width: 100%;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.login-btn:hover .btn-icon {
  transform: translateX(3px);
}

/* 演示信息 */
.demo-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  color: #856404;
  font-size: 0.85rem;
  animation: slideUp 0.8s ease-out 0.5s both;
}

.info-icon {
  color: #ffc107;
  font-size: 1rem;
}

/* 底部装饰 */
.card-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-divider {
  margin-bottom: 1rem;
}

.footer-text {
  color: #999;
  font-size: 0.8rem;
}

/* 动画效果 */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-30px, 30px) rotate(240deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-new-container {
    flex-direction: column;
  }
  
  .login-left {
    padding: 2rem;
    height: 30vh;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-description {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .icon-herb, .icon-pill, .icon-book {
    font-size: 2rem;
  }
  
  .login-card {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }
}
</style>