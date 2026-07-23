/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Truck, 
  Warehouse, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Download, 
  Layers, 
  BarChart3, 
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export interface FactoryVehicleItem {
  id: string;
  vin: string;
  plantName: string; // 生产工厂 (如：合肥一厂、黄山二厂、广州工厂)
  model: string; // 车型配置
  offlineTime: string; // 整车下线时间 (精确到分)
  offlineDays: number; // 厂端库龄/下线天数
  status: '厂内暂存' | '质检抽检' | '运单生成' | '在途发运' | '已到中转HUB';
  inTransitCarrier?: string; // 在途承运商 (如：安吉物流, 顺丰V-Logistics)
  waybillNo?: string; // 物流运单号
  destination: string; // 拟分配中转HUB / 4S店
  estimatedArrival?: string; // 预计到达时间
  unitPrice: number; // 单车价值 (万元)
}

const initialFactoryVehicles: FactoryVehicleItem[] = [
  { id: 'fv-101', vin: 'LZYDL381002938101', plantName: '合肥一厂 (新能源智造基站)', model: '多拉3米8 纯电货厢版 43.53kWh', offlineTime: '2026-07-22 14:25:10', offlineDays: 1, status: '厂内暂存', destination: '华东金华中心HUB', unitPrice: 8.5 },
  { id: 'fv-102', vin: 'LZYDL381002938102', plantName: '合肥一厂 (新能源智造基站)', model: '多拉3米8 纯电高顶版 43.53kWh', offlineTime: '2026-07-22 11:10:05', offlineDays: 1, status: '在途发运', inTransitCarrier: '安吉智行物流', waybillNo: 'AJ20260722091', destination: '华北北京通州4S店', estimatedArrival: '2026-07-24', unitPrice: 8.8 },
  { id: 'fv-103', vin: 'LZYDLDM100827103', plantName: '黄山二厂 (轻客产业基地)', model: '多拉大面 旗舰冷藏版 50.2kWh', offlineTime: '2026-07-21 18:40:00', offlineDays: 2, status: '在途发运', inTransitCarrier: '顺丰V-Logistics', waybillNo: 'SF9918237190', destination: '大湾区广州黄埔HUB', estimatedArrival: '2026-07-23', unitPrice: 11.2 },
  { id: 'fv-104', vin: 'LZYDLXH100551104', plantName: '广州工厂 (华南智造基地)', model: '多拉小货 双排栏板版 38.7kWh', offlineTime: '2026-07-20 09:15:30', offlineDays: 3, status: '厂内暂存', destination: '西南成都龙泉HUB', unitPrice: 6.8 },
  { id: 'fv-105', vin: 'LZYDL381002938105', plantName: '合肥一厂 (新能源智造基站)', model: '多拉3米8 纯电货厢版 43.53kWh', offlineTime: '2026-07-15 16:00:00', offlineDays: 8, status: '在途发运', inTransitCarrier: '安吉智行物流', waybillNo: 'AJ20260715102', destination: '华中武汉东西湖HUB', estimatedArrival: '2026-07-23', unitPrice: 8.5 },
  { id: 'fv-106', vin: 'LZYDLDM100827106', plantName: '黄山二厂 (轻客产业基地)', model: '多拉大面 标准运力版 41.8kWh', offlineTime: '2026-06-25 10:30:00', offlineDays: 28, status: '厂内暂存', destination: '华东杭州余杭4S店', unitPrice: 9.6 },
  { id: 'fv-107', vin: 'LZYDL381002938107', plantName: '合肥一厂 (新能源智造基站)', model: '多拉3米8 极速长续航版 53.6kWh', offlineTime: '2026-05-18 08:20:00', offlineDays: 65, status: '厂内暂存', destination: '西北西安灞桥HUB', unitPrice: 9.8 },
  { id: 'fv-108', vin: 'LZYDLXH100551108', plantName: '广州工厂 (华南智造基地)', model: '多拉小货 单排仓栅版 38.7kWh', offlineTime: '2026-07-18 20:05:00', offlineDays: 5, status: '在途发运', inTransitCarrier: '招商局物流', waybillNo: 'CM2026071888', destination: '华东南昌青云谱HUB', estimatedArrival: '2026-07-23', unitPrice: 6.5 },
  { id: 'fv-109', vin: 'LZYDLDM100827109', plantName: '黄山二厂 (轻客产业基地)', model: '多拉大面 城市快运版 41.8kWh', offlineTime: '2026-07-22 08:00:00', offlineDays: 1, status: '质检抽检', destination: '华东上海宝山HUB', unitPrice: 9.4 },
  { id: 'fv-110', vin: 'LZYDL381002938110', plantName: '合肥一厂 (新能源智造基站)', model: '多拉3米8 纯电货厢版 43.53kWh', offlineTime: '2026-07-12 15:45:00', offlineDays: 11, status: '在途发运', inTransitCarrier: '安吉智行物流', waybillNo: 'AJ20260712005', destination: '华北石家庄HUB', estimatedArrival: '2026-07-23', unitPrice: 8.5 },
];

export interface MonthlySnapshot {
  month: string;
  beginningStock: number; // 期初库存 (辆)
  productionOffline: number; // 本月下线入库 (辆)
  shipmentOut: number; // 本月调拨/出库 (辆)
  endingStock: number; // 期末库存 (辆)
  capitalOccupied: number; // 期末库存资金 (万元)
  turnaroundDays: number; // 平均周转天数
}

const monthlySnapshotsData: MonthlySnapshot[] = [
  { month: '2026年1月', beginningStock: 1620, productionOffline: 1850, shipmentOut: 1720, endingStock: 1750, capitalOccupied: 14000, turnaroundDays: 21.5 },
  { month: '2026年2月', beginningStock: 1750, productionOffline: 1420, shipmentOut: 1510, endingStock: 1660, capitalOccupied: 13280, turnaroundDays: 22.8 },
  { month: '2026年3月', beginningStock: 1660, productionOffline: 2100, shipmentOut: 1980, endingStock: 1780, capitalOccupied: 14240, turnaroundDays: 19.4 },
  { month: '2026年4月', beginningStock: 1780, productionOffline: 2250, shipmentOut: 2180, endingStock: 1850, capitalOccupied: 14800, turnaroundDays: 18.6 },
  { month: '2026年5月', beginningStock: 1850, productionOffline: 2380, shipmentOut: 2310, endingStock: 1920, capitalOccupied: 15360, turnaroundDays: 18.2 },
  { month: '2026年6月', beginningStock: 1920, productionOffline: 2450, shipmentOut: 2490, endingStock: 1880, capitalOccupied: 15040, turnaroundDays: 17.5 },
  { month: '2026年7月(迄今)', beginningStock: 1880, productionOffline: 2150, shipmentOut: 2190, endingStock: 1840, capitalOccupied: 14720, turnaroundDays: 18.2 },
];

export default function FactoryVehicleDashboard() {
  const [vehicles] = useState<FactoryVehicleItem[]>(initialFactoryVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantFilter, setPlantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = v.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlant = plantFilter === 'all' || v.plantName.includes(plantFilter);
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchSearch && matchPlant && matchStatus;
    });
  }, [vehicles, searchTerm, plantFilter, statusFilter]);

  // Overall Factory KPI Metrics
  const totalFactoryStock = 1840; // 当前车厂总库存 (辆)
  const totalInTransit = 420; // 在途运输数 (辆)
  const monthlyOfflineTotal = 2150; // 本月累计下线 (辆)
  const totalStockCapital = (totalFactoryStock * 8.0).toFixed(1); // 约1.47 亿元

  // Aging breakdown for factory stock
  const agingTiers = [
    { label: '0 - 15 天 (新下线极速周转)', count: 1120, pct: '60.9%', color: 'bg-emerald-500', status: '健康' },
    { label: '16 - 30 天 (正常暂存周转)', count: 450, pct: '24.5%', color: 'bg-emerald-400', status: '正常' },
    { label: '31 - 60 天 (关注警戒周转)', count: 180, pct: '9.8%', color: 'bg-amber-400', status: '关注' },
    { label: '60天以上 (积压滞留周转)', count: 90, pct: '4.8%', color: 'bg-rose-500', status: '呆滞预警' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & KPI Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              主机厂端 · 全流程整车库存与发运调度
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              车厂整车库存与下线在途看板
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              聚焦主机厂生产下线、厂内零公里暂存、调拨在途发运及 monthly 期初期末快照分析，打通“产-存-运-销”全链条库龄诊断。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 backdrop-blur p-3.5 rounded-xl border border-slate-700/60 shrink-0 w-full lg:w-auto">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">厂端当前总库存</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{totalFactoryStock.toLocaleString()} <span className="text-xs font-normal text-slate-300">辆</span></span>
              <span className="text-[9px] text-slate-400 block">资金约 1.47 亿元</span>
            </div>
            <div className="space-y-0.5 border-l border-slate-700/60 pl-3">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">调拨在途运输数</span>
              <span className="text-xl font-black text-indigo-300 font-mono">{totalInTransit.toLocaleString()} <span className="text-xs font-normal text-slate-300">辆</span></span>
              <span className="text-[9px] text-indigo-300 block">物流在途发运中</span>
            </div>
            <div className="space-y-0.5 border-l border-slate-700/60 pl-3">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">本月累计下线数</span>
              <span className="text-xl font-black text-white font-mono">{monthlyOfflineTotal.toLocaleString()} <span className="text-xs font-normal text-slate-300">辆</span></span>
              <span className="text-[9px] text-slate-400 block">日均下线 86 辆</span>
            </div>
            <div className="space-y-0.5 border-l border-slate-700/60 pl-3">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">厂端平均库龄</span>
              <span className="text-xl font-black text-amber-300 font-mono">18.2 <span className="text-xs font-normal text-slate-300">天</span></span>
              <span className="text-[9px] text-emerald-400 block">🟢 低于25天目标</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: 每月库存期初期末快照与趋势对比 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                每月库存期初期末快照 (Monthly Inventory Snapshots)
                <span className="px-2 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-mono font-bold">2026 H1 - H2</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                按月统计主机厂期初库存、生产下线入库量、调拨发运出库量、期末库存及资金占用情况。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5" /> 导出快照数据
            </button>
          </div>
        </div>

        {/* Visual Monthly Snapshots Chart & Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Columns: Interactive Snapshot Table */}
          <div className="lg:col-span-7 overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold text-[11px] border-b border-slate-150 uppercase">
                <tr>
                  <th className="px-3 py-2.5">月份快照</th>
                  <th className="px-3 py-2.5 text-right">期初库存</th>
                  <th className="px-3 py-2.5 text-right text-emerald-600">本月下线(+)</th>
                  <th className="px-3 py-2.5 text-right text-blue-600">本月发运(-)</th>
                  <th className="px-3 py-2.5 text-right font-black">期末库存</th>
                  <th className="px-3 py-2.5 text-right">期末资金(万元)</th>
                  <th className="px-3 py-2.5 text-right">周转天数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {monthlySnapshotsData.map((row, idx) => {
                  const isCurrent = row.month.includes('迄今');
                  return (
                    <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-indigo-50/30 font-bold' : ''}`}>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                        {row.month}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{row.beginningStock.toLocaleString()} 辆</td>
                      <td className="px-3 py-2.5 text-right font-mono text-emerald-700 font-bold">+{row.productionOffline.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-blue-700 font-bold">-{row.shipmentOut.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-900">{row.endingStock.toLocaleString()} 辆</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">￥{row.capitalOccupied.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-700">{row.turnaroundDays} 天</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right 5 Columns: Visual Monthly Stock Dynamics SVG Chart */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  期初 vs 期末库存动态演变趋势
                </span>
                <span className="text-[10px] font-bold text-slate-400">单位: 辆</span>
              </div>

              {/* SVG Trend Chart */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                <svg viewBox="0 0 320 120" className="w-full h-auto overflow-visible">
                  <line x1="30" y1="10" x2="310" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="50" x2="310" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="90" x2="310" y2="90" stroke="#e2e8f0" strokeWidth="1" />
                  
                  {/* Monthly Bars Comparison: Production (Green) vs Shipment (Blue) */}
                  {monthlySnapshotsData.map((d, i) => {
                    const x = 45 + i * 38;
                    const hProd = (d.productionOffline / 2600) * 80;
                    const hShip = (d.shipmentOut / 2600) * 80;
                    const yProd = 90 - hProd;
                    const yShip = 90 - hShip;
                    return (
                      <g key={i}>
                        {/* Production Bar */}
                        <rect x={x - 8} y={yProd} width="7" height={hProd} fill="#10b981" rx="1.5" opacity="0.85" />
                        {/* Shipment Bar */}
                        <rect x={x + 1} y={yShip} width="7" height={hShip} fill="#3b82f6" rx="1.5" opacity="0.85" />
                        {/* Month Label */}
                        <text x={x} y="105" textAnchor="middle" className="fill-slate-400 font-sans text-[8px] font-bold">
                          {i + 1}月
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-center gap-6 mt-3 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 本月下线量 (Production In)
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> 本月发运量 (Shipment Out)
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 mt-3 text-[10px] text-slate-500 leading-normal font-medium">
              💡 产销匹配洞察：6-7月份工厂生产下线与调拨发运基本保持 1:1 动态平衡，期末库存稳定在 1,840 辆健康水位。
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: 厂端库龄结构与周转风险分析 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                厂端库龄结构分布与呆滞周转诊断
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                监控下线后零公里车辆在厂内暂存的库龄天数，预警超过 60 天未发运的积压车辆。
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">
            主机厂当前在库总数: <span className="font-mono text-slate-800 font-black">{totalFactoryStock.toLocaleString()} 辆</span>
          </span>
        </div>

        {/* Aging Progress Visual Stack */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            <div className="bg-emerald-500 h-full transition-all hover:opacity-90" style={{ width: '60.9%' }} title="0-15天: 60.9%" />
            <div className="bg-emerald-400 h-full transition-all hover:opacity-90" style={{ width: '24.5%' }} title="16-30天: 24.5%" />
            <div className="bg-amber-400 h-full transition-all hover:opacity-90" style={{ width: '9.8%' }} title="31-60天: 9.8%" />
            <div className="bg-rose-500 h-full transition-all hover:opacity-90 animate-pulse" style={{ width: '4.8%' }} title="60天+: 4.8%" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {agingTiers.map((tier, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-600">{tier.label}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                    tier.status === '呆滞预警' ? 'bg-rose-100 text-rose-700' :
                    tier.status === '关注' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>{tier.status}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-mono font-black text-slate-900 text-base">{tier.count.toLocaleString()} <span className="text-xs font-normal text-slate-400">辆</span></span>
                  <span className="font-mono font-bold text-slate-500 text-xs">{tier.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: 整车下线时间与在途跟踪台账 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              整车下线时间与在途发运实盘台账
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">FACTORY-LEDGER</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              可精准查阅每台车辆的<span className="font-semibold text-slate-700">整车下线时间</span>、厂端库龄天数、物流承运商及目的地分拨HUB。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索车架号(VIN) / 车型 / 目的地..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-indigo-500 w-52 sm:w-64"
              />
            </div>
            
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 font-bold text-slate-700 focus:bg-white"
            >
              <option value="all">所有生产基地</option>
              <option value="合肥一厂">合肥一厂</option>
              <option value="黄山二厂">黄山二厂</option>
              <option value="广州工厂">广州工厂</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 font-bold text-slate-700 focus:bg-white"
            >
              <option value="all">所有状态</option>
              <option value="厂内暂存">厂内暂存</option>
              <option value="在途发运">在途发运</option>
              <option value="质检抽检">质检抽检</option>
            </select>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="overflow-x-auto border border-slate-150 rounded-xl">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-extrabold text-[11px] border-b border-slate-150 uppercase">
              <tr>
                <th className="px-3 py-3">序号</th>
                <th className="px-3 py-3">车架号 (VIN)</th>
                <th className="px-3 py-3">生产基地</th>
                <th className="px-3 py-3">车型配置</th>
                <th className="px-3 py-3 text-center">整车下线时间</th>
                <th className="px-3 py-3 text-right">厂端库龄</th>
                <th className="px-3 py-3">当前状态</th>
                <th className="px-3 py-3">物流承运商/运单号</th>
                <th className="px-3 py-3">拟发往目的地HUB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{item.vin}</td>
                    <td className="px-3 py-3 text-slate-700 font-semibold">{item.plantName}</td>
                    <td className="px-3 py-3 text-slate-800">{item.model}</td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-indigo-900 bg-slate-50/50">
                      {item.offlineTime}
                    </td>
                    <td className={`px-3 py-3 text-right font-mono font-extrabold ${
                      item.offlineDays > 60 ? 'text-rose-600' :
                      item.offlineDays > 30 ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {item.offlineDays} 天
                    </td>
                    <td className="px-3 py-3">
                      {item.status === '在途发运' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                          <Truck className="w-3 h-3" /> 在途发运
                        </span>
                      )}
                      {item.status === '厂内暂存' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          <Warehouse className="w-3 h-3 text-slate-500" /> 厂内暂存
                        </span>
                      )}
                      {item.status === '质检抽检' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-100">
                          <ShieldAlert className="w-3 h-3" /> 质检抽检
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px]">
                      {item.inTransitCarrier ? (
                        <div>
                          <span className="font-bold text-slate-800 block">{item.inTransitCarrier}</span>
                          <span className="text-[10px] text-slate-400">{item.waybillNo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{item.destination}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    没有找到符合条件的厂端整车下线与发运记录。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 font-medium pt-1">
          <span>共找到 {filteredVehicles.length} 条厂端车辆记录</span>
          <span>※ MES系统与厂端WMS自动同步时间: 10分钟前</span>
        </div>

      </div>

    </div>
  );
}
