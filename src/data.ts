/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VehicleStock, PartsRequest } from './types';

export const initialVehicles: VehicleStock[] = [
  {
    id: 'v1',
    name: '多拉3米8',
    config: '高承载重载纯电微卡 (3.8米货厢/抗胀防胀强化设计)',
    price: 9.8, // 9.8万元
    currentStock: 1200,
    saleableStock: 850,
    inTransit: 300,
    forecastDailySales: 12, // 12辆/天 -> 覆盖天数: 850 / 12 = 70.8天 (偏高/积压风险)
    stockAge0_30: 400,
    stockAge31_60: 300,
    stockAge61_90: 350,
    stockAge91_plus: 150, // 长库龄
    safetyStockDays: 30,
    regionStock: {
      regionA: { stock: 900, sales: 4 }, // 区域错配 A：库存极多，销量极少 (900 / 4 = 225天覆盖)
      regionB: { stock: 300, sales: 8 }, // 区域错配 B：库存极少，销量极多 (300 / 8 = 37.5天覆盖)
    },
  },
  {
    id: 'v2',
    name: '多拉大面',
    config: '定制化大空间纯电大面 (6.4m³承载立方/货运司机专属定制跑单好车)',
    price: 7.2, // 7.2万元
    currentStock: 450,
    saleableStock: 410,
    inTransit: 150,
    forecastDailySales: 28, // 28辆/天 -> 覆盖天数: 410 / 28 = 14.6天 (严重不足/缺货风险)
    stockAge0_30: 380,
    stockAge31_60: 50,
    stockAge61_90: 20,
    stockAge91_plus: 0,
    safetyStockDays: 25,
    regionStock: {
      regionA: { stock: 220, sales: 13 },
      regionB: { stock: 230, sales: 15 },
    },
  },
  {
    id: 'v3',
    name: '多拉小货',
    config: '灵活重载同城配送纯电小微卡 (能跑又能拉/小体积大容量)',
    price: 4.8, // 4.8万元
    currentStock: 3200,
    saleableStock: 3050,
    inTransit: 800,
    forecastDailySales: 110, // 110辆/天 -> 覆盖天数: 3050 / 110 = 27.7天 (健康)
    stockAge0_30: 2500,
    stockAge31_60: 500,
    stockAge61_90: 150,
    stockAge91_plus: 50,
    safetyStockDays: 20,
    regionStock: {
      regionA: { stock: 1600, sales: 55 },
      regionB: { stock: 1600, sales: 55 },
    },
  }
];

export const initialParts: PartsRequest[] = [
  {
    id: 'p0',
    partCode: 'EPS-STEER-V38',
    partName: '智能电动助力转向系统 EPS 柱总成',
    supplier: '万安科技 / 博世联合体',
    proposeQty: 12000, // 惯性提报 12,000 个 (与之前旺季一致)
    unitPrice: 850, // 单价 850 元
    applicableModels: [
      { modelName: '多拉3米8', bomQty: 1, shareRatio: 1.0 },
    ],
    currentStock: 15000, // 现有高水位库存
    inTransit: 6000, // 高额在途
    supplierLeadTime: 15,
    safetyStockDays: 15,
    historicalAvgPrice: 850,
    isEngineeringChangePending: false,
    isDemandDropWarning: true,
  },
  {
    id: 'p1',
    partCode: 'MCU-800V-SiC01',
    partName: '800V高压碳化硅电控主板',
    supplier: '比亚迪半导体/英飞凌联营厂',
    proposeQty: 12000, // 申请采购 12,000 个
    unitPrice: 1850, // 1850元/个
    applicableModels: [
      { modelName: '多拉3米8', bomQty: 1, shareRatio: 1.0 }, // 极光S7 -> 多拉3米8 100%装配
      { modelName: '多拉大面', bomQty: 1, shareRatio: 0.4 }, // 星途E5 -> 多拉大面 高配车型40%装配
    ],
    currentStock: 4200,
    inTransit: 2500,
    supplierLeadTime: 20, // 交期20天
    safetyStockDays: 15,
    historicalAvgPrice: 1800, // 价格偏高
    isEngineeringChangePending: false,
  },
  {
    id: 'p2',
    partCode: 'BAT-CTP-100KWH',
    partName: '100kWh CTP 麒麟电池包',
    supplier: '宁德时代 (CATL)',
    proposeQty: 8500, // 申请采购 8,500 个 -> 覆盖天数过高，产生严重呆滞积压
    unitPrice: 62000, // 62,000元/个 (超高金额)
    applicableModels: [
      { modelName: '多拉3米8', bomQty: 1, shareRatio: 0.6 }, // 多拉3米8长续航版
    ],
    currentStock: 3800,
    inTransit: 1200,
    supplierLeadTime: 15,
    safetyStockDays: 10,
    historicalAvgPrice: 62000,
    isEngineeringChangePending: false,
  },
  {
    id: 'p3',
    partCode: 'ADAS-CAM-DUAL02',
    partName: '前视双目ADAS摄像头模组',
    supplier: '德赛西威',
    proposeQty: 9000, // 采购 9,000 个
    unitPrice: 420, // 420元/个
    applicableModels: [
      { modelName: '多拉3米8', bomQty: 1, shareRatio: 1.0 },
      { modelName: '多拉大面', bomQty: 1, shareRatio: 1.0 },
    ],
    currentStock: 1500,
    inTransit: 3000,
    supplierLeadTime: 25,
    safetyStockDays: 12,
    historicalAvgPrice: 420,
    isEngineeringChangePending: true, // ⚠️ 工程变更切换中！即将被 ADAS-CAM-TRI03 三目替代！有旧料积压/作废风险
  },
  {
    id: 'p4',
    partCode: 'IHU-5G-MAX04',
    partName: '5G多合一智能车机终端',
    supplier: '德赛智能 / 联发科',
    proposeQty: 150, // 采购数量极低，触发采购不足预警
    unitPrice: 1200,
    applicableModels: [
      { modelName: '多拉小货', bomQty: 1, shareRatio: 1.0 }, // 每天耗用量 = 110
    ],
    currentStock: 120, // 库存低
    inTransit: 0,
    supplierLeadTime: 45, // 触发供应商交期风险 (交期长达45天)
    safetyStockDays: 20,
    historicalAvgPrice: 1200,
    isEngineeringChangePending: false,
    isUnderstockWarning: true,
  },
  {
    id: 'p5',
    partCode: 'MOTOR-150KW-05',
    partName: '150kW 高功率永磁同步电机',
    supplier: '方正电机 / 蔚来驱动',
    proposeQty: 8000,
    unitPrice: 4800, // 历史均价4500，触发采购价格异常
    applicableModels: [
      { modelName: '多拉大面', bomQty: 1, shareRatio: 1.0 }, // 每天耗用量 = 28
    ],
    currentStock: 1100,
    inTransit: 600,
    supplierLeadTime: 35,
    supplierOntimeRate: 0.72, // 触发供应商交期风险 (准交率仅有72%)
    safetyStockDays: 15,
    historicalAvgPrice: 4500,
    isEngineeringChangePending: false,
  }
];
