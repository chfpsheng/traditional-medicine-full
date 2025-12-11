const mongoose = require('mongoose');

// MongoDB连接字符串
const mongoURI = 'mongodb://localhost:27017/traditional-medicine';

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

module.exports = connectDB;