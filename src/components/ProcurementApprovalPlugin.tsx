/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { initialVehicles, initialParts } from '../data';
import { VehicleStock, PartsRequest } from '../types';
import { 
  RefreshCw, 
  ShieldCheck, 
  FileCheck, 
  UserCheck, 
  Info, 
  Layers, 
  Calendar, 
  Warehouse, 
  Sliders, 
  Activity, 
  CheckCircle, 
  XCircle,
  ShieldAlert, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ProcurementApprovalPlugin() {
  const [vehicles] = useState<VehicleStock[]>(initialVehicles);
  const [parts, setParts] = useState<PartsRequest[]>(initialParts);
  const [partsApprovedStatus, setPartsApprovedStatus] = useState<Record<string, { action: string; msg: string; savedMoney: number; customReason?: string }>>({});
  const [selectedApprovalPartId, setSelectedApprovalPartId] = useState<string>('p0');
  const [customReason, setCustomReason] = useState<string>('');
  const [trendModelIdx, setTrendModelIdx] = useState<number>(0);

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
    
    // 4. 工程变更风险
    if (p.isEngineeringChangePending) {
      list.push({
        type: '工程变更风险',
        desc: '物料即将进行工改切替(即将于30天内停用或升级为新零件)',
        impact: '旧物料无法继续消耗，导致100%产生死料及财务报废损失',
        color: 'bg-rose-50 border-rose-200 text-rose-900'
      });
    }
    
    // 5. 供应商交期风险
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
    
    // 6. 采购价格异常
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

  const handlePartApproval = (partId: string, decision: 'APPROVE' | 'REJECT' | 'REDUCE' | 'INCREASE', reason?: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    let savedMoney = 0;
    let action = '';
    let msg = '';
    const totalAmt = (part.proposeQty * part.unitPrice) / 10000;

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
      setParts(prev => prev.map(p => p.id === partId ? { ...p, proposeQty: 500, isUnderstockWarning: false } : p));
      msg = `【补充采购】成功一键补充采购量至最低开机起订量 500 个(新增采购 ${addedQty.toLocaleString()} 个，追加金额 ${addedCost.toFixed(1)} 万元)，有效规避生产断档与交付延期风险！`;
    } else if (decision === 'REDUCE') {
      action = 'REDUCED';
      let totalDailyConsumption = 0;
      part.applicableModels.forEach(m => {
        const modelObj = vehicles.find(v => v.name === m.modelName);
        if (modelObj) {
          totalDailyConsumption += modelObj.forecastDailySales * m.bomQty * m.shareRatio;
        }
      });
      if (totalDailyConsumption === 0) totalDailyConsumption = 100;

      const optimalQty = Math.round(totalDailyConsumption * 45 - part.currentStock - part.inTransit);
      let reducedQty = Math.max(100, optimalQty);
      if (reducedQty >= part.proposeQty) {
        reducedQty = Math.round(part.proposeQty * 0.5);
      }
      const reductionAmt = part.proposeQty - reducedQty;
      savedMoney = (reductionAmt * part.unitPrice) / 10000;

      setParts(prev => prev.map(p => p.id === partId ? { ...p, proposeQty: reducedQty } : p));
      msg = `【核减采购】成功核减采购量 ${reductionAmt.toLocaleString()} 个。原计划采购 ${part.proposeQty.toLocaleString()} 个，现缩减至合理库存目标 ${reducedQty.toLocaleString()} 个，释放流动资金 ${savedMoney.toFixed(1)} 万元！`;
    }

    setPartsApprovedStatus(prev => ({
      ...prev,
      [partId]: { action, msg, savedMoney, customReason: reason }
    }));
  };

  const handleResetParts = () => {
    setParts(initialParts);
    setPartsApprovedStatus({});
    setCustomReason('');
  };

  const selectedPart = parts.find(p => p.id === selectedApprovalPartId) || parts[0];
  const dailyConsumption = getPartDailyConsumption(selectedPart);
  const coverageDays = Math.round((selectedPart.currentStock + selectedPart.inTransit + selectedPart.proposeQty) / (dailyConsumption || 1));
  const partWarnings = getPartWarnings(selectedPart, coverageDays);
  const status = partsApprovedStatus[selectedPart.id];

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

  let riskLevel: '正常' | '关注' | '风险' | '高风险' = '正常';
  let riskBgClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
  let riskDot = '🟢';

  if (selectedPart.isEngineeringChangePending || coverageDays > 90 || selectedPart.isUnderstockWarning) {
    riskLevel = '高风险';
    riskBgClass = 'bg-rose-50 border-rose-200 text-rose-800';
    riskDot = '🔴';
  } else if (coverageDays > 60 || selectedPart.unitPrice > selectedPart.historicalAvgPrice * 1.05) {
    riskLevel = '风险';
    riskBgClass = 'bg-orange-50 border-orange-200 text-orange-800';
    riskDot = '🟠';
  } else if (coverageDays > 45 || coverageDays < 15) {
    riskLevel = '关注';
    riskBgClass = 'bg-amber-50 border-amber-200 text-amber-800';
    riskDot = '🟡';
  }

  const executeApproval = (decisionType: 'APPROVE' | 'REJECT' | 'REDUCE' | 'INCREASE') => {
    handlePartApproval(selectedPart.id, decisionType, customReason || '经审核，已做出对应审批决策。');
    setCustomReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 p-4.5 rounded-xl border border-slate-150">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" />
            智能采购合理性审批插件
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
            
            {/* Stamp overlay if resolved */}
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
                            <linearGradient id={`pluginGrad-${selectedPart.id}-${trendModelIdx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          
                          <line x1="40" y1="10" x2="405" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="40" y1="50" x2="405" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="40" y1="90" x2="405" y2="90" stroke="#e2e8f0" strokeWidth="1" />
                          
                          <text x="32" y="14" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{yMax}</text>
                          <text x="32" y="54" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{midVal}</text>
                          <text x="32" y="94" textAnchor="end" className="fill-slate-400 font-mono text-[8px] font-semibold">{yMin}</text>
                          
                          <path d={areaD} fill={`url(#pluginGrad-${selectedPart.id}-${trendModelIdx})`} />
                          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {linePoints.map((pt, idx) => (
                            <g key={idx}>
                              <text x={pt.x} y={pt.y - 6} textAnchor="middle" className="fill-slate-700 font-mono text-[9px] font-black">
                                {salesValues[idx].toLocaleString()}
                              </text>
                              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                              <text x={pt.x} y="105" textAnchor="middle" className="fill-slate-400 font-sans text-[9px] font-bold">
                                {trendData[idx].month}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

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
                      <span className="text-slate-400 font-bold">采购后库存覆盖天数:</span>
                      <span className={`font-mono font-black ${coverageDays > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {coverageDays} 天
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold">风险评级判定:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${riskBgClass}`}>
                        {riskDot} {riskLevel}
                      </span>
                    </div>
                  </div>

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

              {/* Module 7: 处理建议 (高管审批与决策执行 - AI一键生成及智能优化按钮已根据需求移除) */}
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
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            ❌ 拦截驳回采购申请 (免去呆死旧料报废)
                          </button>
                          <button 
                            onClick={() => executeApproval('APPROVE')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            同意放行
                          </button>
                        </>
                      ) : selectedPart.isUnderstockWarning ? (
                        <>
                          <button 
                            onClick={() => executeApproval('INCREASE')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <TrendingUp className="w-4 h-4" /> ⚡ 补充采购量至 500 个 (最低MOQ)
                          </button>
                          <button 
                            onClick={() => executeApproval('APPROVE')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            直接放行
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => executeApproval('REJECT')}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm cursor-pointer"
                          >
                            一键拦截驳回
                          </button>
                          <button 
                            onClick={() => executeApproval('APPROVE')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
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
}
