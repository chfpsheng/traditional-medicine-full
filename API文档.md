# 传统医学应用 API 文档

## 1. 登录接口

### 1.1 POST /api/login

**功能描述**：用户登录，获取JWT令牌

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**返回示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 2. 验方管理接口

### 2.1 GET /api/prescriptions

**功能描述**：获取验方列表，支持筛选

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| type | string | 否 | 验方类型："验方"或"偏方" |
| category | string | 否 | 一级分类 |
| subCategory | string | 否 | 二级分类 |

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "type": "验方",
      "category": "内科",
      "subCategory": "感冒",
      "content": "生姜10g，葱白3段，红糖适量，水煎服",
      "author": "张仲景",
      "notes": "适用于风寒感冒",
      "source": "《伤寒论》",
      "link": "",
      "treatmentMethod": "方剂",
      "createdAt": "2024-01-15T08:30:00.000Z"
    }
  ]
}
```

### 2.2 POST /api/prescriptions

**功能描述**：添加新方剂

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| type | string | 是 | 验方类型："验方"或"偏方" |
| category | string | 是 | 一级分类 |
| subCategory | string | 是 | 二级分类 |
| content | string | 是 | 方剂内容 |
| author | string | 否 | 作者 |
| notes | string | 否 | 注意事项 |
| source | string | 否 | 来源 |
| link | string | 否 | 链接 |
| treatmentMethod | string | 是 | 治疗方法："方剂"、"针"、"艾灸"、"推拿"、"丸剂"、"散剂"、"熏洗" |

**返回示例**：
```json
{
  "code": 200,
  "message": "方剂添加成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "type": "验方",
    "category": "内科",
    "subCategory": "感冒",
    "content": "生姜10g，葱白3段，红糖适量，水煎服",
    "author": "张仲景",
    "notes": "适用于风寒感冒",
    "source": "《伤寒论》",
    "link": "",
    "treatmentMethod": "方剂",
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
}
```

### 2.3 PUT /api/prescriptions/:id

**功能描述**：编辑方剂

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 方剂ID（通过URL路径传递） |
| type | string | 是 | 验方类型："验方"或"偏方" |
| category | string | 是 | 一级分类 |
| subCategory | string | 是 | 二级分类 |
| content | string | 是 | 方剂内容 |
| author | string | 否 | 作者 |
| notes | string | 否 | 注意事项 |
| source | string | 否 | 来源 |
| link | string | 否 | 链接 |
| treatmentMethod | string | 是 | 治疗方法："方剂"、"针"、"艾灸"、"推拿"、"丸剂"、"散剂"、"熏洗" |

**返回示例**：
```json
{
  "code": 200,
  "message": "方剂更新成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "type": "验方",
    "category": "内科",
    "subCategory": "感冒",
    "content": "生姜10g，葱白3段，红糖适量，水煎服",
    "author": "张仲景",
    "notes": "适用于风寒感冒",
    "source": "《伤寒论》",
    "link": "",
    "treatmentMethod": "方剂",
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
}
```

### 2.4 DELETE /api/prescriptions/:id

**功能描述**：删除方剂

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 方剂ID（通过URL路径传递） |

**返回示例**：
```json
{
  "code": 200,
  "message": "方剂删除成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "type": "验方",
    "category": "内科",
    "subCategory": "感冒",
    "content": "生姜10g，葱白3段，红糖适量，水煎服",
    "author": "张仲景",
    "notes": "适用于风寒感冒",
    "source": "《伤寒论》",
    "link": "",
    "treatmentMethod": "方剂",
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
}
```

## 3. 医生管理接口

### 3.1 GET /api/doctors

**功能描述**：获取医生列表

**请求参数**：无

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "name": "张医生",
      "clinicName": "中医诊所",
      "address": "北京市朝阳区建国路88号",
      "specialize": "内科、妇科",
      "introduction": "从事中医临床工作20余年，擅长内科常见病、妇科调理等",
      "lng": 116.4668,
      "lat": 39.9219
    }
  ]
}
```

### 3.2 POST /api/doctors

**功能描述**：添加医生

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| name | string | 是 | 医生姓名 |
| clinicName | string | 否 | 诊所名称 |
| address | string | 是 | 诊所地址 |
| specialize | string | 否 | 擅长领域 |
| introduction | string | 否 | 医生简介 |
| lng | number | 是 | 经度 |
| lat | number | 是 | 纬度 |

**返回示例**：
```json
{
  "code": 200,
  "message": "医生添加成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "name": "张医生",
    "clinicName": "中医诊所",
    "address": "北京市朝阳区建国路88号",
    "specialize": "内科、妇科",
    "introduction": "从事中医临床工作20余年，擅长内科常见病、妇科调理等",
    "lng": 116.4668,
    "lat": 39.9219
  }
}
```

### 3.3 PUT /api/doctors/:id

**功能描述**：编辑医生

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 医生ID（通过URL路径传递） |
| name | string | 是 | 医生姓名 |
| clinicName | string | 否 | 诊所名称 |
| address | string | 是 | 诊所地址 |
| specialize | string | 否 | 擅长领域 |
| introduction | string | 否 | 医生简介 |
| lng | number | 是 | 经度 |
| lat | number | 是 | 纬度 |

**返回示例**：
```json
{
  "code": 200,
  "message": "医生更新成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "name": "张医生",
    "clinicName": "中医诊所",
    "address": "北京市朝阳区建国路88号",
    "specialize": "内科、妇科",
    "introduction": "从事中医临床工作20余年，擅长内科常见病、妇科调理等",
    "lng": 116.4668,
    "lat": 39.9219
  }
}
```

### 3.4 DELETE /api/doctors/:id

**功能描述**：删除医生

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 医生ID（通过URL路径传递） |

**返回示例**：
```json
{
  "code": 200,
  "message": "医生删除成功",
  "data": {
    "id": "65a4b3c2d1e0f9a8b7c6d5e4",
    "name": "张医生",
    "clinicName": "中医诊所",
    "address": "北京市朝阳区建国路88号",
    "specialize": "内科、妇科",
    "introduction": "从事中医临床工作20余年，擅长内科常见病、妇科调理等",
    "lng": 116.4668,
    "lat": 39.9219
  }
}
```

## 4. 分类管理接口

### 4.1 GET /api/categories

**功能描述**：获取分类列表，返回树形结构

**请求参数**：无

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "label": "内科",
      "children": [
        {
          "id": "65a4b3c2d1e0f9a8b7c6d5e5",
          "label": "感冒",
          "children": []
        },
        {
          "id": "65a4b3c2d1e0f9a8b7c6d5e6",
          "label": "咳嗽",
          "children": []
        }
      ]
    }
  ]
}
```

### 4.2 POST /api/categories

**功能描述**：新增分类

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| parentId | string | 否 | 父分类ID，根分类为null |
| label | string | 是 | 分类名称 |

**返回示例**：
```json
{
  "code": 200,
  "message": "分类添加成功",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "label": "内科",
      "children": [
        {
          "id": "65a4b3c2d1e0f9a8b7c6d5e5",
          "label": "感冒",
          "children": []
        }
      ]
    }
  ]
}
```

### 4.3 PUT /api/categories

**功能描述**：编辑分类

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 分类ID |
| label | string | 是 | 分类名称 |

**返回示例**：
```json
{
  "code": 200,
  "message": "分类编辑成功",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "label": "内科",
      "children": [
        {
          "id": "65a4b3c2d1e0f9a8b7c6d5e5",
          "label": "感冒",
          "children": []
        }
      ]
    }
  ]
}
```

### 4.4 DELETE /api/categories/:id

**功能描述**：删除分类

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | string | 是 | 分类ID（通过URL路径传递） |

**返回示例**：
```json
{
  "code": 200,
  "message": "分类删除成功",
  "data": [
    {
      "id": "65a4b3c2d1e0f9a8b7c6d5e4",
      "label": "内科",
      "children": [
        {
          "id": "65a4b3c2d1e0f9a8b7c6d5e5",
          "label": "感冒",
          "children": []
        }
      ]
    }
  ]
}
```

## 5. 通用返回格式

所有API接口返回的数据格式统一为：

```json
{
  "code": 200, // 状态码，200表示成功，其他表示失败
  "message": "success", // 状态描述
  "data": {} // 返回的数据，根据接口不同而不同
}
```

### 状态码说明

| 状态码 | 说明 |
| ------ | ---- |
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或登录失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
