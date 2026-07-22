/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VehicleStock {
  id: string;
  name: string;
  config: string;
  price: number; // 单车成本 (万元)
  currentStock: number; // 当前库存 (辆)
  saleableStock: number; // 可售库存 (辆)
  inTransit: number; // 在途车辆 (辆)
  forecastDailySales: number; // 预测日销量 (辆)
  stockAge0_30: number; // 0-30天
  stockAge31_60: number; // 31-60天
  stockAge61_90: number; // 61-90天
  stockAge91_plus: number; // 90天以上
  safetyStockDays: number; // 安全库存天数
  regionStock: {
    regionA: { stock: number; sales: number };
    regionB: { stock: number; sales: number };
  };
}

export interface PartsRequest {
  id: string;
  partCode: string;
  partName: string;
  supplier: string;
  proposeQty: number; // 本次采购申请数量 (个)
  unitPrice: number; // 单价 (元)
  applicableModels: {
    modelName: string;
    bomQty: number; // BOM单车用量
    shareRatio: number; // 配置/装配占比
  }[];
  currentStock: number; // 当前库存 (个)
  inTransit: number; // 在途采购 (个)
  supplierLeadTime: number; // 供应商交期 (天)
  safetyStockDays: number; // 安全库存天数
  historicalAvgPrice: number; // 历史均价 (元)
  isEngineeringChangePending: boolean; // 工程变更切换中
  supplierOntimeRate?: number; // 供应商准交率
  isUnderstockWarning?: boolean; // 采购不足预警
  isDemandDropWarning?: boolean; // 销量骤降预警
}
