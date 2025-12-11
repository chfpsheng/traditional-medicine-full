const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// 引入模型
const User = require('./models/User');
const Prescription = require('./models/Prescription');
const Doctor = require('./models/Doctor');
const Category = require('./models/Category');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'your-secret-key';

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 连接数据库
connectDB();

// 初始化数据
const initData = async () => {
  try {
    // 检查是否已有用户数据
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // 创建管理员用户
      const adminUser = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('管理员用户已创建');
    }

    // 检查是否已有分类数据
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      // 创建初始分类数据
      // 根分类
      const internalCategory = await Category.create({ label: '内科', parentId: null });
      const surgeryCategory = await Category.create({ label: '外科', parentId: null });
      const gynecologyCategory = await Category.create({ label: '妇科', parentId: null });
      const pediatricsCategory = await Category.create({ label: '儿科', parentId: null });
      
      // 内科子分类
      await Category.create({ label: '感冒', parentId: internalCategory._id });
      await Category.create({ label: '咳嗽', parentId: internalCategory._id });
      await Category.create({ label: '高血压', parentId: internalCategory._id });
      await Category.create({ label: '糖尿病', parentId: internalCategory._id });
      
      // 外科子分类
      await Category.create({ label: '烫伤', parentId: surgeryCategory._id });
      await Category.create({ label: '扭伤', parentId: surgeryCategory._id });
      await Category.create({ label: '疮疡', parentId: surgeryCategory._id });
      
      // 妇科子分类
      await Category.create({ label: '痛经', parentId: gynecologyCategory._id });
      await Category.create({ label: '月经不调', parentId: gynecologyCategory._id });
      await Category.create({ label: '产后调理', parentId: gynecologyCategory._id });
      
      // 儿科子分类
      await Category.create({ label: '积食', parentId: pediatricsCategory._id });
      await Category.create({ label: '发烧', parentId: pediatricsCategory._id });
      await Category.create({ label: '腹泻', parentId: pediatricsCategory._id });
      
      console.log('初始分类数据已创建');
    }

    // 检查是否已有验方数据
    const prescriptionCount = await Prescription.countDocuments();
    if (prescriptionCount === 0) {
      // 创建初始验方数据
      const prescriptions = [
        {
          type: '验方',
          category: '内科',
          subCategory: '感冒',
          content: '生姜10g，葱白3段，红糖适量，水煎服',
          note: '适用于风寒感冒',
          source: '《伤寒论》'
        },
        {
          type: '偏方',
          category: '内科',
          subCategory: '咳嗽',
          content: '冰糖炖雪梨',
          note: '适用于肺热咳嗽',
          source: '民间流传'
        },
        {
          type: '验方',
          category: '外科',
          subCategory: '烫伤',
          content: '芦荟汁涂抹患处',
          note: '轻度烫伤适用',
          source: '《本草纲目》'
        },
        {
          type: '验方',
          category: '妇科',
          subCategory: '痛经',
          content: '当归10g，川芎5g，白芍10g，熟地15g',
          note: '适用于气血不足型痛经',
          source: '《金匮要略》'
        },
        {
          type: '偏方',
          category: '儿科',
          subCategory: '积食',
          content: '山楂30g，神曲15g，麦芽15g',
          note: '适用于小儿积食',
          source: '民间流传'
        }
      ];
      await Prescription.insertMany(prescriptions);
      console.log('初始验方数据已创建');
    }

    // 检查是否已有医生数据
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      // 创建初始医生数据
      const doctors = [
        {
          name: '张医生',
          clinicName: '中医诊所',
          address: '北京市朝阳区建国路88号',
          specialize: '内科、妇科',
          lng: 116.4668,
          lat: 39.9219
        },
        {
          name: '李医生',
          clinicName: '祖传中医',
          address: '上海市浦东新区陆家嘴环路1000号',
          specialize: '外科、儿科',
          lng: 121.5063,
          lat: 31.2451
        },
        {
          name: '王医生',
          clinicName: '中医药馆',
          address: '广州市天河区天河路385号',
          specialize: '内科、针灸',
          lng: 113.3246,
          lat: 23.1291
        }
      ];
      await Doctor.insertMany(doctors);
      console.log('初始医生数据已创建');
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

// 调用初始化数据函数
initData();

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );
    
    res.json({ code: 200, message: '登录成功', data: { token } });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败，请稍后重试' });
  }
});

// 获取验方列表
app.get('/api/prescriptions', async (req, res) => {
  const { type, category, subCategory } = req.query;
  
  try {
    // 构建查询条件
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    
    // 查询数据
    const prescriptions = await Prescription.find(query);
    res.json({ code: 200, message: 'success', data: prescriptions });
  } catch (error) {
    console.error('获取验方列表失败:', error);
    res.status(500).json({ code: 500, message: '获取验方列表失败，请稍后重试' });
  }
});

// 获取医生列表
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({ code: 200, message: 'success', data: doctors });
  } catch (error) {
    console.error('获取医生列表失败:', error);
    res.status(500).json({ code: 500, message: '获取医生列表失败，请稍后重试' });
  }
});

// 构建树形结构的辅助函数
const buildTree = (categories) => {
  const tree = [];
  const map = {};
  
  // 先将所有分类按id存入map
  categories.forEach(category => {
    map[category._id] = {
      id: category._id,
      label: category.label,
      children: []
    };
  });
  
  // 构建树形结构
  categories.forEach(category => {
    if (category.parentId === null) {
      // 根节点
      tree.push(map[category._id]);
    } else {
      // 子节点
      if (map[category.parentId]) {
        map[category.parentId].children.push(map[category._id]);
      }
    }
  });
  
  return tree;
};

// 获取分类列表
app.get('/api/categories', async (req, res) => {
  try {
    // 从数据库获取所有分类
    const categories = await Category.find();
    // 构建树形结构
    const tree = buildTree(categories);
    res.json({ code: 200, message: 'success', data: tree });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ code: 500, message: '获取分类列表失败，请稍后重试' });
  }
});

// 新增分类
app.post('/api/categories', async (req, res) => {
  try {
    const { parentId, label } = req.body;
    
    if (!label) {
      return res.status(400).json({ code: 400, message: '分类名称不能为空' });
    }
    
    // 创建分类
    const newCategory = await Category.create({
      label,
      parentId: parentId || null
    });
    
    // 返回更新后的分类列表
    const categories = await Category.find();
    const tree = buildTree(categories);
    res.json({ code: 200, message: '分类添加成功', data: tree });
  } catch (error) {
    console.error('添加分类失败:', error);
    res.status(500).json({ code: 500, message: '添加分类失败，请稍后重试' });
  }
});

// 编辑分类
app.put('/api/categories', async (req, res) => {
  try {
    const { id, label } = req.body;
    
    if (!id || !label) {
      return res.status(400).json({ code: 400, message: '分类ID和名称不能为空' });
    }
    
    // 更新分类
    const result = await Category.updateOne({ _id: id }, { label });
    
    if (result.nModified === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    
    // 返回更新后的分类列表
    const categories = await Category.find();
    const tree = buildTree(categories);
    res.json({ code: 200, message: '分类编辑成功', data: tree });
  } catch (error) {
    console.error('编辑分类失败:', error);
    res.status(500).json({ code: 500, message: '编辑分类失败，请稍后重试' });
  }
});

// 删除分类
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ code: 400, message: '分类ID不能为空' });
    }
    
    // 检查该分类是否存在
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    
    // 检查该分类是否存在子节点
    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      return res.status(400).json({ code: 400, message: '该分类下存在子节点，不允许删除' });
    }
    
    // 检查该分类是否存在数据
    const hasPrescriptions = await Prescription.countDocuments({ 
      $or: [{ category: category.label }, { subCategory: category.label }] 
    });
    if (hasPrescriptions > 0) {
      return res.status(400).json({ code: 400, message: '该分类下存在数据，不允许删除' });
    }
    
    // 删除分类
    await Category.findByIdAndDelete(id);
    
    // 返回更新后的分类列表
    const categories = await Category.find();
    const tree = buildTree(categories);
    res.json({ code: 200, message: '分类删除成功', data: tree });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ code: 500, message: '删除分类失败，请稍后重试' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});