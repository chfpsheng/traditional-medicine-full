<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <el-icon class="logo-icon"><Reading /></el-icon>
      </div>
      <h1 class="title">中医验方宝典</h1>
      <p class="subtitle">登录您的账户以继续</p>
      <el-form ref="loginForm" :model="loginForm" :rules="rules" label-position="top" label-width="0px">
        <el-form-item prop="username" class="form-item">
          <el-input v-model="loginForm.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password" class="form-item">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item class="form-item">
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <p class="hint">演示账号：任意账号密码均可登录</p>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'
import { Reading } from '@element-plus/icons-vue'

export default {
  components: {
    Reading
  },
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          request.post('/login', this.loginForm).then(res => {
            if (res.code === 200) {
              localStorage.setItem('token', res.data.token)
              this.$router.push('/').catch(err => {
                console.error('路由跳转失败:', err)
                this.$message.error('登录成功，但跳转失败，请刷新页面')
              })
            } else {
              this.$message.error(res.message)
            }
          }).catch(err => {
            this.$message.error('登录失败，请检查网络或用户名密码')
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: Arial, sans-serif;
}

.login-form {
  width: 455px;
  padding: 40px 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 60px;
  color: #4CAF50;
}

.title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.subtitle {
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.form-item {
  width: 100%;
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:focus-within) {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

:deep(.el-input__inner) {
  border: none;
  background-color: transparent;
  height: 58px;
  font-size: 18px;
}

.login-btn {
  width: 100%;
  height: 58px;
  border-radius: 6px;
  background-color: #4CAF50;
  border: none;
  font-size: 21px;
  font-weight: bold;
  color: #fff;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #45a049;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.login-btn:active {
  background-color: #3d8b40;
}

.hint {
  margin: 20px 0 0 0;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>