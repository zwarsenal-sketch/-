import React, { useState, useMemo, useEffect } from 'react';
import {
  Factory,
  Truck,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  MapPin,
  Sliders,
  Info,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Activity,
  Clock,
  Boxes,
  Cpu,
  BarChart3,
  RefreshCw,
  Building2,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Daily Data Interface
export interface DailyFlowRecord {
  day: number; // Day of month 1..30
  dateStr: string; // e.g., "07-01"
  salesForecast: number; // 每日预测销量
  productionPlan: number; // 每日生产计划
  partsReadiness: number; // 零部件到货率 (%)
  lineOffOutput: number; // 产线下线入库
  
  // Regional Sales Breakdown (大区拆分销量)
  salesEast: number; // 华东大区
  salesSouth: number; // 华南大区
  salesNorth: number; // 华北大区
  salesSouthwest: number; // 西南大区
  salesCentral: number; // 华中大区
  salesNorthwest: number; // 西北大区
  
  totalDailySales: number; // 每日实际销售总和
  
  // Logistics & Stock Pipeline
  factoryStock: number; // 工厂中央仓积水库存
  inTransitStock: number; // 在途运输车辆数
  storeStock: number; // 终端门店/交付中心库存
  totalAvailableStock: number; // 总在存车辆 = 工厂 + 在途 + 门店
  
  replenishmentSignal: number; // 门店提报补货申请量
  daysOfSupply: number; // 推算在存可用天数 (DOS)
  healthStatus: 'healthy' | 'warning' | 'critical';
}

// Regional Config Meta
interface RegionMeta {
  id: string;
  name: string;
  sharePercent: number;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  manager: string;
  hubCity: string;
}

const REGIONS: RegionMeta[] = [
  { id: 'east', name: '华东大区', sharePercent: 30, color: '#3b82f6', bgLight: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700', manager: '张立华', hubCity: '上海/杭州仓' },
  { id: 'south', name: '华南大区', sharePercent: 25, color: '#10b981', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700', manager: '陈志远', hubCity: '广州/深圳仓' },
  { id: 'north', name: '华北大区', sharePercent: 18, color: '#8b5cf6', bgLight: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700', manager: '王建国', hubCity: '北京/天津仓' },
  { id: 'southwest', name: '西南大区', sharePercent: 14, color: '#f59e0b', bgLight: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700', manager: '刘震宇', hubCity: '成都/重庆仓' },
  { id: 'central', name: '华中大区', sharePercent: 8, color: '#06b6d4', bgLight: 'bg-cyan-50', borderColor: 'border-cyan-200', textColor: 'text-cyan-700', manager: '赵铁民', hubCity: '武汉/长沙仓' },
  { id: 'northwest', name: '西北大区', sharePercent: 5, color: '#ec4899', bgLight: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700', manager: '马保平', hubCity: '西安/兰州仓' },
];

export default function DailySupplyChainFlow() {
  // Vehicle Model Selector (Default to duola)
  const [selectedModel, setSelectedModel] = useState<'v3m8' | 'duola'>('duola');

  // Interactive Simulation Controls
  const [planAdjustment, setPlanAdjustment] = useState<number>(0); // -30 to +50 cars/day
  const [salesMultiplier, setSalesMultiplier] = useState<number>(1.0); // 0.8x to 1.5x
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(14); // Default to day 15 (D-1)
  const [flowPeriod, setFlowPeriod] = useState<'daily' | 'weekly'>('daily'); // 'daily' | 'weekly'
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Generate 30 Days Quantified Daily Data based on model & adjustments (D-1 Daily Ledger)
  const dailyRecords: DailyFlowRecord[] = useMemo(() => {
    const records: DailyFlowRecord[] = [];
    const basePlan = selectedModel === 'v3m8' ? 140 : 180;
    
    // Initial Stock state before day 1
    let curFactoryStock = selectedModel === 'v3m8' ? 520 : 680;
    let curInTransitStock = selectedModel === 'v3m8' ? 180 : 260;
    let curStoreStock = selectedModel === 'v3m8' ? 840 : 1100;

    for (let d = 1; d <= 30; d++) {
      const dateStr = `07-${d < 10 ? '0' + d : d}`;
      
      // Daily variation patterns
      const isWeekend = (d % 7 === 6 || d % 7 === 0);
      const weekendBonus = isWeekend ? 1.25 : 0.92;
      const midMonthDemandSurge = (d >= 12 && d <= 18) ? 1.15 : 1.0;

      // 1. Sales Forecast (量化预测)
      const baseForecast = Math.round(basePlan * weekendBonus * midMonthDemandSurge);
      const salesForecast = Math.round(baseForecast * salesMultiplier);

      // 2. Production Plan (每天生产计划)
      const rawPlan = basePlan + planAdjustment;
      const productionPlan = Math.max(20, Math.round(rawPlan));

      // 3. Line-Off Output (产线下线/实际生产入库 - 直接产出，不依赖零部件备货)
      const lineOffOutput = Math.round(productionPlan * (0.97 + (d % 3 === 0 ? 0.02 : -0.01)));

      // 4. Regional Sales Breakdown (每日销量拆分到大区)
      const totalDailySalesRaw = Math.round(salesForecast * (0.9 + Math.sin(d * 0.8) * 0.15));
      
      // Calculate each region's sales
      const salesEast = Math.round(totalDailySalesRaw * 0.30);
      const salesSouth = Math.round(totalDailySalesRaw * 0.25);
      const salesNorth = Math.round(totalDailySalesRaw * 0.18);
      const salesSouthwest = Math.round(totalDailySalesRaw * 0.14);
      const salesCentral = Math.round(totalDailySalesRaw * 0.08);
      const salesNorthwest = Math.max(1, totalDailySalesRaw - (salesEast + salesSouth + salesNorth + salesSouthwest + salesCentral));

      const totalDailySales = salesEast + salesSouth + salesNorth + salesSouthwest + salesCentral + salesNorthwest;

      // 5. Pipeline Inventory Dynamics (工厂 -> 在途 -> 门店 -> 消费销号)
      // Line off enters factory stock
      curFactoryStock += lineOffOutput;

      // Factory dispatches to in-transit logistics
      const dispatchToTransit = Math.min(curFactoryStock, Math.round(totalDailySales * 1.08));
      curFactoryStock -= dispatchToTransit;
      curInTransitStock += dispatchToTransit;

      // Logistics arrival: approx 45% arrives at stores daily
      const transitArrival = Math.min(curInTransitStock, Math.round(curInTransitStock * 0.45));
      curInTransitStock -= transitArrival;
      curStoreStock += transitArrival;

      // Store stock is reduced by actual sales
      const actualFulfilledSales = Math.min(curStoreStock, totalDailySales);
      curStoreStock -= actualFulfilledSales;

      // Total Available Stock
      const totalAvailableStock = curFactoryStock + curInTransitStock + curStoreStock;

      // Replenishment Signal
      const avgRunRate = Math.max(10, totalDailySales);
      const storeTargetWatermark = Math.round(avgRunRate * 12);
      const replenishmentSignal = Math.max(0, storeTargetWatermark - curStoreStock);

      // Days of Supply (在存可用天数推算 = 总在存车辆 / 7日日均销量)
      const daysOfSupply = parseFloat((totalAvailableStock / avgRunRate).toFixed(1));

      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (daysOfSupply < 10 || daysOfSupply > 32) {
        healthStatus = 'critical';
      } else if (daysOfSupply < 14 || daysOfSupply > 26) {
        healthStatus = 'warning';
      }

      records.push({
        day: d,
        dateStr,
        salesForecast,
        productionPlan,
        partsReadiness: 100,
        lineOffOutput,
        salesEast,
        salesSouth,
        salesNorth,
        salesSouthwest,
        salesCentral,
        salesNorthwest,
        totalDailySales,
        factoryStock: curFactoryStock,
        inTransitStock: curInTransitStock,
        storeStock: curStoreStock,
        totalAvailableStock,
        replenishmentSignal,
        daysOfSupply,
        healthStatus
      });
    }

    return records;
  }, [selectedModel, planAdjustment, salesMultiplier]);

  // Selected Day Record
  const currentRecord = dailyRecords[selectedDayIndex] || dailyRecords[0];

  // Group 30 daily records into 5 weekly buckets (W1..W5)
  const weeksList = useMemo(() => {
    const weeks = [
      { weekNum: 1, label: 'W1', startDate: '07-01', endDate: '07-07', startIdx: 0, endIdx: 6, repIdx: 6 },
      { weekNum: 2, label: 'W2', startDate: '07-08', endDate: '07-14', startIdx: 7, endIdx: 13, repIdx: 13 },
      { weekNum: 3, label: 'W3', startDate: '07-15', endDate: '07-21', startIdx: 14, endIdx: 20, repIdx: 20 },
      { weekNum: 4, label: 'W4', startDate: '07-22', endDate: '07-28', startIdx: 21, endIdx: 27, repIdx: 27 },
      { weekNum: 5, label: 'W5', startDate: '07-29', endDate: '07-30', startIdx: 28, endIdx: 29, repIdx: 29 },
    ];
    return weeks.map((w) => {
      const recordsInWeek = dailyRecords.slice(w.startIdx, w.endIdx + 1);
      const avgDos = Math.round((recordsInWeek.reduce((a, b) => a + b.daysOfSupply, 0) / recordsInWeek.length) * 10) / 10;
      const dateRangeStr = `${w.startDate} ~ ${w.endDate}`;
      return { ...w, avgDos, dateRangeStr };
    });
  }, [dailyRecords]);

  // Current active Week based on selectedDayIndex
  const currentWeek = useMemo(() => {
    return weeksList.find((w) => selectedDayIndex >= w.startIdx && selectedDayIndex <= w.endIdx) || weeksList[0];
  }, [weeksList, selectedDayIndex]);

  // Aggregated weekly records for weekly table
  const weeklyRecords = useMemo(() => {
    return weeksList.map((w) => {
      const recordsInWeek = dailyRecords.slice(w.startIdx, w.endIdx + 1);
      const plan = recordsInWeek.reduce((a, b) => a + b.productionPlan, 0);
      const lineOff = recordsInWeek.reduce((a, b) => a + b.lineOffOutput, 0);
      const salesE = recordsInWeek.reduce((a, b) => a + b.salesEast, 0);
      const salesS = recordsInWeek.reduce((a, b) => a + b.salesSouth, 0);
      const salesN = recordsInWeek.reduce((a, b) => a + b.salesNorth, 0);
      const salesSW = recordsInWeek.reduce((a, b) => a + b.salesSouthwest, 0);
      const salesC = recordsInWeek.reduce((a, b) => a + b.salesCentral, 0);
      const salesNW = recordsInWeek.reduce((a, b) => a + b.salesNorthwest, 0);
      const totalSales = recordsInWeek.reduce((a, b) => a + b.totalDailySales, 0);
      const endRecord = recordsInWeek[recordsInWeek.length - 1];

      return {
        weekNum: w.weekNum,
        label: w.label,
        dateRangeStr: w.dateRangeStr,
        repIdx: w.repIdx,
        daysCount: recordsInWeek.length,
        productionPlan: plan,
        lineOffOutput: lineOff,
        salesEast: salesE,
        salesSouth: salesS,
        salesNorth: salesN,
        salesSouthwest: salesSW,
        salesCentral: salesC,
        salesNorthwest: salesNW,
        totalSales,
        factoryStock: endRecord.factoryStock,
        inTransitStock: endRecord.inTransitStock,
        storeStock: endRecord.storeStock,
        totalAvailableStock: endRecord.totalAvailableStock,
        daysOfSupply: endRecord.daysOfSupply,
      };
    });
  }, [weeksList, dailyRecords]);

  // Flow period helpers (Daily vs Weekly rate factor)
  const isWeekly = flowPeriod === 'weekly';
  const periodFactor = isWeekly ? 7 : 1;
  const rateUnit = isWeekly ? '辆/周' : '辆/天';

  // Calculate 30-day cumulative summary stats
  const summaryStats = useMemo(() => {
    const totalPlan = dailyRecords.reduce((acc, r) => acc + r.productionPlan, 0);
    const totalLineOff = dailyRecords.reduce((acc, r) => acc + r.lineOffOutput, 0);
    const totalSales = dailyRecords.reduce((acc, r) => acc + r.totalDailySales, 0);
    const avgDailySales = Math.round(totalSales / dailyRecords.length);
    const avgDOS = (dailyRecords.reduce((acc, r) => acc + r.daysOfSupply, 0) / dailyRecords.length).toFixed(1);
    const lineOffAchievement = ((totalLineOff / totalPlan) * 100).toFixed(1);

    return {
      totalPlan,
      totalLineOff,
      totalSales,
      avgDailySales,
      avgDOS,
      lineOffAchievement
    };
  }, [dailyRecords]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              造车全链路 · 日度流速与在存可用天数 (DOS) 动态推算
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              日度产销存流速看板 (Daily Supply-Demand Stream)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              量化到天的日度生产计划、产线下线量、大区销量拆分及在途运力。实时拟合推算<b>在存可用天数 (Days of Supply)</b>，精准定位流速堵点与库存安全阈值。
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 backdrop-blur shrink-0">
            <button
              onClick={() => setSelectedModel('duola')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedModel === 'duola'
                  ? 'bg-emerald-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              多拉大面
            </button>
            <button
              onClick={() => setSelectedModel('v3m8')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedModel === 'v3m8'
                  ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              3米8 微卡
            </button>
          </div>
        </div>

        {/* Top Key Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">全月累计生产计划</span>
            <strong className="text-white text-base font-extrabold">{summaryStats.totalPlan} 辆</strong>
            <span className="text-[9px] text-indigo-300 block font-sans">D-1 归档数据</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">实际产线下线入库</span>
            <strong className="text-emerald-400 text-base font-extrabold">{summaryStats.totalLineOff} 辆</strong>
            <span className="text-[9px] text-slate-400 block font-sans">达成率 {summaryStats.lineOffAchievement}%</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">全月实际总销量</span>
            <strong className="text-blue-400 text-base font-extrabold">{summaryStats.totalSales} 辆</strong>
            <span className="text-[9px] text-slate-400 block font-sans">日均 {summaryStats.avgDailySales} 辆/天</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">在途运输运力</span>
            <strong className="text-cyan-400 text-base font-extrabold">{currentRecord.inTransitStock} 辆</strong>
            <span className="text-[9px] text-cyan-300/80 block font-sans">D-1 归档数据</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">当前总在存车辆 (工厂+在途+门店)</span>
            <strong className="text-amber-400 text-base font-extrabold">{currentRecord.totalAvailableStock} 辆</strong>
          </div>
          <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-700/60">
            <span className="text-[10px] text-indigo-300 block font-sans font-bold">推算在存可用天数 (DOS)</span>
            <strong className={`text-base font-extrabold ${
              currentRecord.daysOfSupply < 12 ? 'text-rose-400' :
              currentRecord.daysOfSupply > 30 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentRecord.daysOfSupply} 天
            </strong>
          </div>
        </div>
      </div>

      {/* Control Toolbar & Timeline Slider */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Flow Period Toggle: Daily vs Weekly */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setFlowPeriod('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  flowPeriod === 'daily'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                日度流速 (D-1)
              </button>
              <button
                onClick={() => setFlowPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  flowPeriod === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                周度流速 (W)
              </button>
            </div>

            <button
              onClick={() => {
                setPlanAdjustment(0);
                setSalesMultiplier(1.0);
                setSelectedDayIndex(14);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置参数
            </button>

            <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded">
                {isWeekly ? 'W 周度账本' : 'D-1 账本'}
              </span>
              当前结账节点: <span className="text-indigo-600 text-sm font-extrabold">
                {isWeekly 
                  ? `第 ${currentWeek.weekNum} 周 W${currentWeek.weekNum} (${currentWeek.dateRangeStr})`
                  : `${currentRecord.dateStr} (第 ${currentRecord.day} 天)`}
              </span>
            </span>
          </div>

          {/* Interactive Parameters Adjusters */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-600 font-sans">{isWeekly ? '周生产计划微调:' : '日生产计划微调:'}</span>
              <input
                type="range"
                min="-50"
                max="60"
                step="5"
                value={planAdjustment}
                onChange={(e) => setPlanAdjustment(parseInt(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded"
              />
              <span className="font-mono text-indigo-600 font-extrabold w-16 text-right">
                {(planAdjustment * (isWeekly ? 7 : 1)) >= 0 ? `+${planAdjustment * (isWeekly ? 7 : 1)}` : planAdjustment * (isWeekly ? 7 : 1)} 辆
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-600 font-sans">终端销量放大倍数:</span>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={salesMultiplier}
                onChange={(e) => setSalesMultiplier(parseFloat(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
              />
              <span className="font-mono text-blue-600 font-extrabold w-10 text-right">
                {salesMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>

        </div>

        {/* Timeline Selector Bar (Daily 1..30 vs Weekly W1..W5) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold px-1">
            <span>{isWeekly ? 'W1 (第1周 07-01)' : '07-01 (月初)'}</span>
            <span className="text-indigo-600 font-mono">
              {isWeekly ? '点击选择周度归档节点 (W1 ~ W5)' : '点击拖拽滑动选择具体天数节点 (1~30日)'}
            </span>
            <span>{isWeekly ? 'W5 (第5周 07-30)' : '07-30 (月末)'}</span>
          </div>

          {isWeekly ? (
            /* Weekly Selector Bar */
            <div className="grid grid-cols-5 gap-2 pt-1">
              {weeksList.map((w) => {
                const isSelected = currentWeek.weekNum === w.weekNum;
                return (
                  <button
                    key={w.weekNum}
                    onClick={() => setSelectedDayIndex(w.repIdx)}
                    className={`h-11 rounded-xl px-2 py-1 text-xs font-mono font-bold flex flex-col items-center justify-center transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-102 z-10'
                        : w.avgDos < 12
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          : w.avgDos > 30
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs">W{w.weekNum}</span>
                      <span className="text-[10px] opacity-85">({w.dateRangeStr})</span>
                    </div>
                    <span className="text-[10px] opacity-90 font-mono mt-0.5">DOS: {w.avgDos}天</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Daily Selector Bar */
            <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 pt-1">
              {dailyRecords.map((r, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    title={`${r.dateStr}: 计划${r.productionPlan}辆, 销量${r.totalDailySales}辆, 在存可用天数${r.daysOfSupply}天`}
                    className={`h-9 rounded-lg text-[10px] font-mono font-bold flex flex-col items-center justify-center transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-105 z-10'
                        : r.daysOfSupply < 12
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          : r.daysOfSupply > 30
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    <span>{r.day}</span>
                    <span className="text-[8px] opacity-80">{r.daysOfSupply}d</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CORE PROCESS FLOW DIAGRAM (每日流速架构图 - Exact Match to Uploaded Image Scheme) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2.5 py-0.5 rounded-md font-mono uppercase">
              Supply-Demand Loop Diagram
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              造车全链路流速关系流程图 ({currentRecord.dateStr} {isWeekly ? '周度流速' : '实时日流速'})
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              实时供给流
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              需求消纳流
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
              补货/预测反馈闭环
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <span className="w-3 h-3 rounded border-2 border-dashed border-indigo-500 bg-indigo-50 inline-block"></span>
              虚线 = 线下环节 (生产计划 / 销售申请)
            </span>
          </div>
        </div>

        {/* SVG/Interactive Flow Chart Diagram based on the user's uploaded schematic */}
        <div className="relative bg-slate-50/90 rounded-2xl p-6 sm:p-8 border border-slate-200/90 overflow-x-auto min-w-[800px] space-y-6">

          {/* TOP LOOP LABEL: 销售预测 */}
          <div className="flex justify-center">
            <div className="bg-indigo-900 text-white text-[11px] font-bold px-5 py-2 rounded-full shadow-md flex items-center gap-2 border border-indigo-700 font-mono">
              <TrendingUp className="w-4 h-4 text-indigo-300" />
              <span>销售预测驱动源: <strong>{currentRecord.salesForecast * periodFactor} {rateUnit}</strong> (基于月预测标准推算)</span>
            </div>
          </div>

          {/* Core Process Flow Layout */}
          <div className="grid grid-cols-5 gap-4 items-center relative py-4">
            
            {/* Arrow SVG Lines overlaying behind */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" overflow="visible">
              <defs>
                <marker id="arrowHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrowHeadIndigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {/* NODE 1: 生产计划 (线下环节 - 虚线框) */}
            <div 
              onClick={() => setSelectedNode('plan')}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer shadow-sm hover:shadow-md relative z-10 ${
                selectedNode === 'plan' 
                  ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-100/60' 
                  : 'border-indigo-300/80 bg-indigo-50/40 hover:bg-indigo-50/70 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-2">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase">1. 供给前置</span>
                <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100 border border-indigo-300 px-1.5 py-0.5 rounded">线下</span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                生产计划 <span className="text-[10px] text-indigo-600 font-bold">(线下)</span>
              </h3>
              <div className="mt-2 font-mono space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isWeekly ? '周计划量:' : '日计划量:'}</span>
                  <strong className="text-indigo-600 font-bold">{currentRecord.productionPlan * periodFactor} {rateUnit}</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">基准微调:</span>
                  <span className={planAdjustment >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {(planAdjustment * periodFactor) >= 0 ? `+${planAdjustment * periodFactor}` : planAdjustment * periodFactor}
                  </span>
                </div>
              </div>
            </div>

            {/* NODE 2: 生产入库 (供给) */}
            <div 
              onClick={() => setSelectedNode('lineoff')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md relative z-10 ${
                selectedNode === 'lineoff' ? 'ring-2 ring-emerald-600 border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase">2. 实际产下线</span>
                <Factory className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900">生产入库 (供给)</h3>
              <div className="mt-2 font-mono space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isWeekly ? '本周下线:' : '今日下线:'}</span>
                  <strong className="text-emerald-600 font-bold">{currentRecord.lineOffOutput * periodFactor} {rateUnit}</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">下线达成率:</span>
                  <span className="text-slate-700 font-bold">{Math.round((currentRecord.lineOffOutput / currentRecord.productionPlan) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* NODE 3: 销售订单 (需求) */}
            <div 
              onClick={() => setSelectedNode('sales')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md relative z-10 ${
                selectedNode === 'sales' ? 'ring-2 ring-blue-600 border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase">3. 终端消化</span>
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900">销售订单 (需求)</h3>
              <div className="mt-2 font-mono space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isWeekly ? '本周销量:' : '今日销量:'}</span>
                  <strong className="text-blue-600 font-bold">{currentRecord.totalDailySales * periodFactor} {rateUnit}</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">大区汇总:</span>
                  <span className="text-slate-600 font-bold">6大区域</span>
                </div>
              </div>
            </div>

            {/* NODE 4: 整体库存 (库存-工厂 + 在途 + 库存-门店) */}
            <div 
              onClick={() => setSelectedNode('stock')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-900 text-white shadow-md hover:shadow-lg relative z-10 col-span-1 border-slate-700 ${
                selectedNode === 'stock' ? 'ring-2 ring-amber-400 border-amber-400' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase">4. 实体池蓄水</span>
                <Warehouse className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xs font-extrabold text-white">整体库存 (池)</h3>
              <div className="mt-2 font-mono space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>● 工厂仓积水:</span>
                  <strong className="text-amber-300">{currentRecord.factoryStock} 辆</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>● 在途运输运力:</span>
                  <strong className="text-cyan-300">{currentRecord.inTransitStock} 辆</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>● 门店店头库存:</span>
                  <strong className="text-emerald-300">{currentRecord.storeStock} 辆</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5 text-xs font-extrabold">
                  <span className="text-white">合计在存总车辆:</span>
                  <span className="text-amber-400">{currentRecord.totalAvailableStock} 辆</span>
                </div>
              </div>
            </div>

            {/* NODE 5: 销售申请 (补货信号 - 线下环节 - 虚线框) */}
            <div 
              onClick={() => setSelectedNode('replenish')}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer shadow-sm hover:shadow-md relative z-10 ${
                selectedNode === 'replenish' 
                  ? 'ring-2 ring-violet-600 border-violet-500 bg-violet-100/60' 
                  : 'border-violet-300/80 bg-violet-50/40 hover:bg-violet-50/70 hover:border-violet-400'
              }`}
            >
              <div className="flex items-center justify-between border-b border-violet-100 pb-2 mb-2">
                <span className="text-[10px] font-extrabold text-violet-700 uppercase">5. 触发补货</span>
                <span className="text-[9px] font-extrabold text-violet-700 bg-violet-100 border border-violet-300 px-1.5 py-0.5 rounded">线下</span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                销售申请 <span className="text-[10px] text-violet-600 font-bold">(线下)</span>
              </h3>
              <div className="mt-2 font-mono space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">补货需求:</span>
                  <strong className="text-violet-600 font-bold">+{currentRecord.replenishmentSignal} 辆</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">安全水位:</span>
                  <span className="text-slate-600 font-bold">12天销售额</span>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: 在存可用天数 KEY METRIC CARD */}
          <div className="mt-4 pt-4 border-t border-slate-200/80">
            {/* DERIVED OUTPUT METRIC: 在存可用天数 (Days of Supply) */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans ${
              currentRecord.daysOfSupply < 12
                ? 'bg-rose-500 text-white border-rose-600'
                : currentRecord.daysOfSupply > 30
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  currentRecord.daysOfSupply < 12 || currentRecord.daysOfSupply > 30 ? 'bg-white/20' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold opacity-80 uppercase block tracking-wider">
                    {isWeekly ? 'W 周度归档推算 · 动态核心流速指标' : 'D-1 归档数据推算 · 动态核心流速指标'}
                  </span>
                  <h4 className="text-base font-extrabold">在存可用天数 (Days of Supply, DOS)</h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    计算公式 = {isWeekly ? '期末' : 'D-1'} 总在存车辆 ({currentRecord.totalAvailableStock}辆) ÷ 日均销量 ({currentRecord.totalDailySales}辆/天)
                  </p>
                </div>
              </div>

              <div className="font-mono text-left sm:text-right shrink-0">
                <span className="text-3xl font-extrabold">{currentRecord.daysOfSupply} 天</span>
                <span className="text-[10px] block font-extrabold uppercase mt-0.5">
                  {currentRecord.daysOfSupply < 12 && '⚠️ 缺货卡断风险 (DOS < 12d)'}
                  {currentRecord.daysOfSupply >= 12 && currentRecord.daysOfSupply <= 30 && '🟢 精益健康状态 (12d ≤ DOS ≤ 30d)'}
                  {currentRecord.daysOfSupply > 30 && '🔴 存货严重占压 (DOS > 30d)'}
                </span>
              </div>
            </div>
          </div>

          {/* STANDARDS FOOTER RIBBON: 销售预测 & 安全库存 标准说明 (已移动至最下方) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md mt-6">
            
            {/* Standard 1: Sales Forecast Standard */}
            <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-extrabold text-white">【销售预测标准】Sales Forecast Standard</h3>
              </div>
              <div className="text-[11px] text-slate-300 font-mono space-y-1">
                <p>● <b>计算算式:</b> <code>日预测量 = (S&OP月度预测 ÷ 30) × 周末/节假日系数(1.25x) × 区域权重</code></p>
                <p>● <b>核算依据:</b> 基于近30天日均销量走势 + 大区提报意向订单 + 营销促销增量系数。</p>
                <p>● <b>闭环作用:</b> 向上指导<b>生产计划</b>与<b>采购备料</b>，与日实际销售对比计算产销率。</p>
              </div>
            </div>

            {/* Standard 2: Safety Stock Standard */}
            <div className="space-y-2 md:pl-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-extrabold text-white">【安全库存标准】Safety Stock Standard</h3>
              </div>
              <div className="text-[11px] text-slate-300 font-mono space-y-1">
                <p>● <b>基准线定义:</b> 设定为 <b>12 ~ 15 天日均销量</b>（即 S&OP 月预测销量的 1.5 ~ 2.0 倍缓冲）。</p>
                <p>● <b>缺货预警 (DOS &lt; 12天):</b> 整体在存车辆穿透底线，触发“销售申请/补货”强信号。</p>
                <p>● <b>积压预警 (DOS &gt; 30天):</b> 库存占用超1个月，触发工厂排产减量与渠道去库指令。</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* REGIONAL SALES BREAKDOWN (每日/周度销量拆分到大区) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-md font-mono uppercase">
              {isWeekly ? 'Weekly Regional Sales' : 'Regional Sales Breakdown'}
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              [{isWeekly ? `W${currentWeek.weekNum} (${currentWeek.dateRangeStr})` : currentRecord.dateStr}] {isWeekly ? '周度销量大区细化拆分看板' : '每日销量大区细化拆分看板'}
            </h2>
          </div>
          <div className="font-mono text-xs text-slate-500">
            当月{isWeekly ? '本周' : '今日'}全国实际总销量: <strong className="text-blue-600 text-sm font-extrabold">
              {isWeekly ? (weeklyRecords[currentWeek.weekNum - 1]?.totalSales || currentRecord.totalDailySales * 7) : currentRecord.totalDailySales} 辆{isWeekly ? '/周' : '/天'}
            </strong>
          </div>
        </div>

        {/* 6 Regional Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGIONS.map((region) => {
            const curWeekRec = weeklyRecords[currentWeek.weekNum - 1];
            let salesVal = isWeekly 
              ? (region.id === 'east' ? curWeekRec.salesEast : region.id === 'south' ? curWeekRec.salesSouth : region.id === 'north' ? curWeekRec.salesNorth : region.id === 'southwest' ? curWeekRec.salesSouthwest : region.id === 'central' ? curWeekRec.salesCentral : curWeekRec.salesNorthwest)
              : (region.id === 'east' ? currentRecord.salesEast : region.id === 'south' ? currentRecord.salesSouth : region.id === 'north' ? currentRecord.salesNorth : region.id === 'southwest' ? currentRecord.salesSouthwest : region.id === 'central' ? currentRecord.salesCentral : currentRecord.salesNorthwest);

            const totalSalesVal = isWeekly ? curWeekRec.totalSales : currentRecord.totalDailySales;
            const regionShare = ((salesVal / (totalSalesVal || 1)) * 100).toFixed(1);

            return (
              <div 
                key={region.id}
                className={`p-4 rounded-2xl border ${region.bgLight} ${region.borderColor} space-y-3 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${region.textColor}`} />
                    <span className={`text-xs font-extrabold ${region.textColor}`}>{region.name}</span>
                  </div>
                  <span className="text-[10px] bg-white/80 font-mono font-bold px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    负责人: {region.manager}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">{isWeekly ? '本周大区销量' : '今日大区销量'}</span>
                    <strong className={`text-xl font-extrabold font-mono ${region.textColor}`}>{salesVal} 辆</strong>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-[10px] text-slate-400 block font-sans">全国占比</span>
                    <span className="font-extrabold text-slate-800">{regionShare}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, parseFloat(regionShare) * 2.5)}%`, backgroundColor: region.color }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>枢纽分拨仓: {region.hubCity}</span>
                  <span className="text-emerald-600 font-bold">交付率 98.4%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL MONTH LEDGER TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-md font-mono uppercase">
              {isWeekly ? 'Weekly Ledger' : 'Full Month Daily Ledger'}
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              {isWeekly 
                ? '全月 5 周周度生产、下线、大区销量及在存可用天数 (DOS) 完整账本' 
                : '全月 30 天日度生产、下线、大区销量及在存可用天数 (DOS) 完整账本'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {isWeekly ? '共计 5 周节点数据明细' : '共计 30 节点数据明细'}
          </span>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-[11px] font-sans">
                <th className="p-3 font-bold border-b border-slate-800">{isWeekly ? '周度 (时间段)' : '日期'}</th>
                <th className="p-3 font-bold border-b border-slate-800">{isWeekly ? '周生产计划' : '生产计划'}</th>
                <th className="p-3 font-bold border-b border-slate-800">{isWeekly ? '周下线入库' : '产线下线入库'}</th>
                <th className="p-3 font-bold border-b border-slate-800">华东</th>
                <th className="p-3 font-bold border-b border-slate-800">华南</th>
                <th className="p-3 font-bold border-b border-slate-800">华北</th>
                <th className="p-3 font-bold border-b border-slate-800">西南</th>
                <th className="p-3 font-bold border-b border-slate-800">华中/西北</th>
                <th className="p-3 font-bold border-b border-slate-800 text-blue-400">{isWeekly ? '周总销量' : '日总销量'}</th>
                <th className="p-3 font-bold border-b border-slate-800">{isWeekly ? '期末工厂仓' : '工厂仓'}</th>
                <th className="p-3 font-bold border-b border-slate-800 text-cyan-400">{isWeekly ? '期末在途量' : '在途量'}</th>
                <th className="p-3 font-bold border-b border-slate-800">{isWeekly ? '期末门店仓' : '门店仓'}</th>
                <th className="p-3 font-bold border-b border-slate-800 text-amber-400">{isWeekly ? '期末总在存' : '总在存车辆'}</th>
                <th className="p-3 font-bold border-b border-slate-800 text-indigo-300">可用天数 (DOS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {isWeekly ? (
                weeklyRecords.map((w) => {
                  const isSelected = currentWeek.weekNum === w.weekNum;
                  return (
                    <tr 
                      key={w.weekNum}
                      onClick={() => setSelectedDayIndex(w.repIdx)}
                      className={`transition cursor-pointer ${
                        isSelected ? 'bg-indigo-50/90 font-bold border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 font-extrabold text-slate-900">
                        W{w.weekNum} <span className="text-[10px] text-slate-500 font-normal">({w.dateRangeStr})</span>
                      </td>
                      <td className="p-3 text-slate-700">{w.productionPlan} 辆</td>
                      <td className="p-3 text-emerald-600 font-bold">{w.lineOffOutput} 辆</td>
                      <td className="p-3 text-slate-600">{w.salesEast}</td>
                      <td className="p-3 text-slate-600">{w.salesSouth}</td>
                      <td className="p-3 text-slate-600">{w.salesNorth}</td>
                      <td className="p-3 text-slate-600">{w.salesSouthwest}</td>
                      <td className="p-3 text-slate-600">{w.salesCentral + w.salesNorthwest}</td>
                      <td className="p-3 text-blue-600 font-extrabold">{w.totalSales} 辆</td>
                      <td className="p-3 text-slate-600">{w.factoryStock}</td>
                      <td className="p-3 text-cyan-600 font-bold">{w.inTransitStock}</td>
                      <td className="p-3 text-slate-600">{w.storeStock}</td>
                      <td className="p-3 text-amber-600 font-extrabold">{w.totalAvailableStock} 辆</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${
                          w.daysOfSupply < 12 
                            ? 'bg-rose-100 text-rose-700' 
                            : w.daysOfSupply > 30 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {w.daysOfSupply} 天
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                dailyRecords.map((r, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <tr 
                      key={idx}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`transition cursor-pointer ${
                        isSelected ? 'bg-indigo-50/90 font-bold border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 font-extrabold text-slate-900">{r.dateStr}</td>
                      <td className="p-3 text-slate-700">{r.productionPlan} 辆</td>
                      <td className="p-3 text-emerald-600 font-bold">{r.lineOffOutput} 辆</td>
                      <td className="p-3 text-slate-600">{r.salesEast}</td>
                      <td className="p-3 text-slate-600">{r.salesSouth}</td>
                      <td className="p-3 text-slate-600">{r.salesNorth}</td>
                      <td className="p-3 text-slate-600">{r.salesSouthwest}</td>
                      <td className="p-3 text-slate-600">{r.salesCentral + r.salesNorthwest}</td>
                      <td className="p-3 text-blue-600 font-extrabold">{r.totalDailySales} 辆</td>
                      <td className="p-3 text-slate-600">{r.factoryStock}</td>
                      <td className="p-3 text-cyan-600 font-bold">{r.inTransitStock}</td>
                      <td className="p-3 text-slate-600">{r.storeStock}</td>
                      <td className="p-3 text-amber-600 font-extrabold">{r.totalAvailableStock} 辆</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${
                          r.daysOfSupply < 12 
                            ? 'bg-rose-100 text-rose-700' 
                            : r.daysOfSupply > 30 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.daysOfSupply} 天
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
