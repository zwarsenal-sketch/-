/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { initialVehicles, initialParts } from '../data';
import { VehicleStock, PartsRequest } from '../types';
import { 
  Car, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Truck, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Info,
  Layers,
  Calendar,
  Warehouse,
  Sliders,
  Activity,
  FileText,
  ShieldAlert,
  ClipboardCheck,
  TrendingDown
} from 'lucide-react';

export default function ScenarioSimulator() {
  const [vehicles, setVehicles] = useState<VehicleStock[]>(initialVehicles);
  const [parts, setParts] = useState<PartsRequest[]>(initialParts);
  const [activeTab, setActiveTab] = useState<'vehicle' | 'parts' | 'approval'>('vehicle');
  
  // Interactive logs/results for actions
  const [vehicleMessage, setVehicleMessage] = useState<string>('');
  const [partsApprovedStatus, setPartsApprovedStatus] = useState<Record<string, { action: string; msg: string; savedMoney: number; customReason?: string }>>({});
  const [selectedApprovalPartId, setSelectedApprovalPartId] = useState<string>('p0');
  const [customReason, setCustomReason] = useState<string>('');
  const [trendModelIdx, setTrendModelIdx] = useState<number>(0);

  // 1. Vehicle stock actions
  const handleTransfer = (vehicleId: string) => {
    // Simulated Cross-region transfer (A has 900, B has 300 -> transfer 300 from A to B)
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId && v.id === 'v1') {
        const updatedV = { ...v };
        updatedV.regionStock = {
          regionA: { stock: 600, sales: 4 }, // A goes to 600
          regionB: { stock: 600, sales: 8 }, // B goes to 600
        };
        setVehicleMessage(`【调拨成功】多拉3米8：已发起跨区域调拨，从华东A仓（高库存积压）向华南B仓（严重缺货）调拨车辆 300 辆。调拨后两地库存天数均优化至 75-150 天，供需达成平衡！`);
        return updatedV;
      }
      return v;
    }));
  };

  const handleAdjustReplenish = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        if (v.id === 'v2') {
          // v2: Standard Business Sedan, high demand, low stock. We should ramp up production!
          const updatedV = { ...v };
          updatedV.inTransit += 500; // scheduled production increased
          setVehicleMessage(`【生产计划调整】多拉大面：已在MES系统追加紧急排产单 500 辆。工厂可售库存预测覆盖天数将由 14.6 天拉升至 32.5 天，成功解除交付延期及缺货闭环风险！`);
          return updatedV;
        }
        if (v.id === 'v1') {
          // v1: High stock, low demand. Suspend production!
          const updatedV = { ...v };
          updatedV.inTransit = 0; // Suspend production replenishment
          setVehicleMessage(`【排产卡点成功】多拉3米8：已暂停排产，减少在途 300 辆，削减资金占用 2940 万元，拦截潜在长库龄积压风险！`);
          return updatedV;
        }
      }
      return v;
    }));
  };

  const handleResetVehicles = () => {
    setVehicles(initialVehicles);
    setVehicleMessage('整车数据已恢复初始状态。');
  };

  // 2. Parts purchase approvals
  const handlePartApproval = (partId: string, decision: 'APPROVE' | 'REJECT' | 'REDUCE' | 'INCREASE', reason?: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    let savedMoney = 0;
    let action = '';
    let msg = '';

    const totalAmt = (part.proposeQty * part.unitPrice) / 10000; // 万元

    if (decision === 'APPROVE') {
      action = 'APPROVED';
      msg = `【已同意通过】系统已放行采购，采购金额 ${totalAmt.toFixed(1)} 万元。注意后续库龄可能过长。`;
    } else if (decision === 'REJECT') {
      action = 'REJECTED';
      savedMoney = totalAmt;
      msg = `【已驳回申请】系统一键卡点拦截！采购申请被阻断，直接避免不合理资金沉淀 ${(totalAmt / 100).toFixed(2)} 亿元。`;
    } else if (decision === 'INCREASE') {
      action = 'INCREASED';
      const addedQty = 500 - part.proposeQty;
      const addedCost = (addedQty * part.unitPrice) / 10000;
      
      // Update part state locally
      setParts(prev => prev.map(p => {
        if (p.id === partId) {
          return { ...p, proposeQty: 500, isUnderstockWarning: false };
        }
        return p;
      }));
      msg = `【优化采购】成功一键补充采购量至最低开机起订量 500 个(新增采购 ${addedQty.toLocaleString()} 个，追加金额 ${addedCost.toFixed(1)} 万元)，有效规避生产断档、频繁换模与交付延期风险！`;
    } else if (decision === 'REDUCE') {
      action = 'REDUCED';
      // Calculate optimized quantity
      // Daily demand calculation based on models
      let totalDailyConsumption = 0;
      part.applicableModels.forEach(m => {
        const modelObj = vehicles.find(v => v.name === m.modelName);
        if (modelObj) {
          totalDailyConsumption += modelObj.forecastDailySales * m.bomQty * m.shareRatio;
        }
      });
      if (totalDailyConsumption === 0) totalDailyConsumption = 100; // fallback

      // Optimal suggested purchase to cover e.g. 45 days
      const optimalQty = Math.round(totalDailyConsumption * 45 - part.currentStock - part.inTransit);
      let reducedQty = Math.max(100, optimalQty);
      if (reducedQty >= part.proposeQty) {
        reducedQty = Math.round(part.proposeQty * 0.5); // 默认核减 50%
      }
      const reductionAmt = part.proposeQty - reducedQty;
      savedMoney = (reductionAmt * part.unitPrice) / 10000;
 
      // Update part state locally
      setParts(prev => prev.map(p => {
        if (p.id === partId) {
          return { ...p, proposeQty: reducedQty };
        }
        return p;
      }));
 
      msg = `【优化采购】成功核减采购量 ${reductionAmt.toLocaleString()} 个。原计划采购 ${part.proposeQty.toLocaleString()} 个，现缩减至合理库存目标 ${reducedQty.toLocaleString()} 个，释放流动资金 ${savedMoney.toFixed(1)} 万元！`;
    }

    setPartsApprovedStatus(prev => ({
      ...prev,
      [partId]: { action, msg, savedMoney, customReason: reason }
    }));
  };

  const handleResetParts = () => {
    setParts(initialParts);
    setPartsApprovedStatus({});
  };

  // Helper calculation
  const getPartDailyConsumption = (part: PartsRequest) => {
    let total = 0;
    part.applicableModels.forEach(m => {
      const v = vehicles.find(x => x.name === m.modelName);
      if (v) {
        total += v.forecastDailySales * m.bomQty * m.shareRatio;
      }
    });
    return total;
  };

  const getHistoricalSales = (modelName: string): { month: string; sales: number }[] => {
    if (modelName === '多拉3米8') {
      return [
        { month: '1月', sales: 1120 },
        { month: '2月', sales: 950 },
        { month: '3月', sales: 780 },
        { month: '4月', sales: 620 },
        { month: '5月', sales: 450 },
        { month: '6月', sales: 360 },
      ];
    } else if (modelName === '多拉大面') {
      return [
        { month: '1月', sales: 680 },
        { month: '2月', sales: 710 },
        { month: '3月', sales: 745 },
        { month: '4月', sales: 790 },
        { month: '5月', sales: 820 },
        { month: '6月', sales: 840 },
      ];
    } else if (modelName === '多拉小货') {
      return [
        { month: '1月', sales: 2850 },
        { month: '2月', sales: 2980 },
        { month: '3月', sales: 3080 },
        { month: '4月', sales: 3180 },
        { month: '5月', sales: 3250 },
        { month: '6月', sales: 3300 },
      ];
    }
    return [
      { month: '1月', sales: 100 },
      { month: '2月', sales: 110 },
      { month: '3月', sales: 120 },
      { month: '4月', sales: 130 },
      { month: '5月', sales: 140 },
      { month: '6月', sales: 150 },
    ];
  };

  const getPartWarnings = (p: PartsRequest, coverageDays: number) => {
    const list: { type: string; desc: string; color: string; impact: string }[] = [];
    const dailyConsumption = getPartDailyConsumption(p);
    
    // 1. 采购过量预警 (本次采购数量 > 采购上限)
    const maxLimit = Math.max(2000, Math.round(dailyConsumption * 45));
    if (p.proposeQty > maxLimit && !p.isUnderstockWarning) {
      list.push({
        type: '采购过量预警',
        desc: `本次采购数量(${p.proposeQty.toLocaleString()}个) 大于建议上限(${maxLimit.toLocaleString()}个/45天用量)`,
        impact: '可能造成零部件积压、资金占用',
        color: 'bg-amber-50 border-amber-200 text-amber-900'
      });
    }
    
    // 2. 采购不足预警 (本次采购数量 < 采购下限)
    if (p.isUnderstockWarning || (p.currentStock + p.inTransit + p.proposeQty) / (dailyConsumption || 1) < 10) {
      const minLimit = 500;
      if (p.proposeQty < minLimit) {
        list.push({
          type: '采购不足预警',
          desc: `本次采购数量(${p.proposeQty.toLocaleString()}个) 小于供应商开机起订下限(${minLimit.toLocaleString()}个)`,
          impact: '可能造成缺料、生产受阻、频繁换模、交付延期',
          color: 'bg-red-50 border-red-200 text-red-900'
        });
      }
    }
    
    // 3. 呆滞库存预警 (采购后覆盖天数 > 90 天)
    if (coverageDays > 90) {
      list.push({
        type: '呆滞库存预警',
        desc: `采购后库存预测覆盖天数达 ${coverageDays} 天 (已突破90天呆滞红线)`,
        impact: '可能形成长库龄或呆滞物料，极易占用宝贵的营运资金',
        color: 'bg-orange-50 border-orange-200 text-orange-900'
      });
    }

    // 车型销量骤降与采购量错配预警
    if (p.isDemandDropWarning) {
      list.push({
        type: '车型销量骤降与采购严重错配',
        desc: `该物料匹配的车型(多拉3米8)近期日销量已从 120 辆/天大幅骤降至 12 辆/天，但本次采购申请(12,000个)仍惯性按高峰用量申报。`,
        impact: '供需关系严重脱节。现有库存 + 在途已高达 21,000 个，采购后将导致极高仓储占压(预测覆盖天数高达 2,750 天/约7.5年)与 1,020 万元资金长期锁死！',
        color: 'bg-rose-50 border-rose-200 text-rose-950 border-l-4'
      });
    }
    
    // 4. 工程变更风险 (物料即将替代或停用，但仍大量采购)
    if (p.isEngineeringChangePending) {
      list.push({
        type: '工程变更风险',
        desc: '物料即将进行工改切替(即将于30天内停用或升级为新零件)',
        impact: '旧物料无法继续消耗，导致100%产生死料及财务报废损失',
        color: 'bg-rose-50 border-rose-200 text-rose-900'
      });
    }
    
    // 5. 供应商交期风险 (供应商准交率低或交期长)
    if (p.supplierLeadTime >= 40 || (p.supplierOntimeRate && p.supplierOntimeRate < 0.8)) {
      const reasonStr = p.supplierLeadTime >= 40 
        ? `交期长达 ${p.supplierLeadTime} 天` 
        : `供应商历史到货准交率仅为 ${(p.supplierOntimeRate * 100).toFixed(0)}%`;
      list.push({
        type: '供应商交期风险',
        desc: `该物料供应商生产物流交期长或准交率低 (${reasonStr})`,
        impact: '未来到货高度不确定，装车匹配难度大，极易导致停线缺料',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900'
      });
    }
    
    // 6. 采购价格异常 (当前采购价高于历史均价阈值)
    if (p.unitPrice > p.historicalAvgPrice) {
      const diffPercent = (((p.unitPrice - p.historicalAvgPrice) / p.historicalAvgPrice) * 100).toFixed(1);
      list.push({
        type: '采购价格异常',
        desc: `当前采购单价(${p.unitPrice.toLocaleString()}元) 高于历史采购均价(${p.historicalAvgPrice.toLocaleString()}元) 达 ${diffPercent}%`,
        impact: '单车物料BOM成本显著增加，从而直接侵蚀该车型的产品毛利率',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-900'
      });
    }
    
    return list;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Selector Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('vehicle')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'vehicle' 
              ? 'border-emerald-500 text-emerald-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          3.0 整车库存经营场景仿真 (P0)
        </button>
        <button 
          onClick={() => setActiveTab('parts')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'parts' 
              ? 'border-emerald-500 text-emerald-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          4.0 零部件审批拦截插件仿真 (P0)
        </button>
        <button 
          onClick={() => setActiveTab('approval')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'approval' 
              ? 'border-emerald-500 text-emerald-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          5.0 智能采购合理性审批插件 (P0)
        </button>
      </div>

      {/* ----------------- VEHICLE SCENARIO SIMULATION ----------------- */}
      {activeTab === 'vehicle' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">整车库存健康状况看板</h3>
              <p className="text-xs text-slate-500">
                通过实时销量与库存覆盖天数，诊断“库存过高、积压错配、短缺交付风险”
              </p>
            </div>
            <button 
              onClick={handleResetVehicles}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded-lg bg-white"
            >
              <RefreshCw className="w-3 h-3" /> 重置整车沙盘
            </button>
          </div>

          {/* Action Log Message Block */}
          {vehicleMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 animate-slide-up">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">决策中心处理结果：</span>
                {vehicleMessage}
              </div>
            </div>
          )}

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {vehicles.map(v => {
              const totalMoney = v.currentStock * v.price; // 账面占用资金
              const coverageDays = Math.round(v.saleableStock / v.forecastDailySales); // 覆盖天数
              
              // Age distribution percentages
              const totalAge = v.stockAge0_30 + v.stockAge31_60 + v.stockAge61_90 + v.stockAge91_plus;
              const p0_30 = Math.round((v.stockAge0_30 / totalAge) * 100);
              const p31_60 = Math.round((v.stockAge31_60 / totalAge) * 100);
              const p61_90 = Math.round((v.stockAge61_90 / totalAge) * 100);
              const p91_plus = Math.round((v.stockAge91_plus / totalAge) * 100);

              // Alerts logic (Page 5)
              let alertBadge = null;
              let alertBg = '';
              let hasMismatch = false;

              if (v.id === 'v1') {
                // High age, high stock coverage
                alertBadge = <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">🔴 车型积压 & 长库龄</span>;
                alertBg = 'border-rose-200 hover:border-rose-300';
                // Check if region A vs B has mismatch
                if (v.regionStock.regionA.stock > 500 && v.regionStock.regionB.stock < 500) {
                  hasMismatch = true;
                }
              } else if (v.id === 'v2') {
                alertBadge = <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">🟡 热销缺货/交付延期</span>;
                alertBg = 'border-amber-200 hover:border-amber-300';
              } else {
                alertBadge = <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">🟢 正常水位</span>;
                alertBg = 'border-slate-100 hover:border-emerald-300';
              }

              return (
                <div key={v.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 ${alertBg} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800">{v.name}</div>
                        <div className="text-[11px] text-slate-400">{v.config}</div>
                      </div>
                      {alertBadge}
                    </div>

                    {/* Numeric Indicators */}
                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-50">
                      <div>
                        <div className="text-[10px] text-slate-400">当前可用 (在途)</div>
                        <div className="text-base font-mono font-bold text-slate-700">
                          {v.saleableStock} <span className="text-xs font-normal text-slate-400">({v.inTransit}) 辆</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">库存账面占用资金</div>
                        <div className="text-base font-mono font-bold text-slate-700">
                          {(totalMoney / 10000).toFixed(2)} <span className="text-xs font-normal text-slate-400">亿元</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">可售库存覆盖天数</div>
                        <div className={`text-base font-mono font-bold ${
                          coverageDays > 60 ? 'text-rose-600' : coverageDays < 20 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {coverageDays} 天
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">预测日销量</div>
                        <div className="text-base font-mono font-bold text-slate-700">{v.forecastDailySales} 辆/天</div>
                      </div>
                    </div>

                    {/* Stock Age distribution bar chart */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>库龄结构比例 (0d ➔ 90d+)</span>
                        <span className="text-slate-600 font-bold">长库龄: {v.stockAge91_plus}辆</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden flex">
                        <div style={{ width: `${p0_30}%` }} className="bg-emerald-400 h-full" title={`0-30天: ${v.stockAge0_30}辆 (${p0_30}%)`}></div>
                        <div style={{ width: `${p31_60}%` }} className="bg-blue-400 h-full" title={`31-60天: ${v.stockAge31_60}辆 (${p31_60}%)`}></div>
                        <div style={{ width: `${p61_90}%` }} className="bg-amber-400 h-full" title={`61-90天: ${v.stockAge61_90}辆 (${p61_90}%)`}></div>
                        <div style={{ width: `${p91_plus}%` }} className="bg-red-400 h-full" title={`90天以上: ${v.stockAge91_plus}辆 (${p91_plus}%)`}></div>
                      </div>
                    </div>

                    {/* Regional mismatch section if applies */}
                    {v.id === 'v1' && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                        <div className="text-amber-800 font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          监测到：异地区域仓错配风险 (A多B少)
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-500 text-[10px]">
                          <div>
                            华东仓：存 <span className="font-bold text-slate-700">{v.regionStock.regionA.stock}辆</span> / 日销 {v.regionStock.regionA.sales}辆 
                            <span className="text-rose-500 font-bold block">(覆盖 {v.regionStock.regionA.stock/v.regionStock.regionA.sales} 天)</span>
                          </div>
                          <div>
                            华南仓：存 <span className="font-bold text-slate-700">{v.regionStock.regionB.stock}辆</span> / 日销 {v.regionStock.regionB.sales}辆 
                            <span className="text-amber-600 font-bold block">(覆盖 {Math.round(v.regionStock.regionB.stock/v.regionStock.regionB.sales)} 天)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for each vehicle */}
                  <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                    {v.id === 'v1' && (
                      <div className="flex gap-2">
                        {hasMismatch && (
                          <button 
                            onClick={() => handleTransfer(v.id)}
                            className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" /> 物理异地调拨
                          </button>
                        )}
                        <button 
                          onClick={() => handleAdjustReplenish(v.id)}
                          className="flex-1 text-center bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          暂停排产调减
                        </button>
                      </div>
                    )}

                    {v.id === 'v2' && (
                      <button 
                        onClick={() => handleAdjustReplenish(v.id)}
                        className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> 追加紧急排产计划
                      </button>
                    )}

                    {v.id === 'v3' && (
                      <div className="text-[11px] text-slate-400 text-center py-1">
                        ✨ 数据健康，供求线处于合理安全廊道，无需主动干预。
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ----------------- PARTS SCENARIO SIMULATION ----------------- */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">采购审批卡点校验插件仿真</h3>
              <p className="text-xs text-slate-500">
                模拟采购部长/总监/副总裁审批界面。右侧卡片显示打通BOM与销量预测后，系统自动回答的“五个灵魂发问”。
              </p>
            </div>
            <button 
              onClick={handleResetParts}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded-lg bg-white"
            >
              <RefreshCw className="w-3 h-3" /> 重置采购沙盘
            </button>
          </div>

          {/* 6大审批拦截预警规则矩阵 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldCheck className="w-4.5 h-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  审批拦截决策引擎：6大预警类型触发规则矩阵
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  决策系统深度碰撞排产BOM、车辆日销量预测、供应商履约及市场历史均价，对多源数据进行深度碰撞审计，针对异常提报下达智能卡点拦截或核减指令。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 text-slate-800 border-b border-slate-150 font-extrabold text-[11px] tracking-wider">
                    <th className="px-4 py-3 w-1/4">预警类型</th>
                    <th className="px-4 py-3 w-1/3">触发条件</th>
                    <th className="px-4 py-3">业务影响</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold">采购过量预警</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">本次采购数量 &gt; 采购上限 (单车BOM配额 ✖ 45天耗件总量)</td>
                    <td className="px-4 py-3 text-slate-500">可能造成零部件大量积压、企业营运资金白白沉淀占用</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold">采购不足预警</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">本次采购数量 &lt; 采购下限 (低于开机起订MOQ或导致供给 &lt; 10天)</td>
                    <td className="px-4 py-3 text-slate-500">可能造成频繁缺料断档、工厂被迫调机停产、交付被迫延期</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-extrabold">呆滞库存预警</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">采购后覆盖天数 &gt; 90 天 水位线</td>
                    <td className="px-4 py-3 text-slate-500">容易形成长库龄物料或呆滞死料，资产减值风险剧增</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold">工程变更风险</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">物料即将替代或停用 (工改切替中)，但仍盲目大宗采购</td>
                    <td className="px-4 py-3 text-slate-500">旧零件断档无法装车，导致已采购旧零件100%无法消耗、报废死料</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold">供应商交期风险</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">供应商生产/物流交期 &gt; 40天，或历史到货准交率 &lt; 80%</td>
                    <td className="px-4 py-3 text-slate-500">未来到货排期极不稳定，装机配额错配，面临高度缺件断线高危</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-yellow-150 text-yellow-800 font-extrabold" style={{ backgroundColor: '#fef08a' }}>采购价格异常</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">当前采购单价高于历史采购均价阈值</td>
                    <td className="px-4 py-3 text-slate-500">直接增加单车物料BOM核算成本，整车产品毛利率被无情蚕食</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            {parts.map(p => {
              const totalAmt = (p.proposeQty * p.unitPrice) / 10000; // 万元
              const dailyConsumption = getPartDailyConsumption(p);
              const coverageDays = Math.round((p.currentStock + p.inTransit + p.proposeQty) / (dailyConsumption || 1));
              
              // Determine warnings
              const partWarnings = getPartWarnings(p, coverageDays);
              const isHighRisk = partWarnings.length > 0;
              
              let riskBadge = null;
              let bgClass = 'border-slate-100 hover:border-emerald-300';
              
              if (partWarnings.some(w => w.type === '工程变更风险')) {
                riskBadge = <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold">🔴 工改切替高风险</span>;
                bgClass = 'border-rose-200 bg-rose-50/5';
              } else if (partWarnings.some(w => w.type === '采购不足预警')) {
                riskBadge = <span className="px-2 py-0.5 rounded bg-red-150 text-red-700 border border-red-200 text-[10px] font-extrabold" style={{ backgroundColor: '#fee2e2' }}>🚨 采购严重不足</span>;
                bgClass = 'border-red-200 bg-red-50/5';
              } else if (partWarnings.some(w => w.type === '呆滞库存预警' || w.type === '采购过量预警')) {
                riskBadge = <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-extrabold">🟠 库存积压风险</span>;
                bgClass = 'border-amber-200 bg-amber-50/5';
              } else if (isHighRisk) {
                riskBadge = <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold">⚠️ 供方履约或价格异常</span>;
                bgClass = 'border-indigo-200 bg-indigo-50/5';
              } else {
                riskBadge = <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">🟢 正常健康水位</span>;
              }

              const status = partsApprovedStatus[p.id];

              return (
                <div key={p.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-300 ${bgClass} space-y-4`}>
                  
                  {/* Top line */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {p.partCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">{p.partName}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400">供应商：{p.supplier}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {riskBadge}
                      <span className="text-xs font-bold text-slate-400">申请采购金额:</span>
                      <span className="text-sm font-mono font-bold text-slate-800">
                        {totalAmt >= 10000 ? `${(totalAmt / 10000).toFixed(2)} 亿元` : `${totalAmt.toLocaleString()} 万元`}
                      </span>
                    </div>
                  </div>

                  {/* Body grid: Purchase form Left, System Answers Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left side: Approval Form Details */}
                    <div className="lg:col-span-4 space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100">
                        📋 采购申请单信息
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-slate-400">本次申请采购量:</div>
                        <div className="font-mono font-bold text-slate-700 text-right">{p.proposeQty.toLocaleString()} 个</div>
                        
                        <div className="text-slate-400">物料单价:</div>
                        <div className="font-mono font-bold text-slate-700 text-right">{p.unitPrice.toLocaleString()} 元/个</div>
                        
                        <div className="text-slate-400">当前账面库存:</div>
                        <div className="font-mono font-bold text-slate-700 text-right">{p.currentStock.toLocaleString()} 个</div>
                        
                        <div className="text-slate-400">当前在途采购:</div>
                        <div className="font-mono font-bold text-slate-700 text-right">{p.inTransit.toLocaleString()} 个</div>
                        
                        <div className="text-slate-400">供应商生产交期:</div>
                        <div className="font-mono font-bold text-slate-700 text-right">{p.supplierLeadTime} 天</div>
                        
                        {p.supplierOntimeRate !== undefined && (
                          <>
                            <div className="text-slate-400">供方到货准交率:</div>
                            <div className={`font-mono font-bold text-right ${p.supplierOntimeRate < 0.8 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {(p.supplierOntimeRate * 100).toFixed(0)}%
                            </div>
                          </>
                        )}
                        
                        <div className="text-slate-400">物料单价对比历史均价:</div>
                        <div className={`font-mono font-bold text-right ${p.unitPrice > p.historicalAvgPrice ? 'text-red-500' : 'text-emerald-500'}`}>
                          {p.unitPrice > p.historicalAvgPrice ? `偏高 (+${p.unitPrice - p.historicalAvgPrice}元)` : '正常价格'}
                        </div>
                      </div>
                    </div>

                    {/* Right side: The 5 automated system answers (CRITICAL PITCH HIGHLIGHT) */}
                    <div className="lg:col-span-8 bg-slate-900/5 p-4 rounded-xl border border-slate-200/50 space-y-3 text-xs">
                      <div className="text-xs font-bold text-emerald-800 flex items-center justify-between">
                        <span>💡 【库存经营决策系统】自动检验与深度回答：</span>
                        <span className="text-[10px] font-normal text-slate-400">基于销量+排产BOM关联计算</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 block font-semibold">1. 适配车型与配置</span>
                          <span className="font-bold text-slate-700 leading-tight mt-1 text-[11px]">
                            {p.applicableModels.map(m => `${m.modelName}(${m.shareRatio*100}%)`).join(', ')}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 block font-semibold">2. 适配车型未来走势</span>
                          <span className="font-bold text-slate-700 leading-tight mt-1 text-[11px] flex items-center gap-1">
                            {p.id === 'p2' ? '低迷 ↘' : p.id === 'p1' ? '稳步上升 ↗' : '高需求平稳 ➔'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 block font-semibold">3. BOM换算未来消耗率</span>
                          <span className="font-bold text-emerald-600 font-mono mt-1 text-[11px]">
                            {dailyConsumption.toFixed(1)} 个 / 天
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 block font-semibold">4. 采购后供给天数</span>
                          <span className={`font-bold font-mono mt-1 text-[11px] ${coverageDays > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {coverageDays} 天
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 block font-semibold">5. 决策拦截引擎建议</span>
                          <span className={`font-bold leading-tight mt-1 text-[10px] ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isHighRisk ? `拦截或调整 (${partWarnings.length}项预警)` : '建议照常放行'}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic active warnings detail display */}
                      {partWarnings.length > 0 && !status && (
                        <div className="space-y-1.5 bg-white/60 p-3 rounded-lg border border-slate-150">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span>🚨 决策拦截引擎实时预警检测：</span>
                          </div>
                          <div className="space-y-1.5">
                            {partWarnings.map((warn, wIdx) => (
                              <div key={wIdx} className={`p-2 rounded-md border text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 ${warn.color}`}>
                                <div className="flex items-start gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-black border border-current px-1 py-0.1 rounded text-[9px] mr-1.5 uppercase bg-white/40">
                                      {warn.type}
                                    </span>
                                    <span className="font-semibold">{warn.desc}</span>
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold opacity-90 sm:text-right shrink-0">
                                  💼 经营影响：{warn.impact}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display action outcomes if resolved */}
                      {status ? (
                        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                          status.action === 'APPROVED' ? 'bg-slate-50 border-slate-200 text-slate-700' : 
                          status.action === 'INCREASED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          {status.action === 'APPROVED' ? <CheckCircle className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" /> : <UserCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />}
                          <div className="space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>高管审批决策已执行</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-extrabold font-mono">
                                {status.action}
                              </span>
                            </div>
                            <p className="leading-relaxed font-semibold">{status.msg}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold">
                              {p.isEngineeringChangePending 
                                ? '【系统拦截推荐】该物料工改风险极高，不合理采购将100%报废，系统推荐“一键卡点拦截”。'
                                : p.isUnderstockWarning
                                ? '【系统优化推荐】该物料采购量极低无法起订，系统推荐“一键补充至开机量”。'
                                : `【系统核减推荐】该物料已触发积压/价格异常，建议进行“智能核减采购量”以释放沉淀资金。`
                              }
                            </span>
                          </div>
                          
                          {/* Manager decision buttons */}
                          <div className="flex gap-1.5 shrink-0 self-end md:self-auto">
                            {p.isEngineeringChangePending ? (
                              <>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'REJECT')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm"
                                >
                                  ❌ 拦截驳回申请
                                </button>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                                >
                                  任性放行
                                </button>
                              </>
                            ) : p.isUnderstockWarning ? (
                              <>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'INCREASE')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center gap-1"
                                >
                                  <TrendingUp className="w-3 h-3" /> ⚡ 一键补充至起订起步量 (500个)
                                </button>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                                >
                                  照旧放行
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'REDUCE')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm"
                                >
                                  <FileCheck className="w-3 h-3" /> ✂️ 智能核减采购量 (释放流动性)
                                </button>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'REJECT')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-sm"
                                >
                                  一键拦截
                                </button>
                                <button 
                                  onClick={() => handlePartApproval(p.id, 'APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded-lg text-[10px]"
                                >
                                  照常放行
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- APPROVAL PLUGIN SCENARIO SIMULATION ----------------- */}
      {activeTab === 'approval' && (() => {
        const selectedPart = parts.find(p => p.id === selectedApprovalPartId) || parts[0];
        const dailyConsumption = getPartDailyConsumption(selectedPart);
        const coverageDays = Math.round((selectedPart.currentStock + selectedPart.inTransit + selectedPart.proposeQty) / (dailyConsumption || 1));
        const partWarnings = getPartWarnings(selectedPart, coverageDays);
        const status = partsApprovedStatus[selectedPart.id];

        // Historical trend calculations
        const activeModelName = selectedPart.applicableModels[trendModelIdx]?.modelName || selectedPart.applicableModels[0]?.modelName || '多拉3米8';
        const trendData = getHistoricalSales(activeModelName);
        const salesValues = trendData.map(d => d.sales);
        const maxVal = Math.max(...salesValues);
        const minVal = Math.min(...salesValues);
        let yMax = Math.ceil(maxVal * 1.05);
        let yMin = Math.max(0, Math.floor(minVal * 0.95));
        if (yMax === yMin) {
          yMax += 10;
          yMin = Math.max(0, yMin - 10);
        }
        const midVal = Math.round((yMin + yMax) / 2);

        const linePoints = trendData.map((d, i) => {
          const x = 40 + i * (365 / 5);
          const y = 10 + (1 - (d.sales - yMin) / (yMax - yMin)) * 80;
          return { x, y };
        });

        const pathD = "M " + linePoints.map(p => `${p.x} ${p.y}`).join(" L ");
        const areaD = `${pathD} L ${linePoints[linePoints.length - 1].x} 90 L ${linePoints[0].x} 90 Z`;

        // Determine risk details
        let riskLevel: '正常' | '关注' | '风险' | '高风险' = '正常';
        let riskBgClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
        let riskBadgeClass = 'bg-emerald-600 text-white';
        let riskDot = '🟢';
        let riskMeaning = '采购数量处于合理区间，供给安全。';

        if (selectedPart.isEngineeringChangePending || coverageDays > 90 || selectedPart.isUnderstockWarning) {
          riskLevel = '高风险';
          riskBgClass = 'bg-rose-50 border-rose-200 text-rose-800';
          riskBadgeClass = 'bg-rose-600 text-white';
          riskDot = '🔴';
          riskMeaning = '存在极高积压、缺料、工程变更切替停用或价格异常风险！';
        } else if (coverageDays > 60 || selectedPart.unitPrice > selectedPart.historicalAvgPrice * 1.05) {
          riskLevel = '风险';
          riskBgClass = 'bg-orange-50 border-orange-200 text-orange-800';
          riskBadgeClass = 'bg-orange-600 text-white';
          riskDot = '🟠';
          riskMeaning = '明显偏离建议区间，存在不合理资金沉淀风险，建议复核。';
        } else if (coverageDays > 45 || coverageDays < 15) {
          riskLevel = '关注';
          riskBgClass = 'bg-amber-50 border-amber-200 text-amber-800';
          riskBadgeClass = 'bg-amber-600 text-white';
          riskDot = '🟡';
          riskMeaning = '略高或略低于建议区间，需要采购主管人工核实需求合理性。';
        }

        // AISuggestion generator
        const handleAutofillAIReason = () => {
          let suggestionText = '';
          if (selectedPart.id === 'p0') {
            suggestionText = "【一键卡点拦截意见】系统检测到对应整车车型‘多拉3米8’销量已从 120 辆/天大幅骤降至 12 辆/天，日均消耗断崖式下滑，但该转向系统零部件采购申请依然盲目按旧有销量提报 12,000 个（金额 1,020 万元）。加上现存 15,000 个及在途 6,000 个库存，采购后周转覆盖天数将达到惊人的 2,750 天（超过 7.5 年）！为避免不合理资金长期沉淀及因库龄过大产生呆滞风险，建议执行‘一键拦截驳回’，将当期申请驳回并要求计划部门重新根据最新日销量预测进行拉动式测算！";
          } else if (selectedPart.id === 'p1') {
            suggestionText = "【同意放行意见】该800V碳化硅电控主板本次提报采购 12,000 个。计算后未来30天物料需求约 696 个，由于碳化硅芯片属核心战略货期极长物料，现存当前库存及在途较多，提报虽然略高，但符合供应链防断档战略储备需要，同意全额放行，后续需跟进装车匹配率。";
          } else if (selectedPart.id === 'p2') {
            suggestionText = "【智能核减意见】本次麒麟电池包提报数量 8,500 个，金额高达 5.27 亿元。经校验，采购后库存覆盖天数达 270 天，已大幅突破 45 天精细化控制红线，产生极其沉重的资金占用。建议启动智能核减，将本次提报裁撤至合理备料目标（例如 2,000 个），预计可当期释放沉淀营运资金达 4.03 亿元，极力压降呆滞风险！";
          } else if (selectedPart.id === 'p3') {
            suggestionText = "【一键卡点拦截意见】系统检测到该双目摄像头已处于工程变更改代切换状态，将在30天后被新型三目模组100%全切替。本次仍提报盲目采购 9,000 个，将绝对形成 100% 死料积压及财务全额作废损失（约 378 万元）。建议执行‘一键拦截驳回’，要求相关业务方立即停用并核实BOM工程进度！";
          } else if (selectedPart.id === 'p4') {
            suggestionText = "【补充采购意见】该车机终端提报量 150 个，不仅无法满足多拉小货 20 天的安全库存水位，且远低于供应商 500 个最低起订量，面临供方停开机、分摊频次高和换模成本大的经营高危。建议执行‘一键补充采购’至起订量 500 个，保障生产稳定度并控制单件采购溢价。";
          } else if (selectedPart.id === 'p5') {
            suggestionText = "【智能成本核减意见】该电机本次提报 8,000 个，单价 4800 元高于历史采购均价 4500 元达 6.7%，且供方到货准交率仅为 72%。为保护单车BOM毛利空间，建议智能核减采购量，并引入第二候选供应商竞价，同步规避单一供方交期失控高危。";
          } else {
            suggestionText = `【审核意见】采购数量 ${selectedPart.proposeQty.toLocaleString()} 个，预测供给覆盖天数为 ${coverageDays} 天。当前状态为 ${riskLevel}，已完成库存与合理性全量比对，审核意见：请按需控制库存，防止产生呆滞积压。`;
          }
          setCustomReason(suggestionText);
        };

        const executeApproval = (decisionType: 'APPROVE' | 'REJECT' | 'REDUCE' | 'INCREASE') => {
          handlePartApproval(selectedPart.id, decisionType, customReason || '经审核，该批次物料采购数据与生产需求预测匹配，已做出对应审批决策。');
          setCustomReason('');
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 p-4.5 rounded-xl border border-slate-150">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" />
                  5.0 采购合理性审批校验插件
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  融合 <span className="font-semibold text-slate-700">1.采购信息、2.适用范围、3.需求预测、4.库存情况、5.阈值建议、6.风险判断、7.处理建议</span> 七大核心校验维度，打通销售前瞻与仓储周转数据，辅助高管进行精准卡点拦截，压降呆滞资金。
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleResetParts}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-lg bg-white shadow-sm transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 重置审批数据
                </button>
              </div>
            </div>

            {/* Main grid: Left Sidebar of parts, Right Card of rationality check */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left sidebar: Pending procurement requests */}
              <div className="lg:col-span-3 space-y-3">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">物料申购单列表</div>
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {parts.map(p => {
                    const isSelected = p.id === selectedApprovalPartId;
                    const pDaily = getPartDailyConsumption(p);
                    const pCoverage = Math.round((p.currentStock + p.inTransit + p.proposeQty) / (pDaily || 1));
                    const pStatus = partsApprovedStatus[p.id];
                    
                    let pRiskClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    let pRiskLabel = '正常';
                    if (p.isEngineeringChangePending || pCoverage > 90 || p.isUnderstockWarning) {
                      pRiskClass = 'bg-rose-50 text-rose-700 border-rose-100';
                      pRiskLabel = '高风险';
                    } else if (pCoverage > 60 || p.unitPrice > p.historicalAvgPrice * 1.05) {
                      pRiskClass = 'bg-orange-50 text-orange-700 border-orange-100';
                      pRiskLabel = '风险';
                    } else if (pCoverage > 45 || pCoverage < 15) {
                      pRiskClass = 'bg-amber-50 text-amber-700 border-amber-100';
                      pRiskLabel = '关注';
                    }

                    return (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSelectedApprovalPartId(p.id);
                          setCustomReason('');
                          setTrendModelIdx(0);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10' 
                            : 'border-slate-100 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.partCode}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${pRiskClass}`}>
                            {pRiskLabel}
                          </span>
                        </div>
                        <div className="font-semibold text-xs text-slate-800 line-clamp-1 mt-1">{p.partName}</div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 text-[11px]">
                          <span className="text-slate-400">
                            申请量: <span className="font-bold text-slate-700">{p.proposeQty.toLocaleString()}</span> 个
                          </span>
                          {pStatus ? (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                              pStatus.action === 'APPROVED' ? 'bg-slate-100 text-slate-600' :
                              pStatus.action === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              pStatus.action === 'REDUCED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {pStatus.action === 'APPROVED' ? '已放行' :
                               pStatus.action === 'REJECTED' ? '已拦截' :
                               pStatus.action === 'REDUCED' ? '已核减' : '已补采'}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-black text-[9px] flex items-center gap-0.5 animate-pulse">
                              🕒 待处理
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right main card: Inventory and Purchase Rationality Verification Card */}
              <div className="lg:col-span-9">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                  
                  {/* Approval Watermark/Stamp overlay if resolved */}
                  {status && (
                    <div className="absolute top-14 right-14 z-20 pointer-events-none transform rotate-12 animate-fade-in opacity-85">
                      <div className={`border-4 rounded-xl px-4 py-2 font-black uppercase text-center tracking-widest text-sm ${
                        status.action === 'APPROVED' ? 'border-slate-400 text-slate-500' :
                        status.action === 'REJECTED' ? 'border-red-400 text-red-500' :
                        status.action === 'REDUCED' ? 'border-emerald-500 text-emerald-600' : 'border-blue-500 text-blue-600'
                      }`} style={{ fontFamily: 'monospace' }}>
                        <div>{status.action === 'APPROVED' ? '★ APPROVED PASS ★' :
                              status.action === 'REJECTED' ? '★ INTERCEPTED REJECT ★' :
                              status.action === 'REDUCED' ? '★ OPTIMIZED REDUCED ★' : '★ OPTIMIZED ADDED ★'}</div>
                        <div className="text-[10px] mt-1 text-slate-400 font-bold">BY SCENARIO SIMULATOR</div>
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="p-4.5 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                          库存与采购合理性校验卡片
                          <span className="text-[10px] font-mono text-slate-400 font-bold bg-white px-1.5 py-0.2 rounded border border-slate-150">PR-PLUG-IN</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          正在校验物料: <span className="font-bold text-slate-700">{selectedPart.partName}</span> ({selectedPart.partCode})
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold">综合风险等级:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${riskBgClass}`}>
                        {riskDot} {riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: The 7 Modules Bento Layout */}
                  <div className="p-5 space-y-6">

                    {/* Module Row 1: Module 1 (采购信息) & Module 2 (适用范围) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Module 1: 采购信息 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Info className="w-4 h-4 text-slate-500" />
                          <span>一、 采购基本信息 (基础校验)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] leading-tight">
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">物料编码:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedPart.partCode}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">物料名称:</span>
                            <span className="font-semibold text-slate-800 line-clamp-1">{selectedPart.partName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">本次采购数量:</span>
                            <span className="font-mono font-extrabold text-slate-800">{selectedPart.proposeQty.toLocaleString()} 个</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">预估采购单价:</span>
                            <span className="font-mono font-extrabold text-slate-800">{selectedPart.unitPrice.toLocaleString()} 元</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">预估采购金额:</span>
                            <span className="font-mono font-extrabold text-emerald-600">
                              {((selectedPart.proposeQty * selectedPart.unitPrice) / 10000).toFixed(1)} 万元
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5 font-bold">推荐供应商:</span>
                            <span className="font-semibold text-slate-700 truncate block">{selectedPart.supplier}</span>
                          </div>
                        </div>
                      </div>

                      {/* Module 2: 适用范围 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Layers className="w-4 h-4 text-slate-500" />
                          <span>二、 适用车型范围 (需求来源追溯)</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] leading-normal">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-100 font-bold">
                                <th className="pb-1">适用车型</th>
                                <th className="pb-1 text-right">BOM单车用量</th>
                                <th className="pb-1 text-right">装配占比</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedPart.applicableModels.map((m, idx) => (
                                <tr key={idx} className="text-slate-700 font-semibold">
                                  <td className="py-1.5">{m.modelName}</td>
                                  <td className="py-1.5 text-right font-mono">{m.bomQty} 个/辆</td>
                                  <td className="py-1.5 text-right font-mono">{(m.shareRatio * 100).toFixed(0)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-normal bg-white p-1.5 rounded border border-slate-100 font-medium">
                          💡 需求分析：该物料用量与适用车型产量紧密钩挂，可据此判断未来真实需求。
                        </div>
                      </div>

                    </div>

                    {/* Module Row 2: Module 3 (需求预测) & Module 4 (库存情况) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Module 3: 需求预测 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>三、 30/60天车型销量与物料需求预测</span>
                        </div>
                        <div className="space-y-3">
                          <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <div className="text-slate-400 text-[10px] font-bold">未来 30 天消耗前瞻</div>
                              <div className="font-semibold text-slate-700 mt-0.5">
                                预测车型总销量: <span className="font-bold text-slate-800">
                                  {selectedPart.applicableModels.reduce((sum, am) => {
                                    const v = vehicles.find(x => x.name === am.modelName);
                                    return sum + (v ? v.forecastDailySales * 30 * am.shareRatio : 0);
                                  }, 0).toFixed(0)} 辆
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400 text-[10px] font-bold">预测物料总需求</div>
                              <span className="font-mono font-black text-slate-800 text-xs">
                                {Math.round(dailyConsumption * 30).toLocaleString()} 个
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <div className="text-slate-400 text-[10px] font-bold">未来 60 天消耗前瞻</div>
                              <div className="font-semibold text-slate-700 mt-0.5">
                                预测车型总销量: <span className="font-bold text-slate-800">
                                  {selectedPart.applicableModels.reduce((sum, am) => {
                                    const v = vehicles.find(x => x.name === am.modelName);
                                    return sum + (v ? v.forecastDailySales * 60 * am.shareRatio : 0);
                                  }, 0).toFixed(0)} 辆
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400 text-[10px] font-bold">预测物料总需求</div>
                              <span className="font-mono font-black text-slate-800 text-xs">
                                {Math.round(dailyConsumption * 60).toLocaleString()} 个
                              </span>
                            </div>
                          </div>

                          {/* 6-Month Historical Sales Trend */}
                          <div className="mt-3.5 pt-3 border-t border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                <span>过去6个月销量走势 ({activeModelName})</span>
                              </div>
                              
                              {/* Model Selector Pills if there are multiple models */}
                              {selectedPart.applicableModels.length > 1 && (
                                <div className="flex gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                                  {selectedPart.applicableModels.map((m, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setTrendModelIdx(idx)}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                                        trendModelIdx === idx 
                                          ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                                          : 'text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      {m.modelName}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* SVG Chart Container */}
                            <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-inner">
                              <svg viewBox="0 0 420 110" className="w-full h-auto overflow-visible">
                                <defs>
                                  <linearGradient id={`chartGrad-${selectedPart.id}-${trendModelIdx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                
                                {/* Grid Lines */}
                                <line x1="40" y1="10" x2="405" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="40" y1="50" x2="405" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                                <line x1="40" y1="90" x2="405" y2="90" stroke="#e2e8f0" strokeWidth="1" />
                                
                                {/* Left Axis Labels */}
                                <text x="32" y="14" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{yMax}</text>
                                <text x="32" y="54" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{midVal}</text>
                                <text x="32" y="94" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{yMin}</text>
                                
                                {/* Area Path */}
                                <path d={areaD} fill={`url(#chartGrad-${selectedPart.id}-${trendModelIdx})`} />
                                
                                {/* Line Path */}
                                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                
                                {/* Dots and Labels */}
                                {linePoints.map((pt, idx) => {
                                  return (
                                    <g key={idx}>
                                      {/* Value Label above dot */}
                                      <text 
                                        x={pt.x} 
                                        y={pt.y - 6} 
                                        textAnchor="middle" 
                                        className="fill-slate-700 font-mono text-[9px] font-black"
                                      >
                                        {salesValues[idx].toLocaleString()}
                                      </text>
                                      
                                      {/* Inner Dot */}
                                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                                      
                                      {/* Month label below */}
                                      <text x={pt.x} y="105" textAnchor="middle" className="fill-slate-400 font-sans text-[9px] font-bold">
                                        {trendData[idx].month}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>

                            {/* Tiny growth insights box */}
                            <div className="mt-2 text-[9px] text-slate-500 font-medium flex items-center gap-1 justify-between bg-white p-1.5 rounded border border-slate-100">
                              <span className="flex items-center gap-1">
                                {salesValues[5] >= salesValues[0] ? '📈' : '📉'}{' '}
                                <span className="font-bold text-slate-700">{activeModelName}</span> 历史销量从{' '}
                                <span className="font-bold font-mono">{salesValues[0]}</span> 辆
                                {salesValues[5] >= salesValues[0] ? '升至' : '降至'}{' '}
                                <span className="font-bold font-mono">{salesValues[5]}</span> 辆
                              </span>
                              <span className={`font-bold ${salesValues[5] >= salesValues[0] ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {salesValues[5] >= salesValues[0] ? '+' : ''}
                                {((salesValues[5] - salesValues[0]) / salesValues[0] * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Module 4: 库存情况 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Warehouse className="w-4 h-4 text-slate-500" />
                          <span>四、 当前在库、可用库存及库龄结构</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-[10px] text-center leading-tight">
                          <div className="bg-white p-1.5 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5 font-bold">当前库存:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedPart.currentStock.toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5 font-bold">在途采购:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedPart.inTransit.toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5 font-bold">锁定库存:</span>
                            <span className="font-mono font-bold text-slate-800">{Math.round(selectedPart.currentStock * 0.12).toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5 font-bold">可用库存:</span>
                            <span className="font-mono font-bold text-emerald-600">{(selectedPart.currentStock - Math.round(selectedPart.currentStock * 0.12) + selectedPart.inTransit).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* 库龄结构可视化堆叠条 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-slate-400 font-black">
                            <span>库龄分布明细</span>
                            <span>总在库: {selectedPart.currentStock.toLocaleString()} 个</span>
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100">
                            <div className="bg-emerald-500 h-full hover:opacity-85 transition-opacity" style={{ width: '55%' }} title="0-30天: 55%" />
                            <div className="bg-amber-400 h-full hover:opacity-85 transition-opacity" style={{ width: '25%' }} title="31-60天: 25%" />
                            <div className="bg-orange-500 h-full hover:opacity-85 transition-opacity" style={{ width: '15%' }} title="61-90天: 15%" />
                            <div className="bg-rose-500 h-full hover:opacity-85 transition-opacity" style={{ width: '5%' }} title="90天+: 5%" />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />0-30天 (55%)</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />31-60天 (25%)</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />61-90天 (15%)</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />90天+ (5%)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Module Row 3: Module 5 (阈值建议) & Module 6 (风险判断) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Module 5: 阈值建议 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Sliders className="w-4 h-4 text-slate-500" />
                          <span>五、 建议采购量与阈值边界控制</span>
                        </div>
                        <div className="space-y-2 text-[11px] font-semibold">
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400">系统建议采购量:</span>
                            <span className="font-mono text-slate-700 font-bold">
                              {Math.max(0, Math.round(dailyConsumption * 45 - selectedPart.currentStock - selectedPart.inTransit)).toLocaleString()} 个
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400">采购上限 (60天安全红线):</span>
                            <span className="font-mono text-rose-600 font-bold">
                              {Math.max(1000, Math.round(dailyConsumption * 60)).toLocaleString()} 个
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400">采购下限 (15天警戒线/MOQ):</span>
                            <span className="font-mono text-amber-600 font-bold">
                              {Math.max(500, Math.round(dailyConsumption * 15)).toLocaleString()} 个
                            </span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          * 采购上限和采购下限是判断本次采购申请数量是否偏离健康水平的刚性红线。
                        </p>
                      </div>

                      {/* Module 6: 风险判断 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 border-b border-slate-100 pb-1.5 uppercase">
                          <Activity className="w-4 h-4 text-slate-500" />
                          <span>六、 综合风险等级判定与覆盖天数</span>
                        </div>
                        
                        <div className="space-y-2 text-[11px]">
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                            <span className="text-slate-400 font-semibold font-bold">采购后库存覆盖天数:</span>
                            <span className={`font-mono font-black ${coverageDays > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {coverageDays} 天
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                            <span className="text-slate-400 font-semibold font-bold">风险评级判定:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${riskBgClass}`}>
                              {riskDot} {riskLevel}
                            </span>
                          </div>
                        </div>

                        {/* Warnings details inside card */}
                        {partWarnings.length > 0 ? (
                          <div className="bg-red-50/50 p-2 border border-red-100 rounded-lg text-[10px] space-y-1">
                            <div className="font-black text-rose-800 flex items-center gap-1 mb-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>稽核拦截细节:</span>
                            </div>
                            {partWarnings.map((w, wIdx) => (
                              <div key={wIdx} className="font-semibold text-rose-700 leading-tight">
                                🚨 [{w.type}] {w.desc}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-emerald-50/50 p-2.5 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>系统判定数量在合理区间内，供给平稳，无呆滞与缺料高危。</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Module 7: 处理建议 (高管审批与智能决策) */}
                    <div className="p-4.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                      <div className="flex items-center justify-between text-xs font-black text-slate-800 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-1.5 uppercase">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span>七、 处理决策执行与高管审批签注</span>
                        </div>
                      </div>

                      {status ? (
                        <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 shadow-inner ${
                          status.action === 'APPROVED' ? 'bg-slate-100 border-slate-300 text-slate-800' : 
                          status.action === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                          status.action === 'REDUCED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}>
                          {status.action === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" /> : 
                           status.action === 'REJECTED' ? <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" /> : 
                           <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                          <div className="space-y-1.5 flex-1">
                            <div className="font-black flex items-center gap-2">
                              <span>已执行审批决策意见并记录审计底单：</span>
                              <span className="px-2 py-0.2 rounded text-[10px] bg-white/60 border border-current font-extrabold uppercase font-mono">
                                {status.action}
                              </span>
                            </div>
                            <p className="leading-relaxed font-bold text-slate-700">{status.msg}</p>
                            {status.customReason && (
                              <div className="bg-white/50 p-2.5 rounded border border-slate-200/50 mt-2 text-[11px] font-semibold text-slate-600 leading-normal">
                                <span className="font-bold block text-[10px] text-slate-400 mb-0.5">高管审批批注:</span>
                                "{status.customReason}"
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-500 font-bold block">
                              高管决策批注说明:
                            </label>
                            <textarea
                              rows={3}
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                              placeholder="请在此输入审核批复意见与管理指令..."
                              className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium leading-normal placeholder-slate-400"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end">
                            {selectedPart.isEngineeringChangePending ? (
                              <>
                                <button 
                                  onClick={() => executeApproval('REJECT')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm flex items-center gap-1"
                                >
                                  ❌ 拦截驳回采购申请 (免去呆死旧料报废)
                                </button>
                                <button 
                                  onClick={() => executeApproval('APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
                                >
                                  同意放行
                                </button>
                              </>
                            ) : selectedPart.isUnderstockWarning ? (
                              <>
                                <button 
                                  onClick={() => executeApproval('INCREASE')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm flex items-center gap-1"
                                >
                                  <TrendingUp className="w-4 h-4" /> ⚡ 补充采购量至 500 个 (最低MOQ)
                                </button>
                                <button 
                                  onClick={() => executeApproval('APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
                                >
                                  直接放行
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => executeApproval('REJECT')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm"
                                >
                                  一键拦截驳回
                                </button>
                                <button 
                                  onClick={() => executeApproval('APPROVE')}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
                                >
                                  照常批准放行
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
