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
      // 省市数据（级联选择器格式），四川省排在最前面
      regionOptions: [
        // 四川省（排在最前面）
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
        // 其他直辖市
        { label: '北京市', value: '北京市', children: [{ label: '北京市', value: '北京市' }] },
        { label: '上海市', value: '上海市', children: [{ label: '上海市', value: '上海市' }] },
        { label: '天津市', value: '天津市', children: [{ label: '天津市', value: '天津市' }] },
        { label: '重庆市', value: '重庆市', children: [{ label: '重庆市', value: '重庆市' }] },
        // 河北省
        { label: '河北省', value: '河北省', children: [
          { label: '石家庄市', value: '石家庄市' },
          { label: '唐山市', value: '唐山市' },
          { label: '秦皇岛市', value: '秦皇岛市' },
          { label: '邯郸市', value: '邯郸市' },
          { label: '邢台市', value: '邢台市' },
          { label: '保定市', value: '保定市' },
          { label: '张家口市', value: '张家口市' },
          { label: '承德市', value: '承德市' },
          { label: '沧州市', value: '沧州市' },
          { label: '廊坊市', value: '廊坊市' },
          { label: '衡水市', value: '衡水市' }
        ]},
        // 山西省
        { label: '山西省', value: '山西省', children: [
          { label: '太原市', value: '太原市' },
          { label: '大同市', value: '大同市' },
          { label: '阳泉市', value: '阳泉市' },
          { label: '长治市', value: '长治市' },
          { label: '晋城市', value: '晋城市' },
          { label: '朔州市', value: '朔州市' },
          { label: '晋中市', value: '晋中市' },
          { label: '运城市', value: '运城市' },
          { label: '忻州市', value: '忻州市' },
          { label: '临汾市', value: '临汾市' },
          { label: '吕梁市', value: '吕梁市' }
        ]},
        // 辽宁省
        { label: '辽宁省', value: '辽宁省', children: [
          { label: '沈阳市', value: '沈阳市' },
          { label: '大连市', value: '大连市' },
          { label: '鞍山市', value: '鞍山市' },
          { label: '抚顺市', value: '抚顺市' },
          { label: '本溪市', value: '本溪市' },
          { label: '丹东市', value: '丹东市' },
          { label: '锦州市', value: '锦州市' },
          { label: '营口市', value: '营口市' },
          { label: '阜新市', value: '阜新市' },
          { label: '辽阳市', value: '辽阳市' },
          { label: '盘锦市', value: '盘锦市' },
          { label: '铁岭市', value: '铁岭市' },
          { label: '朝阳市', value: '朝阳市' },
          { label: '葫芦岛市', value: '葫芦岛市' }
        ]},
        // 吉林省
        { label: '吉林省', value: '吉林省', children: [
          { label: '长春市', value: '长春市' },
          { label: '吉林市', value: '吉林市' },
          { label: '四平市', value: '四平市' },
          { label: '辽源市', value: '辽源市' },
          { label: '通化市', value: '通化市' },
          { label: '白山市', value: '白山市' },
          { label: '松原市', value: '松原市' },
          { label: '白城市', value: '白城市' },
          { label: '延边朝鲜族自治州', value: '延边朝鲜族自治州' }
        ]},
        // 黑龙江省
        { label: '黑龙江省', value: '黑龙江省', children: [
          { label: '哈尔滨市', value: '哈尔滨市' },
          { label: '齐齐哈尔市', value: '齐齐哈尔市' },
          { label: '鸡西市', value: '鸡西市' },
          { label: '鹤岗市', value: '鹤岗市' },
          { label: '双鸭山市', value: '双鸭山市' },
          { label: '大庆市', value: '大庆市' },
          { label: '伊春市', value: '伊春市' },
          { label: '佳木斯市', value: '佳木斯市' },
          { label: '七台河市', value: '七台河市' },
          { label: '牡丹江市', value: '牡丹江市' },
          { label: '黑河市', value: '黑河市' },
          { label: '绥化市', value: '绥化市' },
          { label: '大兴安岭地区', value: '大兴安岭地区' }
        ]},
        // 江苏省
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
        ]},
        // 浙江省
        { label: '浙江省', value: '浙江省', children: [
          { label: '杭州市', value: '杭州市' },
          { label: '宁波市', value: '宁波市' },
          { label: '温州市', value: '温州市' },
          { label: '嘉兴市', value: '嘉兴市' },
          { label: '湖州市', value: '湖州市' },
          { label: '绍兴市', value: '绍兴市' },
          { label: '金华市', value: '金华市' },
          { label: '衢州市', value: '衢州市' },
          { label: '舟山市', value: '舟山市' },
          { label: '台州市', value: '台州市' },
          { label: '丽水市', value: '丽水市' }
        ]},
        // 安徽省
        { label: '安徽省', value: '安徽省', children: [
          { label: '合肥市', value: '合肥市' },
          { label: '芜湖市', value: '芜湖市' },
          { label: '蚌埠市', value: '蚌埠市' },
          { label: '淮南市', value: '淮南市' },
          { label: '马鞍山市', value: '马鞍山市' },
          { label: '淮北市', value: '淮北市' },
          { label: '铜陵市', value: '铜陵市' },
          { label: '安庆市', value: '安庆市' },
          { label: '黄山市', value: '黄山市' },
          { label: '滁州市', value: '滁州市' },
          { label: '阜阳市', value: '阜阳市' },
          { label: '宿州市', value: '宿州市' },
          { label: '六安市', value: '六安市' },
          { label: '亳州市', value: '亳州市' },
          { label: '池州市', value: '池州市' },
          { label: '宣城市', value: '宣城市' }
        ]},
        // 福建省
        { label: '福建省', value: '福建省', children: [
          { label: '福州市', value: '福州市' },
          { label: '厦门市', value: '厦门市' },
          { label: '莆田市', value: '莆田市' },
          { label: '三明市', value: '三明市' },
          { label: '泉州市', value: '泉州市' },
          { label: '漳州市', value: '漳州市' },
          { label: '南平市', value: '南平市' },
          { label: '龙岩市', value: '龙岩市' },
          { label: '宁德市', value: '宁德市' }
        ]},
        // 江西省
        { label: '江西省', value: '江西省', children: [
          { label: '南昌市', value: '南昌市' },
          { label: '景德镇市', value: '景德镇市' },
          { label: '萍乡市', value: '萍乡市' },
          { label: '九江市', value: '九江市' },
          { label: '新余市', value: '新余市' },
          { label: '鹰潭市', value: '鹰潭市' },
          { label: '赣州市', value: '赣州市' },
          { label: '吉安市', value: '吉安市' },
          { label: '宜春市', value: '宜春市' },
          { label: '抚州市', value: '抚州市' },
          { label: '上饶市', value: '上饶市' }
        ]},
        // 山东省
        { label: '山东省', value: '山东省', children: [
          { label: '济南市', value: '济南市' },
          { label: '青岛市', value: '青岛市' },
          { label: '淄博市', value: '淄博市' },
          { label: '枣庄市', value: '枣庄市' },
          { label: '东营市', value: '东营市' },
          { label: '烟台市', value: '烟台市' },
          { label: '潍坊市', value: '潍坊市' },
          { label: '济宁市', value: '济宁市' },
          { label: '泰安市', value: '泰安市' },
          { label: '威海市', value: '威海市' },
          { label: '日照市', value: '日照市' },
          { label: '临沂市', value: '临沂市' },
          { label: '德州市', value: '德州市' },
          { label: '聊城市', value: '聊城市' },
          { label: '滨州市', value: '滨州市' },
          { label: '菏泽市', value: '菏泽市' }
        ]},
        // 河南省
        { label: '河南省', value: '河南省', children: [
          { label: '郑州市', value: '郑州市' },
          { label: '开封市', value: '开封市' },
          { label: '洛阳市', value: '洛阳市' },
          { label: '平顶山市', value: '平顶山市' },
          { label: '安阳市', value: '安阳市' },
          { label: '鹤壁市', value: '鹤壁市' },
          { label: '新乡市', value: '新乡市' },
          { label: '焦作市', value: '焦作市' },
          { label: '濮阳市', value: '濮阳市' },
          { label: '许昌市', value: '许昌市' },
          { label: '漯河市', value: '漯河市' },
          { label: '三门峡市', value: '三门峡市' },
          { label: '南阳市', value: '南阳市' },
          { label: '商丘市', value: '商丘市' },
          { label: '信阳市', value: '信阳市' },
          { label: '周口市', value: '周口市' },
          { label: '驻马店市', value: '驻马店市' },
          { label: '济源市', value: '济源市' }
        ]},
        // 湖北省
        { label: '湖北省', value: '湖北省', children: [
          { label: '武汉市', value: '武汉市' },
          { label: '黄石市', value: '黄石市' },
          { label: '十堰市', value: '十堰市' },
          { label: '宜昌市', value: '宜昌市' },
          { label: '襄阳市', value: '襄阳市' },
          { label: '鄂州市', value: '鄂州市' },
          { label: '荆门市', value: '荆门市' },
          { label: '孝感市', value: '孝感市' },
          { label: '荆州市', value: '荆州市' },
          { label: '黄冈市', value: '黄冈市' },
          { label: '咸宁市', value: '咸宁市' },
          { label: '随州市', value: '随州市' },
          { label: '恩施土家族苗族自治州', value: '恩施土家族苗族自治州' },
          { label: '仙桃市', value: '仙桃市' },
          { label: '潜江市', value: '潜江市' },
          { label: '天门市', value: '天门市' },
          { label: '神农架林区', value: '神农架林区' }
        ]},
        // 湖南省
        { label: '湖南省', value: '湖南省', children: [
          { label: '长沙市', value: '长沙市' },
          { label: '株洲市', value: '株洲市' },
          { label: '湘潭市', value: '湘潭市' },
          { label: '衡阳市', value: '衡阳市' },
          { label: '邵阳市', value: '邵阳市' },
          { label: '岳阳市', value: '岳阳市' },
          { label: '常德市', value: '常德市' },
          { label: '张家界市', value: '张家界市' },
          { label: '益阳市', value: '益阳市' },
          { label: '郴州市', value: '郴州市' },
          { label: '永州市', value: '永州市' },
          { label: '怀化市', value: '怀化市' },
          { label: '娄底市', value: '娄底市' },
          { label: '湘西土家族苗族自治州', value: '湘西土家族苗族自治州' }
        ]},
        // 广东省
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
        // 海南省
        { label: '海南省', value: '海南省', children: [
          { label: '海口市', value: '海口市' },
          { label: '三亚市', value: '三亚市' },
          { label: '三沙市', value: '三沙市' },
          { label: '儋州市', value: '儋州市' },
          { label: '五指山市', value: '五指山市' },
          { label: '文昌市', value: '文昌市' },
          { label: '琼海市', value: '琼海市' },
          { label: '万宁市', value: '万宁市' },
          { label: '东方市', value: '东方市' },
          { label: '定安县', value: '定安县' },
          { label: '屯昌县', value: '屯昌县' },
          { label: '澄迈县', value: '澄迈县' },
          { label: '临高县', value: '临高县' },
          { label: '白沙黎族自治县', value: '白沙黎族自治县' },
          { label: '昌江黎族自治县', value: '昌江黎族自治县' },
          { label: '乐东黎族自治县', value: '乐东黎族自治县' },
          { label: '陵水黎族自治县', value: '陵水黎族自治县' },
          { label: '保亭黎族苗族自治县', value: '保亭黎族苗族自治县' },
          { label: '琼中黎族苗族自治县', value: '琼中黎族苗族自治县' }
        ]},
        // 贵州省
        { label: '贵州省', value: '贵州省', children: [
          { label: '贵阳市', value: '贵阳市' },
          { label: '六盘水市', value: '六盘水市' },
          { label: '遵义市', value: '遵义市' },
          { label: '安顺市', value: '安顺市' },
          { label: '毕节市', value: '毕节市' },
          { label: '铜仁市', value: '铜仁市' },
          { label: '黔西南布依族苗族自治州', value: '黔西南布依族苗族自治州' },
          { label: '黔东南苗族侗族自治州', value: '黔东南苗族侗族自治州' },
          { label: '黔南布依族苗族自治州', value: '黔南布依族苗族自治州' }
        ]},
        // 云南省
        { label: '云南省', value: '云南省', children: [
          { label: '昆明市', value: '昆明市' },
          { label: '曲靖市', value: '曲靖市' },
          { label: '玉溪市', value: '玉溪市' },
          { label: '保山市', value: '保山市' },
          { label: '昭通市', value: '昭通市' },
          { label: '丽江市', value: '丽江市' },
          { label: '普洱市', value: '普洱市' },
          { label: '临沧市', value: '临沧市' },
          { label: '楚雄彝族自治州', value: '楚雄彝族自治州' },
          { label: '红河哈尼族彝族自治州', value: '红河哈尼族彝族自治州' },
          { label: '文山壮族苗族自治州', value: '文山壮族苗族自治州' },
          { label: '西双版纳傣族自治州', value: '西双版纳傣族自治州' },
          { label: '大理白族自治州', value: '大理白族自治州' },
          { label: '德宏傣族景颇族自治州', value: '德宏傣族景颇族自治州' },
          { label: '怒江傈僳族自治州', value: '怒江傈僳族自治州' },
          { label: '迪庆藏族自治州', value: '迪庆藏族自治州' }
        ]},
        // 陕西省
        { label: '陕西省', value: '陕西省', children: [
          { label: '西安市', value: '西安市' },
          { label: '铜川市', value: '铜川市' },
          { label: '宝鸡市', value: '宝鸡市' },
          { label: '咸阳市', value: '咸阳市' },
          { label: '渭南市', value: '渭南市' },
          { label: '延安市', value: '延安市' },
          { label: '汉中市', value: '汉中市' },
          { label: '榆林市', value: '榆林市' },
          { label: '安康市', value: '安康市' },
          { label: '商洛市', value: '商洛市' }
        ]},
        // 甘肃省
        { label: '甘肃省', value: '甘肃省', children: [
          { label: '兰州市', value: '兰州市' },
          { label: '嘉峪关市', value: '嘉峪关市' },
          { label: '金昌市', value: '金昌市' },
          { label: '白银市', value: '白银市' },
          { label: '天水市', value: '天水市' },
          { label: '武威市', value: '武威市' },
          { label: '张掖市', value: '张掖市' },
          { label: '平凉市', value: '平凉市' },
          { label: '酒泉市', value: '酒泉市' },
          { label: '庆阳市', value: '庆阳市' },
          { label: '定西市', value: '定西市' },
          { label: '陇南市', value: '陇南市' },
          { label: '临夏回族自治州', value: '临夏回族自治州' },
          { label: '甘南藏族自治州', value: '甘南藏族自治州' }
        ]},
        // 青海省
        { label: '青海省', value: '青海省', children: [
          { label: '西宁市', value: '西宁市' },
          { label: '海东市', value: '海东市' },
          { label: '海北藏族自治州', value: '海北藏族自治州' },
          { label: '黄南藏族自治州', value: '黄南藏族自治州' },
          { label: '海南藏族自治州', value: '海南藏族自治州' },
          { label: '果洛藏族自治州', value: '果洛藏族自治州' },
          { label: '玉树藏族自治州', value: '玉树藏族自治州' },
          { label: '海西蒙古族藏族自治州', value: '海西蒙古族藏族自治州' }
        ]},
        // 台湾省
        { label: '台湾省', value: '台湾省', children: [
          { label: '台北市', value: '台北市' },
          { label: '新北市', value: '新北市' },
          { label: '桃园市', value: '桃园市' },
          { label: '台中市', value: '台中市' },
          { label: '台南市', value: '台南市' },
          { label: '高雄市', value: '高雄市' }
        ]},
        // 内蒙古自治区
        { label: '内蒙古自治区', value: '内蒙古自治区', children: [
          { label: '呼和浩特市', value: '呼和浩特市' },
          { label: '包头市', value: '包头市' },
          { label: '乌海市', value: '乌海市' },
          { label: '赤峰市', value: '赤峰市' },
          { label: '通辽市', value: '通辽市' },
          { label: '鄂尔多斯市', value: '鄂尔多斯市' },
          { label: '呼伦贝尔市', value: '呼伦贝尔市' },
          { label: '巴彦淖尔市', value: '巴彦淖尔市' },
          { label: '乌兰察布市', value: '乌兰察布市' },
          { label: '兴安盟', value: '兴安盟' },
          { label: '锡林郭勒盟', value: '锡林郭勒盟' },
          { label: '阿拉善盟', value: '阿拉善盟' }
        ]},
        // 广西壮族自治区
        { label: '广西壮族自治区', value: '广西壮族自治区', children: [
          { label: '南宁市', value: '南宁市' },
          { label: '柳州市', value: '柳州市' },
          { label: '桂林市', value: '桂林市' },
          { label: '梧州市', value: '梧州市' },
          { label: '北海市', value: '北海市' },
          { label: '防城港市', value: '防城港市' },
          { label: '钦州市', value: '钦州市' },
          { label: '贵港市', value: '贵港市' },
          { label: '玉林市', value: '玉林市' },
          { label: '百色市', value: '百色市' },
          { label: '贺州市', value: '贺州市' },
          { label: '河池市', value: '河池市' },
          { label: '来宾市', value: '来宾市' },
          { label: '崇左市', value: '崇左市' }
        ]},
        // 西藏自治区
        { label: '西藏自治区', value: '西藏自治区', children: [
          { label: '拉萨市', value: '拉萨市' },
          { label: '日喀则市', value: '日喀则市' },
          { label: '昌都市', value: '昌都市' },
          { label: '林芝市', value: '林芝市' },
          { label: '山南市', value: '山南市' },
          { label: '那曲市', value: '那曲市' },
          { label: '阿里地区', value: '阿里地区' }
        ]},
        // 宁夏回族自治区
        { label: '宁夏回族自治区', value: '宁夏回族自治区', children: [
          { label: '银川市', value: '银川市' },
          { label: '石嘴山市', value: '石嘴山市' },
          { label: '吴忠市', value: '吴忠市' },
          { label: '固原市', value: '固原市' },
          { label: '中卫市', value: '中卫市' }
        ]},
        // 新疆维吾尔自治区
        { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区', children: [
          { label: '乌鲁木齐市', value: '乌鲁木齐市' },
          { label: '克拉玛依市', value: '克拉玛依市' },
          { label: '吐鲁番市', value: '吐鲁番市' },
          { label: '哈密市', value: '哈密市' },
          { label: '昌吉回族自治州', value: '昌吉回族自治州' },
          { label: '博尔塔拉蒙古自治州', value: '博尔塔拉蒙古自治州' },
          { label: '巴音郭楞蒙古自治州', value: '巴音郭楞蒙古自治州' },
          { label: '阿克苏地区', value: '阿克苏地区' },
          { label: '克孜勒苏柯尔克孜自治州', value: '克孜勒苏柯尔克孜自治州' },
          { label: '喀什地区', value: '喀什地区' },
          { label: '和田地区', value: '和田地区' },
          { label: '伊犁哈萨克自治州', value: '伊犁哈萨克自治州' },
          { label: '塔城地区', value: '塔城地区' },
          { label: '阿勒泰地区', value: '阿勒泰地区' },
          { label: '石河子市', value: '石河子市' },
          { label: '阿拉尔市', value: '阿拉尔市' },
          { label: '图木舒克市', value: '图木舒克市' },
          { label: '五家渠市', value: '五家渠市' },
          { label: '北屯市', value: '北屯市' },
          { label: '铁门关市', value: '铁门关市' },
          { label: '双河市', value: '双河市' },
          { label: '可克达拉市', value: '可克达拉市' },
          { label: '昆玉市', value: '昆玉市' },
          { label: '胡杨河市', value: '胡杨河市' },
          { label: '新星市', value: '新星市' }
        ]},
        // 香港特别行政区
        { label: '香港特别行政区', value: '香港特别行政区', children: [{ label: '香港岛', value: '香港岛' }, { label: '九龙', value: '九龙' }, { label: '新界', value: '新界' }] },
        // 澳门特别行政区
        { label: '澳门特别行政区', value: '澳门特别行政区', children: [{ label: '澳门半岛', value: '澳门半岛' }, { label: '氹仔岛', value: '氹仔岛' }, { label: '路环岛', value: '路环岛' }] }
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