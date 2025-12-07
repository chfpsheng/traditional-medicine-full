const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'your-secret-key';

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 模拟数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$J9QwM7d6e5r4t3y2u1i0o', // 密码: admin123
    role: 'admin'
  }
];

const prescriptions = [
  {
    id: 1,
    type: '验方',
    category: '内科',
    subCategory: '感冒',
    content: '生姜10g，葱白3段，红糖适量，水煎服',
    note: '适用于风寒感冒',
    source: '《伤寒论》'
  },
  {
    id: 2,
    type: '偏方',
    category: '内科',
    subCategory: '咳嗽',
    content: '冰糖炖雪梨',
    note: '适用于肺热咳嗽',
    source: '民间流传'
  },
  {
    id: 3,
    type: '验方',
    category: '外科',
    subCategory: '烫伤',
    content: '芦荟汁涂抹患处',
    note: '轻度烫伤适用',
    source: '《本草纲目》'
  },
  {
    id: 4,
    type: '验方',
    category: '妇科',
    subCategory: '痛经',
    content: '当归10g，川芎5g，白芍10g，熟地15g',
    note: '适用于气血不足型痛经',
    source: '《金匮要略》'
  },
  {
    id: 5,
    type: '偏方',
    category: '儿科',
    subCategory: '积食',
    content: '山楂30g，神曲15g，麦芽15g',
    note: '适用于小儿积食',
    source: '民间流传'
  }
];

const doctors = [
  {
    id: 1,
    name: '张医生',
    clinicName: '中医诊所',
    address: '北京市朝阳区建国路88号',
    specialize: '内科、妇科',
    lng: 116.4668,
    lat: 39.9219
  },
  {
    id: 2,
    name: '李医生',
    clinicName: '祖传中医',
    address: '上海市浦东新区陆家嘴环路1000号',
    specialize: '外科、儿科',
    lng: 121.5063,
    lat: 31.2451
  },
  {
    id: 3,
    name: '王医生',
    clinicName: '中医药馆',
    address: '广州市天河区天河路385号',
    specialize: '内科、针灸',
    lng: 113.3246,
    lat: 23.1291
  }
];

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
  
  // 这里应该用bcrypt.compare比较密码，简化处理
  if (password !== 'admin123') {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ code: 200, message: '登录成功', data: { token } });
});

// 获取验方列表
app.get('/api/prescriptions', (req, res) => {
  const { type, category, subCategory } = req.query;
  let filtered = prescriptions;
  
  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (subCategory) {
    filtered = filtered.filter(p => p.subCategory === subCategory);
  }
  
  res.json({ code: 200, message: 'success', data: filtered });
});

// 获取医生列表
app.get('/api/doctors', (req, res) => {
  res.json({ code: 200, message: 'success', data: doctors });
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  const categories = [
    {
      label: '内科',
      children: [
        { label: '感冒' },
        { label: '咳嗽' },
        { label: '高血压' },
        { label: '糖尿病' }
      ]
    },
    {
      label: '外科',
      children: [
        { label: '烫伤' },
        { label: '扭伤' },
        { label: '疮疡' }
      ]
    },
    {
      label: '妇科',
      children: [
        { label: '痛经' },
        { label: '月经不调' },
        { label: '产后调理' }
      ]
    },
    {
      label: '儿科',
      children: [
        { label: '积食' },
        { label: '发烧' },
        { label: '腹泻' }
      ]
    }
  ];
  res.json({ code: 200, message: 'success', data: categories });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});