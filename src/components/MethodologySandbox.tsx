/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Calculator,
  BookOpen
} from 'lucide-react';

export default function MethodologySandbox() {
  // Inventory Parameters
  const [forecastDailySales, setForecastDailySales] = useState<number>(100); // 预测日销量
  const [supplierLeadTime, setSupplierLeadTime] = useState<number>(20); // 供应商交期 (天)
  const [safetyStockDays, setSafetyStockDays] = useState<number>(10); // 安全库存天数 (天)
  const [currentStock, setCurrentStock] = useState<number>(1500); // 当前可用库存 (个)
  const [inTransit, setInTransit] = useState<number>(800); // 在途采购 (个)
  const [proposeQty, setProposeQty] = useState<number>(2200); // 本次申请采购量 (个)

  // Calculations based on page 7 formulas
  // 1. 零部件预测需求量 = 日销量 * 交期 
  const forecastDemandInLeadTime = forecastDailySales * supplierLeadTime;
  
  // 2. 安全库存量
  const safetyStockQty = forecastDailySales * safetyStockDays;
  
  // 3. 建议采购量 = 预测需求 + 安全库存 - 当前可用 - 在途
  const suggestedQty = Math.max(0, forecastDemandInLeadTime + safetyStockQty - currentStock - inTransit);

  // 4. 采购上下限
  const lowerBoundLimit = Math.round(suggestedQty * 0.8);
  const upperBoundLimit = Math.round(suggestedQty * 1.2);

  // 5. 采购后覆盖天数 = (当前库存 + 在途 + 本次采购) / 日销量
  const totalPostSupply = currentStock + inTransit + proposeQty;
  const postCoverageDays = Math.round(totalPostSupply / forecastDailySales);

  // Risk Judgment logic (Page 8-9)
  let riskLevel: 'NORMAL' | 'WATCH' | 'RISK' | 'HIGH_RISK' | 'SHORTAGE' = 'NORMAL';
  let riskColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let riskText = '供给合理 (正常)';
  let actionSuggestion = '建议审批：通过。采购数量契合消耗模型，库存周期处于30-60天黄金区间。';

  const riskThresholdShortage = supplierLeadTime + safetyStockDays; // 30天
  
  if (postCoverageDays < riskThresholdShortage) {
    riskLevel = 'SHORTAGE';
    riskColor = 'text-red-500 bg-red-500/10 border-red-500/20';
    riskText = '缺料风险';
    actionSuggestion = '建议审批：驳回并追加！采购量不足，采购后库存天数低于供应商交期+安全天数之和，面临断料停产风险。';
  } else if (postCoverageDays >= 30 && postCoverageDays <= 60) {
    riskLevel = 'NORMAL';
    riskColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    riskText = '正常区间';
    actionSuggestion = '建议审批：通过。本次采购数量合理，预计库存覆盖30-60天，资金周转良好。';
  } else if (postCoverageDays > 60 && postCoverageDays <= 90) {
    riskLevel = 'WATCH';
    riskColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    riskText = '需关注';
    actionSuggestion = '建议审批：复核。供给量略高，库存天数处于60-90天。若未来销量看涨，可予以放行，否则应适当缩减采购量。';
  } else if (postCoverageDays > 90 && postCoverageDays <= 120) {
    riskLevel = 'RISK';
    riskColor = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    riskText = '积压风险';
    actionSuggestion = '建议审批：缩减采购。库存覆盖超90天，将造成长期库存积压与资金占用。建议削减采购量至合理上限以内。';
  } else {
    riskLevel = 'HIGH_RISK';
    riskColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
    riskText = '高积压风险 (呆滞)';
    actionSuggestion = '建议审批：一键驳回！库存覆盖超过120天，产生严重长库龄及呆滞死库，浪费大量企业运营现金流！';
  }

  // Generate Chart Path coordinates (60-day timeline)
  // We plot 60 days on X-axis (0 to 600 px)
  // Max Y is 6000 (0 to 300 px high)
  const chartWidth = 550;
  const chartHeight = 250;
  const maxQty = 6000;

  const getX = (day: number) => (day / 60) * chartWidth;
  const getY = (qty: number) => chartHeight - (qty / maxQty) * chartHeight;

  // Let's model the supply level curve over 60 days.
  // Day 0: currentStock
  // Daily consumption: forecastDailySales.
  // On Day "supplierLeadTime" (arrival), quantity increases by (inTransit + proposeQty)
  // Let's plot points for the actual supply line (Red Line)
  let supplyPoints = '';
  for (let d = 0; d <= 60; d++) {
    let qty = currentStock - forecastDailySales * d;
    if (d >= supplierLeadTime) {
      qty += inTransit + proposeQty;
      // also factor consumption after arrival
      qty -= forecastDailySales * (d - supplierLeadTime);
    }
    qty = Math.max(0, qty);
    supplyPoints += `${d === 0 ? 'M' : 'L'} ${getX(d)} ${getY(qty)} `;
  }

  // Constants flat references (or daily limit reference as in page 4 of PDF)
  // Upper Limit: Orange flat line representing Upper Bound of Reasonable Qty
  // Let's define the orange line as safety stock + suggested upper bound limit
  const orangeLineVal = safetyStockQty + (forecastDailySales * 40); // 40 days coverage upper limit
  const greenLineVal = safetyStockQty; // safety stock lower limit

  // Blue Line: Future Forecasted Cumulative Demand (diagonal ascending) OR Future demand baseline.
  // Page 4 blue line is average forecasted demand reference line.
  // Let's draw Blue line as Forecast Cumulative Demand over 60 days
  let bluePoints = '';
  for (let d = 0; d <= 60; d++) {
    const qty = forecastDailySales * d;
    bluePoints += `${d === 0 ? 'M' : 'L'} ${getX(d)} ${getY(qty)} `;
  }

  // Find if Red line goes above Orange at any point
  const peakStock = currentStock + inTransit + proposeQty - forecastDailySales * supplierLeadTime;
  const isOverstocked = peakStock > orangeLineVal;

  // Find if Red line falls below Green
  let isShortage = false;
  for (let d = 0; d <= 60; d++) {
    let qty = currentStock - forecastDailySales * d;
    if (d >= supplierLeadTime) {
      qty += inTransit + proposeQty;
      qty -= forecastDailySales * (d - supplierLeadTime);
    }
    if (qty < greenLineVal && d < 45) { // within immediate 45 days timeline
      isShortage = true;
      break;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">2.3 需求预测驱动库存阈值沙盘</h2>
          <p className="text-xs text-slate-500">
            核心方法：融合销量预测、供应商交期、安全库存与排产BOM，建立动态阈值区间
          </p>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-mono text-slate-600 flex items-center gap-1">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          科学算账模型
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800">沙盘参数动态调节</h3>
          </div>

          <div className="space-y-4">
            {/* 1. 销量预测 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1">
                  未来车型销量预测
                  <HelpCircle className="w-3 h-3 text-slate-400" title="对应车型未来日均预期消耗量" />
                </span>
                <span className="font-mono font-bold text-slate-800">{forecastDailySales} 辆/天</span>
              </div>
              <input 
                type="range" min="20" max="200" value={forecastDailySales} 
                onChange={(e) => setForecastDailySales(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. 供应商交期 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">供应商生产及物流交期 (L/T)</span>
                <span className="font-mono font-bold text-slate-800">{supplierLeadTime} 天</span>
              </div>
              <input 
                type="range" min="5" max="40" value={supplierLeadTime} 
                onChange={(e) => setSupplierLeadTime(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. 安全库存天数 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">工厂安全存料天数 (缓冲)</span>
                <span className="font-mono font-bold text-slate-800">{safetyStockDays} 天</span>
              </div>
              <input 
                type="range" min="2" max="25" value={safetyStockDays} 
                onChange={(e) => setSafetyStockDays(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 my-2 pt-2"></div>

            {/* 4. 当前可用库存 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">当前在库账面可用库存</span>
                <span className="font-mono font-bold text-slate-800">{currentStock.toLocaleString()} 个</span>
              </div>
              <input 
                type="range" min="200" max="4000" step="100" value={currentStock} 
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* 5. 在途采购 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">已下单但在途采购 (即将到货)</span>
                <span className="font-mono font-bold text-slate-800">{inTransit.toLocaleString()} 个</span>
              </div>
              <input 
                type="range" min="0" max="3000" step="100" value={inTransit} 
                onChange={(e) => setInTransit(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* 6. 本次采购申请 */}
            <div className="space-y-1.5 p-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex justify-between text-xs">
                <span className="text-amber-800 font-bold">本次申请采购提案</span>
                <span className="font-mono font-bold text-amber-900">{proposeQty.toLocaleString()} 个</span>
              </div>
              <input 
                type="range" min="200" max="5000" step="100" value={proposeQty} 
                onChange={(e) => setProposeQty(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-amber-200 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-amber-600 mt-1">
                滑动调整采购额，右侧可实时观察阈值超标或不足。
              </p>
            </div>
          </div>
        </div>

        {/* Chart and Math Output Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Status Display Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">采购审批风险判定</div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskColor}`}>
                  {riskText}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  覆盖 {postCoverageDays} 天消耗
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400">系统科学建议采购量</div>
              <div className="text-lg font-mono font-bold text-emerald-600">
                {suggestedQty.toLocaleString()} <span className="text-xs font-normal text-slate-500">个</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Chart */}
          <div className="relative border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-center items-center">
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-500 pb-2 border-b border-slate-100 w-full mb-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
                未来预测需求
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-red-500 inline-block"></span>
                本次采购后供给水位
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-orange-500 inline-block"></span>
                合理供给上限
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
                安全库存下限
              </div>
            </div>

            {/* SVG Content */}
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid lines */}
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#cbd5e1" strokeWidth="1.5" />
              
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="3" />
              <line x1={getX(30)} y1="0" x2={getX(30)} y2={chartHeight} stroke="#e2e8f0" strokeDasharray="4" />
              
              {/* Grid Label Day 30 */}
              <text x={getX(30)} y={chartHeight - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">
                第 30 天
              </text>
              <text x={getX(60) - 10} y={chartHeight - 4} fontSize="9" fill="#94a3b8" textAnchor="end">
                第 60 天
              </text>

              {/* Safety stock Green line (lower bound) */}
              <line 
                x1="0" y1={getY(greenLineVal)} 
                x2={chartWidth} y2={getY(greenLineVal)} 
                stroke="#10b981" strokeWidth="2" strokeDasharray="5"
              />
              <text x="5" y={getY(greenLineVal) - 4} fontSize="8" fill="#10b981" className="font-bold">
                安全水位下限: {greenLineVal} (内控 {safetyStockDays} 天)
              </text>

              {/* Reasonable upper limit Orange line */}
              <line 
                x1="0" y1={getY(orangeLineVal)} 
                x2={chartWidth} y2={getY(orangeLineVal)} 
                stroke="#f97316" strokeWidth="2" strokeDasharray="5"
              />
              <text x="5" y={getY(orangeLineVal) - 4} fontSize="8" fill="#f97316" className="font-bold">
                合理供给上限: {orangeLineVal}
              </text>

              {/* Cumulative Forecast Demand Line (Blue) */}
              <path 
                d={bluePoints} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                strokeDasharray="3"
              />
              
              {/* Supply sawtooth curve (Red) */}
              <path 
                d={supplyPoints} 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2.5" 
                className="transition-all duration-300"
              />

              {/* Alert Annotations inside graph */}
              {isOverstocked && (
                <g transform={`translate(${getX(supplierLeadTime + 5)}, ${getY(peakStock) - 25})`}>
                  <rect x="-40" y="-12" width="80" height="18" rx="4" fill="#ef4444" />
                  <text x="0" y="0" fill="white" fontSize="9" textAnchor="middle" className="font-bold">
                    ⚠️ 积压风险
                  </text>
                  <path d="M 0 6 L -3 10 L 3 10 Z" fill="#ef4444" transform="translate(0, -1)" />
                </g>
              )}

              {isShortage && (
                <g transform={`translate(${getX(supplierLeadTime - 4)}, ${getY(0) - 20})`}>
                  <rect x="-40" y="-12" width="80" height="18" rx="4" fill="#f97316" />
                  <text x="0" y="0" fill="white" fontSize="9" textAnchor="middle" className="font-bold">
                    ⚠️ 缺料风险
                  </text>
                  <path d="M 0 6 L -3 10 L 3 10 Z" fill="#f97316" transform="translate(0, -1)" />
                </g>
              )}
            </svg>

            {/* Axes names */}
            <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-400">Y轴: 零部件库存水位 (个)</div>
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-400">X轴: 消耗时间进程 (天)</div>
          </div>

          {/* Action and Calculations Explanation card */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-emerald-500" />
                系统审核判定详情 & 意见：
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {actionSuggestion}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">预测交期需求</div>
                <div className="text-xs font-bold font-mono text-slate-700">{forecastDemandInLeadTime} 个</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">内控安全库存</div>
                <div className="text-xs font-bold font-mono text-slate-700">{safetyStockQty} 个</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">采购合规区间</div>
                <div className="text-xs font-bold font-mono text-slate-700">{lowerBoundLimit} - {upperBoundLimit} 个</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">采购后总水位</div>
                <div className="text-xs font-bold font-mono text-slate-700">{totalPostSupply} 个</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2.4 Live Formula Math Explainer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">2.4 核心算账公式·实时数据推演</h3>
            <p className="text-[11px] text-slate-400">结合当期调节的沙盘参数，为您实时解构各指标计算的全链条数理推导过程</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Step 1 */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">步骤一</span>
                <span className="text-[9px] text-slate-400 font-mono">L/T Demand</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">预测交期需求量 (F)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                从采购下单到到货期间，正常装车生产将消耗的物料数量。若采购量低于此值，必然在运输期内断料。
              </p>
            </div>
            <div className="mt-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono text-center">
                <div className="text-[9px] text-slate-500 mb-0.5">计算公式：F = D × L</div>
                <div className="text-xs font-bold text-white">
                  {forecastDailySales} <span className="text-slate-500">辆/天</span> × {supplierLeadTime} <span className="text-slate-500">天</span> = <span className="text-emerald-400 font-extrabold">{forecastDemandInLeadTime.toLocaleString()}</span> <span className="text-slate-300 text-[10px]">个</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">步骤二</span>
                <span className="text-[9px] text-slate-400 font-mono">Safety Buffer</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">内控安全库存量 (S)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                应对突发的销量飙升、供应商运输延迟、物流异常等不确定因素，工厂必须持有的底线安全蓄水池。
              </p>
            </div>
            <div className="mt-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono text-center">
                <div className="text-[9px] text-slate-500 mb-0.5">计算公式：S = D × S_days</div>
                <div className="text-xs font-bold text-white">
                  {forecastDailySales} <span className="text-slate-500">辆/天</span> × {safetyStockDays} <span className="text-slate-500">天</span> = <span className="text-emerald-400 font-extrabold">{safetyStockQty.toLocaleString()}</span> <span className="text-slate-300 text-[10px]">个</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">步骤三</span>
                <span className="text-[9px] text-slate-400 font-mono">Suggested Qty</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">科学建议采购量 (P)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                拉动式采购核心。扣除已有可用水位（在库与在途），只追加净缺口，防止不管不顾、盲目盲目囤货。
              </p>
            </div>
            <div className="mt-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono text-center">
                <div className="text-[9px] text-slate-500 mb-0.5">计算公式：P = max(0, F + S - I_c - I_t)</div>
                <div className="text-xs font-bold text-white truncate">
                  max(0, {forecastDemandInLeadTime} + {safetyStockQty} - {currentStock} - {inTransit}) = <span className="text-blue-400 font-extrabold">{suggestedQty.toLocaleString()}</span> <span className="text-slate-300 text-[10px]">个</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10">步骤四</span>
                <span className="text-[9px] text-slate-400 font-mono">Acceptable Range</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">采购合规偏离区间</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                考虑供应商最小起订量（MOQ）、装卡箱包规及整车货运拼车等，合理采购提报允许在 80%~120% 内。
              </p>
            </div>
            <div className="mt-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono text-center">
                <div className="text-[9px] text-slate-500 mb-0.5">公式：[P × 0.8, P × 1.2]</div>
                <div className="text-xs font-bold text-white">
                  [{lowerBoundLimit.toLocaleString()}, {upperBoundLimit.toLocaleString()}] <span className="text-slate-300 text-[10px]">个</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">步骤五</span>
                <span className="text-[9px] text-slate-400 font-mono">Days of Cover</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">采购后可用库存覆盖天数 (T)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                若通过本次提报，工厂持有的所有水位（在库+在途+本次采购）可安全支撑多少天的整车装载生产消耗。
              </p>
            </div>
            <div className="mt-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono text-center">
                <div className="text-[9px] text-slate-500 mb-0.5">计算公式：T = (I_c + I_t + P_propose) / D</div>
                <div className="text-xs font-bold text-white">
                  ({currentStock} + {inTransit} + {proposeQty}) / {forecastDailySales} = <span className="text-amber-400 font-extrabold">{postCoverageDays}</span> <span className="text-slate-300 text-[10px]">天</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Insights Card */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-slate-200 text-xs font-bold mb-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>拉动式算法运作精髓</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                打破传统采购粗放提报。通过<strong>日销量滚动</strong>反向逼近并极限压榨在库、在途水位，使得当期采购提报可依市场冷热自行高弹缩放。
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
              <span className="text-slate-500">模型运算校验：</span>
              <span className="text-emerald-400 font-bold">100% 动态实时联动</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
