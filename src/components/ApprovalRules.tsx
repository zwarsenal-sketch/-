/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sliders, 
  Activity, 
  ClipboardList,
  FileCheck2,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
  Car,
  Sparkles,
  Lightbulb,
  SlidersHorizontal
} from 'lucide-react';

const vehicleHistoryData = {
  v1: {
    name: '多拉3米8',
    config: '高承载重载纯电微卡 (3.8米货厢/抗胀防胀强化设计)',
    sales: [320, 280, 450, 420, 390, 360], // Jan to Jun 2026
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    total: 2220,
    avg: 370,
    yoyTrend: '-22% (下行通道)',
    color: 'indigo',
    stockStatus: '库存偏高，存在区域错配风险（东区富余/西区不足）',
    scenarios: {
      neutral: {
        forecast: [340, 330, 320],
        percentage: '-10%',
        coverage: '45-50天',
        production: '中度减产，削减高库存区域的排产计划，防止在库进一步呆滞。',
        parts: '启动采购卡点，核减20%零部件采购量；针对旧件（如双目ADAS摄像头）全面卡住，防止工程变更导致死料。',
        channel: '强制跨区调拨，将东区富余的“多拉3米8”调拨调往需求尚可的西区。',
        sliderTrend: -10
      },
      optimistic: {
        forecast: [380, 400, 420],
        percentage: '+15%',
        coverage: '55-60天',
        production: '小幅恢复排产，但在途订单不急于追加，优先消耗在库中长库龄整车（31-90天）。',
        parts: '维持现有采购计划，不急于大批量增发，优先以消纳现有在库零部件（1.5万件转向系统等）为主。',
        channel: '配合大客户批量采购方案，开展针对同城货运企业的定向促销。',
        sliderTrend: 15
      },
      pessimistic: {
        forecast: [300, 270, 240],
        percentage: '-33%',
        coverage: '25-30天 (极限控库)',
        production: '深度降负排产！工厂实行单班运行，将产能让渡给热销的“多拉大面”。',
        parts: '【全面拦截】建议对所有专用物料的申购单触发拦截。建议采购量砍为0，零部件库存覆盖降至安全线以下。',
        channel: '降价去库存！提供专项金融免息方案，重点消化91天以上的长库龄整车。',
        sliderTrend: -33
      }
    }
  },
  v2: {
    name: '多拉大面',
    config: '定制化大空间纯电大面 (6.4m³承载立方/货运司机专属定制跑单好车)',
    sales: [620, 510, 780, 840, 910, 990],
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    total: 4650,
    avg: 775,
    yoyTrend: '+59.6% (强劲爆款)',
    color: 'emerald',
    stockStatus: '库存极低！可用库存覆盖天数仅14.6天，面临全国性缺货断供。',
    scenarios: {
      neutral: {
        forecast: [1050, 1100, 1150],
        percentage: '+15%',
        coverage: '35-40天',
        production: '全面满负荷拉满排产！将产线转给“多拉大面”，优先保证华东与大湾区大订车型的出厂。',
        parts: '加大主料采购力度，将电驱动总成和动力电池包的库存覆盖天数提高到35天以上。',
        channel: '加速在途车辆交付，启动“直发物流”通道，下线车辆不入中转仓，直接板车配发终端门店。',
        sliderTrend: 15
      },
      optimistic: {
        forecast: [1200, 1350, 1500],
        percentage: '+45%',
        coverage: '50-60天 (战略备货)',
        production: '极速扩产！启动备用产线并实施三班倒。与供应商（CATL、比亚迪半导体）签订长期包产能协议。',
        parts: '大幅追加关键高交期物料。100%装配的碳化硅电控主板追加1.5万件，宁德电池包提报追加1万件。',
        channel: '优先倾斜保障大订、长租订单大客户，提升零售门店“一车难求”的看车体验，引导客户预交订金锁期。',
        sliderTrend: 45
      },
      pessimistic: {
        forecast: [900, 850, 800],
        percentage: '-19%',
        coverage: '25-30天',
        production: '适度放缓扩张步伐，维持双班排产，避免因行业价格战导致需求突然失速。',
        parts: '零部件采购量保持在系统科学建议的 [80%-120%] 合理偏离带内，不得过量下单，并注意防范5G车机45天长交期风险。',
        channel: '加强对一线销售订单的线索复核，清退假订单和超期不锁单的空占车辆。',
        sliderTrend: -19
      }
    }
  },
  v3: {
    name: '多拉小货',
    config: '灵活重载同城配送纯电小微卡 (能跑又能拉/小体积大容量)',
    sales: [2800, 2400, 3100, 3250, 3310, 3300],
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    total: 18160,
    avg: 3027,
    yoyTrend: '+17.8% (大盘基石)',
    color: 'sky',
    stockStatus: '整体库存极健康（覆盖27.7天），产销高度对齐。',
    scenarios: {
      neutral: {
        forecast: [3350, 3400, 3420],
        percentage: '+3.5%',
        coverage: '25-30天 (精益状态)',
        production: '稳定排产，根据每周到店订单数据做微调，保持日均110辆左右的产出速度。',
        parts: '保持精益采购。在库天数控制在供应商交期天数 + 安全天数（如车机：45天交期 + 20天安全 = 65天）附近。',
        channel: '精细化大区库存调配，大湾区与东区库存按55/45比例动态分配。',
        sliderTrend: 3
      },
      optimistic: {
        forecast: [3600, 3800, 4000],
        percentage: '+20%',
        coverage: '35-40天',
        production: '适度上调排产系数10%，发挥规模效应，降低单车制造分摊成本。',
        parts: '由于销量上扬，零部件可用天数如果少于交期，会发生短缺。应立即将5G车机提报量增加，并盯紧方正电机35天交期的准时率。',
        channel: '推进全国县域乡镇市场的“新能源下乡”渠道扩张，用小微卡的低成本优势快速抢占市场。',
        sliderTrend: 20
      },
      pessimistic: {
        forecast: [3100, 2900, 2700],
        percentage: '-18%',
        coverage: '20-25天',
        production: '下调日排产至90辆/天，清空各中转站库，严控华北及华中各区成品车保有量。',
        parts: '对常规零部件，开启15%采购扣减，通知关键零部件厂商（方正电机等）适度降低到货频次，压降在途天数。',
        channel: '在重点省份推出购车送充电桩或三年免费保养的促销售后方案，对冲下行风险。',
        sliderTrend: -18
      }
    }
  }
};

export default function ApprovalRules() {
  // --- Sandbox Simulation Sliders State ---
  const [salesTrend, setSalesTrend] = useState<number>(-22); // 销量趋势 -22%
  
  // --- Section 5 State (Vehicle History and Forecast Suggestions) ---
  const [selectedVehicle, setSelectedVehicle] = useState<'v1' | 'v2' | 'v3'>('v1');
  const [trendScenario, setTrendScenario] = useState<'neutral' | 'optimistic' | 'pessimistic'>('neutral');
  const [currentStockDays, setCurrentStockDays] = useState<number>(75); // 当前库存覆盖天数 75天
  const [inTransitDays, setInTransitDays] = useState<number>(20); // 在途库存覆盖天数 20天
  const [proposeQty, setProposeQty] = useState<number>(1200); // 本次申请采购数量 1200件
  const [isEngineeringChange, setIsEngineeringChange] = useState<boolean>(false); // 是否即将发生工程变更
  const [isBacklogRising, setIsBacklogRising] = useState<boolean>(false); // 未交付订单是否呈上升走势
  const [avgDailyDemand, setAvgDailyDemand] = useState<number>(10); // 日均预测消耗 (D = 10件)
  const [leadTimeDays, setLeadTimeDays] = useState<number>(30); // 供应商交期 30天
  const [safetyDays, setSafetyDays] = useState<number>(15); // 安全库存天数 15天

  // --- Dynamic Calculations based on PDF ---
  // D = avgDailyDemand (10)
  // 当前可用库存 (I_c) = currentStockDays * D
  const currentStock = currentStockDays * avgDailyDemand;
  // 在途采购 (I_t) = inTransitDays * D
  const inTransit = inTransitDays * avgDailyDemand;
  // 供应商交期需求 = D * leadTimeDays
  const demandInLeadTime = leadTimeDays * avgDailyDemand;
  // 安全库存量 = D * safetyDays
  const safetyStockQty = safetyDays * avgDailyDemand;

  // 建议采购量 = 预测交期需求 + 安全库存 - 当前可用库存 - 在途采购数量
  const suggestedQty = Math.max(0, demandInLeadTime + safetyStockQty - currentStock - inTransit);
  
  // 采购下限 = 建议采购量 * 0.8
  const lowerBound = Math.round(suggestedQty * 0.8);
  // 采购上限 = 建议采购量 * 1.2
  const upperBound = Math.round(suggestedQty * 1.2);

  // 本次采购后总可用供给 (S_t) = 当前可用库存 + 在途采购 + 本次采购数量
  const postSupply = currentStock + inTransit + proposeQty;
  // 采购后库存覆盖天数 = (当前可用库存 + 在途采购 + 本次采购数量) / 日均预测消耗
  const postCoverageDays = Math.round(postSupply / avgDailyDemand);

  // 采购趋势 = (本次采购后供给量 / (当前库存及在途供给量)) - 1
  const currentTotalSupply = currentStock + inTransit;
  const purchaseTrend = currentTotalSupply > 0 ? Math.round(((postSupply / currentTotalSupply) - 1) * 100) : 0;

  // --- Interactive Chart State & Memo ---
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
    return weeks.map((week, idx) => {
      // 1. Demand (Blue line): Starts around 1200 and trends up or down smoothly based on salesTrend
      const demandVal = Math.round(1200 * (1 + (salesTrend / 100) * (idx / 7)));
      
      // 2. Upper and Lower Limits (Orange & Green dashed lines)
      const lowerVal = Math.round(demandVal * 0.8);
      const upperVal = Math.round(demandVal * 1.2);
      
      // 3. Supply (Red line): starts with current stock, adds in-transit at W3, and adds proposeQty at W5
      const baseStock = currentStockDays * 12;
      const transitAdd = idx >= 2 ? (inTransitDays * 12) : 0;
      const proposeAdd = idx >= 4 ? proposeQty : 0;
      const supplyVal = Math.round(baseStock + transitAdd + proposeAdd);
      
      return {
        week,
        demand: Math.max(0, demandVal),
        upper: Math.max(0, upperVal),
        lower: Math.max(0, lowerVal),
        supply: Math.max(0, supplyVal)
      };
    });
  }, [salesTrend, currentStockDays, inTransitDays, proposeQty]);

  const { minY, maxY } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    chartData.forEach(d => {
      const vals = [d.demand, d.upper, d.lower, d.supply];
      vals.forEach(v => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    return {
      minY: Math.max(0, Math.floor(min * 0.8)),
      maxY: Math.ceil(max * 1.15)
    };
  }, [chartData]);

  const getX = (idx: number) => 50 + (idx / 7) * 480;
  const getY = (val: number) => {
    const range = maxY - minY || 1;
    return 20 + (1 - (val - minY) / range) * 220;
  };

  // --- Rule Evaluation (Live Matrix) ---
  
  // Rule 1: 趋势方向匹配规则
  const r1Status = useMemo(() => {
    if (salesTrend <= -30 && purchaseTrend >= 50) return { level: 'high', label: '高风险', desc: '销量骤降(≥30%)但采购供给大幅倒挂(≥50%)，库存爆仓极高。' };
    if (salesTrend <= -20 && purchaseTrend >= 30) return { level: 'risk', label: '风险', desc: '销量下滑(≥20%)且采购惯性上升(≥30%)，产生重度资金占压。' };
    if (salesTrend <= -10 && purchaseTrend >= 20) return { level: 'warn', label: '关注', desc: '销售走势与采购呈反向背离倾向，建议调减或重估。' };
    if (salesTrend >= 20 && postCoverageDays < (leadTimeDays + safetyDays)) return { level: 'risk', label: '缺料风险', desc: '销量大幅反弹(≥20%)，但本次采购后库存水位依然低于安全警戒线。' };
    return { level: 'normal', label: '正常', desc: '采购提报方向与销量走势方向基本一致，无严重偏离。' };
  }, [salesTrend, purchaseTrend, postCoverageDays, leadTimeDays, safetyDays]);

  // Rule 2: 需求覆盖规则
  const r2Status = useMemo(() => {
    const minThreshold = leadTimeDays + safetyDays;
    if (postCoverageDays < minThreshold) return { level: 'risk', label: '缺料风险', desc: `覆盖天数(${postCoverageDays}天)低于[交期+安全]红线(${minThreshold}天)，易断档。` };
    if (postCoverageDays >= 30 && postCoverageDays <= 60) return { level: 'normal', label: '正常', desc: '库存覆盖天数处于 30-60 天黄金合理带。' };
    if (postCoverageDays > 60 && postCoverageDays <= 90) return { level: 'warn', label: '关注', desc: '库存覆盖天数 60-90 天，略高于常规备货策略。' };
    if (postCoverageDays > 90 && postCoverageDays <= 120) return { level: 'risk', label: '积压风险', desc: '库存覆盖超过 90 天，流动资金存在过量占用。' };
    return { level: 'high', label: '高积压风险', desc: `覆盖天数(${postCoverageDays}天)超过 120 天，相当于 4 个月用量，将导致严重的呆滞资金积压！` };
  }, [postCoverageDays, leadTimeDays, safetyDays]);

  // Rule 3: 采购数量偏离规则
  const r3Status = useMemo(() => {
    if (suggestedQty === 0 && proposeQty > 0) return { level: 'high', label: '高风险过量', desc: '系统计算建议采购量为0，本次提报属于盲目过量采购。' };
    if (proposeQty < lowerBound) return { level: 'risk', label: '采购不足', desc: `提报数量(${proposeQty})低于系统科学建议下限(${lowerBound})，生产存在断料隐患。` };
    if (proposeQty > upperBound * 1.5) return { level: 'high', label: '高风险过量', desc: `提报数量(${proposeQty})超出建议上限50%以上，积压风险极高。` };
    if (proposeQty > upperBound) return { level: 'risk', label: '采购过量', desc: `提报数量(${proposeQty})高于建议合理上限(${upperBound})。` };
    return { level: 'normal', label: '正常', desc: '提报数量处于系统计算的[80% - 120%]科学包规合理偏离带内。' };
  }, [proposeQty, suggestedQty, lowerBound, upperBound]);

  // Rule 4: 累计供需曲线偏离 (供需拟合度)
  // Simulating an average deviation rate based on the proposed quantity relative to suggested range
  const fitScore = useMemo(() => {
    if (suggestedQty === 0) {
      return proposeQty === 0 ? 100 : Math.max(20, 100 - Math.round((proposeQty / 500) * 100));
    }
    const deviation = Math.abs(proposeQty - suggestedQty) / suggestedQty;
    const score = Math.max(10, Math.round((1 - deviation) * 100));
    return score;
  }, [proposeQty, suggestedQty]);

  const r4Status = useMemo(() => {
    if (fitScore >= 85) return { level: 'normal', label: '正常', desc: `供需拟合度高 (${fitScore}%)，供给曲线在合理库存带宽内，匹配度极佳。` };
    if (fitScore >= 70) return { level: 'warn', label: '关注', desc: `供需拟合度一般 (${fitScore}%)，存在中度偏离，建议核对销量计划。` };
    if (fitScore >= 50) return { level: 'risk', label: '风险', desc: `供需拟合度低 (${fitScore}%)，供给和消耗曲线开始明显偏离走势。` };
    return { level: 'high', label: '高风险', desc: `供需拟合度极差 (${fitScore}%)，属于严重脱节的粗放型提报。` };
  }, [fitScore]);

  // Rule 5: 销售下滑 + 库存高 + 继续采购联合预警 (联合预警)
  const r5Status = useMemo(() => {
    const isSalesDropping = salesTrend < 0;
    const isStockHigh = currentStockDays > 45;
    const isCoverageIncreasing = postCoverageDays > currentStockDays;

    if (isSalesDropping && isStockHigh && isCoverageIncreasing) {
      if (salesTrend <= -20 && isEngineeringChange) {
        return { triggered: true, level: 'critical', label: '极高风险', desc: '【销量暴跌 + 旧件仍狂采 + 即将切换】检测到车型销量下跌，且旧物料即将切换废弃，但采购仍在疯狂买入旧件，将造成 100% 无法冲销的呆滞废料！建议一键驳回！' };
      }
      if (salesTrend <= -20 && postCoverageDays > 120) {
        return { triggered: true, level: 'high', label: '高风险', desc: `【销售暴跌+严重积压】车型销量下滑${Math.abs(salesTrend)}%，采购后可用天数将继续抬升至惊人的${postCoverageDays}天，严重爆仓。` };
      }
      if (salesTrend <= -10 && postCoverageDays > 90) {
        return { triggered: true, level: 'risk', label: '风险', desc: `【供需双重扭曲】销量呈负增长态势，在途与在库充裕，继续采购将库存推高至${postCoverageDays}天(红线为90天)。` };
      }
      return { triggered: true, level: 'warn', label: '关注', desc: '满足联合预警初步条件（销量降、高库存、覆盖升），但指标尚未越界。' };
    }
    return { triggered: false, level: 'normal', label: '未触发', desc: '未同时满足“销量降 + 库存高 + 采购后覆盖继续升”的联合触发引擎。' };
  }, [salesTrend, currentStockDays, postCoverageDays, isEngineeringChange]);

  // Rule 6: 热销增长 + 覆盖不足预警
  const r6Status = useMemo(() => {
    const isSalesGrowing = salesTrend > 0;
    const minThreshold = leadTimeDays + safetyDays;
    const isCoverageInsufficient = postCoverageDays < minThreshold;

    if (isSalesGrowing || isBacklogRising) {
      if (isCoverageInsufficient) {
        if (salesTrend > 20) {
          return { triggered: true, level: 'high', label: '高缺料风险', desc: `【销量爆发+极限断档】销量增长超20%，采购后可用天数仅${postCoverageDays}天，低于交期加安全天数${minThreshold}天！极易发生停产断料，必须加急追加！` };
        }
        if (salesTrend > 15) {
          return { triggered: true, level: 'risk', label: '缺料风险', desc: `【主销车型补货不足】主销车型需求上涨${salesTrend}%，但采购提报过低，库存覆盖严重不足，影响及时交付。` };
        }
      }
      if (isBacklogRising && currentStockDays < 15) {
        return { triggered: true, level: 'risk', label: '缺料风险', desc: '【未交付订单暴涨+在库告急】积压订单正在拉升，关键零部件库存严重不足。' };
      }
      return { triggered: true, level: 'warn', label: '关注', desc: '销量呈现上升趋势，建议在途和在库做适当多备。' };
    }
    return { triggered: false, level: 'normal', label: '未触发', desc: '未触发缺料或热销覆盖不足警告。' };
  }, [salesTrend, postCoverageDays, leadTimeDays, safetyDays, isBacklogRising, currentStockDays]);


  // --- 5.合理性评分模型 (Approval Score Calculation) ---
  const scoreBreakdown = useMemo(() => {
    // 1. 销售趋势匹配 (25% Weight)
    let sTrendScore = 25;
    if (salesTrend <= -20 && purchaseTrend >= 30) sTrendScore = 5;
    else if (salesTrend <= -10 && purchaseTrend >= 20) sTrendScore = 15;
    else if (salesTrend >= 15 && postCoverageDays < (leadTimeDays + safetyDays)) sTrendScore = 10;

    // 2. 采购数量匹配 (30% Weight)
    let sQtyScore = 30;
    if (suggestedQty === 0 && proposeQty > 0) sQtyScore = 0;
    else if (proposeQty > upperBound * 1.5 || proposeQty < lowerBound * 0.5) sQtyScore = 5;
    else if (proposeQty > upperBound || proposeQty < lowerBound) sQtyScore = 15;

    // 3. 库存覆盖合理性 (20% Weight)
    let sCoverScore = 20;
    if (postCoverageDays > 120) sCoverScore = 0;
    else if (postCoverageDays > 90 || postCoverageDays < 20) sCoverScore = 8;
    else if (postCoverageDays > 60) sCoverScore = 14;

    // 4. 在途与库存考虑 (15% Weight)
    let sTransitScore = 15;
    if (currentStockDays > 60 && inTransitDays > 20 && proposeQty > suggestedQty) sTransitScore = 5;
    else if (currentStockDays > 90) sTransitScore = 2;

    // 5. 供应风险修正 (10% Weight)
    let sRiskScore = 10;
    if (isEngineeringChange) sRiskScore = 0; // 工程变更降到0

    const total = sTrendScore + sQtyScore + sCoverScore + sTransitScore + sRiskScore;
    
    let grade = '正常';
    let gradeColor = 'text-emerald-500 bg-emerald-50 border-emerald-200';
    let suggestion = '该提报采购量及供需拟合方向非常健康，系统建议自动通过。';
    
    if (total < 50) {
      grade = '高风险';
      gradeColor = 'text-rose-600 bg-rose-50 border-rose-200';
      suggestion = '【一键卡点拦截】由于销量走势与采购动作严重背离、采购量大幅超出红线或即将工程变更，采购将被系统强力拦截驳回。建议大幅调减本批申购数量或暂缓采购！';
    } else if (total < 70) {
      grade = '风险';
      gradeColor = 'text-orange-600 bg-orange-50 border-orange-200';
      suggestion = '【智能核减意见】该采购提报存在较高的资金占压或备货失调，建议进行数量核减（建议核减至合理建议区间以内）后重新提报。';
    } else if (total < 85) {
      grade = '关注';
      gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
      suggestion = '【提示审批确认】各项指标基本在受控线边缘，建议审批人线下跟进并确认销量预测及备货原因。';
    }

    return {
      total,
      grade,
      gradeColor,
      suggestion,
      breakdown: {
        trend: sTrendScore,
        qty: sQtyScore,
        cover: sCoverScore,
        transit: sTransitScore,
        risk: sRiskScore
      }
    };
  }, [salesTrend, purchaseTrend, proposeQty, suggestedQty, postCoverageDays, leadTimeDays, safetyDays, upperBound, lowerBound, currentStockDays, inTransitDays, isEngineeringChange]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 5.0 Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
              <ClipboardList className="w-3.5 h-3.5" />
              板块五 · 核心方案
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              采购审批销量拟合与库存阈值预警说明
            </h2>
            <p className="text-xs text-slate-500">
              销售走势决定未来需求，BOM把整车换算成零部件需求，库存和在途决定现有供给，采购决策新增供给。通过供需拟合和阀值做卡点拦截。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            审批前置智能卡点插件
          </div>
        </div>
      </div>

      {/* Main Core Layout: Left Sandbox Controls, Right Assessment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sandbox Param Adjuster (5 cols) */}
        <div id="sandbox-ctrl-section" className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              第一步：多维度沙盘参数模拟
            </h3>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">100% 动态拟合</span>
          </div>

          <div className="space-y-5">
            {/* Sales Trend Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  📈 车型销量预测走势 (4周)
                </span>
                <span className={`font-mono font-bold ${salesTrend < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {salesTrend > 0 ? `+${salesTrend}` : salesTrend}%
                </span>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="50" 
                value={salesTrend} 
                onChange={(e) => setSalesTrend(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>暴跌 -50%</span>
                <span>持平 0%</span>
                <span>暴涨 +50%</span>
              </div>
            </div>

            {/* Current Stock Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>📦 当前可用在库天数 (I_c)</span>
                <span className="font-mono text-slate-900 font-bold">{currentStockDays} 天</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="150" 
                value={currentStockDays} 
                onChange={(e) => setCurrentStockDays(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>极限缺货 5天</span>
                <span>黄金水位 45天</span>
                <span>重度积压 150天</span>
              </div>
            </div>

            {/* In Transit Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>🚚 在途采购未交付天数 (I_t)</span>
                <span className="font-mono text-slate-900 font-bold">{inTransitDays} 天</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="60" 
                value={inTransitDays} 
                onChange={(e) => setInTransitDays(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* Propose Qty */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>🔩 本次申请采购数量 (P_propose)</span>
                <span className="font-mono text-indigo-600 font-bold">{proposeQty} 件</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={proposeQty} 
                onChange={(e) => setProposeQty(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>不买 0</span>
                <span>少量 1000</span>
                <span>大量 5000</span>
              </div>
            </div>

            {/* Helper Params */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">零部件到货交期</label>
                <div className="flex items-center gap-1 mt-1">
                  <input 
                    type="number" 
                    value={leadTimeDays} 
                    onChange={(e) => setLeadTimeDays(Math.max(1, Number(e.target.value)))}
                    className="w-12 text-xs font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">天</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">内控安全库存天数</label>
                <div className="flex items-center gap-1 mt-1">
                  <input 
                    type="number" 
                    value={safetyDays} 
                    onChange={(e) => setSafetyDays(Math.max(1, Number(e.target.value)))}
                    className="w-12 text-xs font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">天</span>
                </div>
              </div>
            </div>

            {/* Risk toggles */}
            <div className="p-3 bg-rose-50/20 rounded-xl border border-rose-100/40 space-y-3">
              <span className="text-[10px] font-bold text-rose-800 tracking-wider block uppercase">异常风险触发器：</span>
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${isEngineeringChange ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-slate-300'}`}>
                    {isEngineeringChange && <span className="text-[8px] font-extrabold">✓</span>}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={isEngineeringChange} 
                    onChange={(e) => setIsEngineeringChange(e.target.checked)}
                    className="hidden" 
                  />
                  ⚠️ 即将发生工程变更 (工改切换新件)
                </label>
                <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-medium">呆滞高危</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${isBacklogRising ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                    {isBacklogRising && <span className="text-[8px] font-extrabold">✓</span>}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={isBacklogRising} 
                    onChange={(e) => setIsBacklogRising(e.target.checked)}
                    className="hidden" 
                  />
                  📈 未交付订单 (Backlog) 持续上升
                </label>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">缺料告急</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rules Diagnostics Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 2.1: The 5 Automated Questions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              第二步：系统审批时必须回答的 5 个关键判断
            </h3>
            
            <div className="space-y-2.5">
              {/* Q1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">问题 1：对应哪些车型 / 配置 / 单车用量？</div>
                  <p className="text-[11px] text-slate-500">通过 BOM 精准穿透匹配整车配置及每车消耗用量。</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold shrink-0">
                  多拉3米8 / 单车1个
                </span>
              </div>

              {/* Q2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">问题 2：适用车型的未来销售走势如何？</div>
                  <p className="text-[11px] text-slate-500">结合历史订单、未交付订单、销售预测拟合出预测曲线。</p>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${salesTrend < 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                  销量预测：{salesTrend}%
                </span>
              </div>

              {/* Q3 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">问题 3：零部件未来计算周期需要多少？</div>
                  <p className="text-[11px] text-slate-500">车型预测销量 × BOM 用量，精细计算交期和安全缓冲。</p>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold shrink-0">
                  建议采购: {suggestedQty} 件
                </span>
              </div>

              {/* Q4 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">问题 4：当前在库 + 在途 + 本次申购后是否合理？</div>
                  <p className="text-[11px] text-slate-500">计算采购后库存可用天数(T)，判断是否突破合理上限天数。</p>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold shrink-0">
                  覆盖天数: {postCoverageDays} 天
                </span>
              </div>

              {/* Q5 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">问题 5：本次采购属于正常、偏高、偏低还是缺料？</div>
                  <p className="text-[11px] text-slate-500">对齐采购上下限、拟合偏离规则等进行最终诊断。</p>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                  r3Status.level === 'high' ? 'bg-rose-100 text-rose-700' : 
                  r3Status.level === 'risk' ? 'bg-orange-100 text-orange-700' : 
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  本次结论: {r3Status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2.2: Live Mathematical Curves (三条曲线可视化) */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                第三步：供需与库存阈值走势拟合曲线 (100% 实时反馈)
              </h3>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-mono font-bold">
                W1 - W8 模拟走势
              </span>
            </div>

            {/* Legend Indicators */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
                <span className="text-slate-300">预测需求 (Blue)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
                <span className="text-slate-300">采购后供给 (Red)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
                <span className="text-slate-300">供给上限 (Orange)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block"></span>
                <span className="text-slate-300">供给下限 (Green)</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full overflow-x-auto">
              <svg 
                viewBox="0 0 550 280" 
                className="w-full min-w-[500px] h-[280px]"
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Y-Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const val = Math.round(minY + pct * (maxY - minY));
                  const y = 20 + (1 - pct) * 220;
                  return (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="530" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                      <text x="42" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                {chartData.map((d, idx) => {
                  const x = getX(idx);
                  return (
                    <g key={idx}>
                      <line x1={x} y1="240" x2={x} y2="245" stroke="#334155" strokeWidth="1" />
                      <text x={x} y="260" fill="#64748b" fontSize="10" textAnchor="middle" className="font-mono">
                        {d.week}
                      </text>
                      
                      {/* Invisible hover trigger columns */}
                      <rect 
                        x={x - 20} 
                        y="20" 
                        width="40" 
                        height="220" 
                        fill="transparent" 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                      />
                    </g>
                  );
                })}

                {/* Draw Curves */}
                {/* 1. Demand (Blue) */}
                <path 
                  d={chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.demand)}`).join(' ')} 
                  stroke="#3b82f6" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                />
                {/* 2. Lower Limit (Green dashed) */}
                <path 
                  d={chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.lower)}`).join(' ')} 
                  stroke="#10b981" 
                  strokeWidth="1.5" 
                  strokeDasharray="5,5"
                  fill="none" 
                />
                {/* 3. Upper Limit (Orange dashed) */}
                <path 
                  d={chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upper)}`).join(' ')} 
                  stroke="#f59e0b" 
                  strokeWidth="1.5" 
                  strokeDasharray="5,5"
                  fill="none" 
                />
                {/* 4. Supply (Red) */}
                <path 
                  d={chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.supply)}`).join(' ')} 
                  stroke="#ef4444" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                />

                {/* Dots at each week */}
                {chartData.map((d, idx) => (
                  <g key={idx}>
                    <circle cx={getX(idx)} cy={getY(d.demand)} r="3.5" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx={getX(idx)} cy={getY(d.supply)} r="3.5" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
                  </g>
                ))}

                {/* Active Hover Column & Interactive Points */}
                {hoveredIdx !== null && (
                  <g>
                    <line 
                      x1={getX(hoveredIdx)} 
                      y1="20" 
                      x2={getX(hoveredIdx)} 
                      y2="240" 
                      stroke="#475569" 
                      strokeWidth="1.5" 
                      strokeDasharray="3,3" 
                    />
                    <circle cx={getX(hoveredIdx)} cy={getY(chartData[hoveredIdx].demand)} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={getX(hoveredIdx)} cy={getY(chartData[hoveredIdx].supply)} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}
              </svg>
            </div>

            {/* Hover Tooltip/Detail Card Panel */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              {hoveredIdx !== null ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 font-mono font-bold">
                    <span className="text-indigo-400 font-extrabold">📌 {chartData[hoveredIdx].week} 周期实时数据穿透</span>
                    <span className="text-[10px]">销售趋势: {salesTrend}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>• 零部件预测需求 (Demand):</span>
                      <strong className="text-blue-400">{chartData[hoveredIdx].demand} 件</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• 采购后累计供给 (Supply):</span>
                      <strong className="text-rose-400">{chartData[hoveredIdx].supply} 件</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• 科学供给上限阈值 (Upper):</span>
                      <strong className="text-amber-400">{chartData[hoveredIdx].upper} 件</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• 供给安全下限红线 (Lower):</span>
                      <strong className="text-emerald-400">{chartData[hoveredIdx].lower} 件</strong>
                    </div>
                  </div>
                  <div className="text-[10px] border-t border-slate-800/60 pt-1.5 flex justify-between items-center">
                    <span className="text-slate-500">供需安全水位判定：</span>
                    {chartData[hoveredIdx].supply > chartData[hoveredIdx].upper ? (
                      <span className="text-rose-400 font-extrabold">⚠️ 突破合理备货上限 (采购过量/资金占用)</span>
                    ) : chartData[hoveredIdx].supply < chartData[hoveredIdx].lower ? (
                      <span className="text-orange-400 font-extrabold">⚠️ 低于供给下限红线 (采购不足/断料风险)</span>
                    ) : (
                      <span className="text-emerald-400 font-extrabold">✓ 供给落在合理安全带宽内</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-2.5 font-mono flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  鼠标滑过曲线图的 W1-W8 节点，即可实时进行该周期的核心数据细节穿透。
                </div>
              )}
            </div>

            {/* Analytical comments matching selected state */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono flex justify-between items-center gap-2">
              <span className="text-slate-400 text-[10px]">采购趋势拟合度：</span>
              <span className={purchaseTrend >= 30 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {purchaseTrend > 0 ? `+${purchaseTrend}` : purchaseTrend}% 
              </span>
              <span className="text-[10px] text-slate-500">
                {salesTrend < 0 && purchaseTrend >= 20 ? '❌ 典型“销量大降但采购仍在狂飙”倒挂背离' : '✓ 采购申请走势健康'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Score & Decision Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left: Financial Impact Indicator Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calculator className="w-4.5 h-4.5 text-indigo-500" />
              采购决策模型 · 综合合理性评分
            </h3>

            {/* Huge radial-style score circle */}
            <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={scoreBreakdown.total < 50 ? '#f43f5e' : scoreBreakdown.total < 70 ? '#f97316' : scoreBreakdown.total < 85 ? '#f59e0b' : '#10b981'} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * scoreBreakdown.total) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-black font-mono text-slate-800">{scoreBreakdown.total}</div>
                  <div className="text-[9px] text-slate-400 font-bold">综合得分</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${scoreBreakdown.gradeColor}`}>
                    评级: {scoreBreakdown.grade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  由系统算法引擎针对“销售、数量、库龄、在途及工改风险”5大维度自动权重判分。
                </p>
              </div>
            </div>

            {/* Score detail weight breakdown */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>① 销售趋势方向匹配 (权重 25)</span>
                <span className="font-mono font-bold text-slate-800">{scoreBreakdown.breakdown.trend} / 25</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.breakdown.trend / 25) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>② 采购数量科学匹配 (权重 30)</span>
                <span className="font-mono font-bold text-slate-800">{scoreBreakdown.breakdown.qty} / 30</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.breakdown.qty / 30) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>③ 采购后库存覆盖合理性 (权重 20)</span>
                <span className="font-mono font-bold text-slate-800">{scoreBreakdown.breakdown.cover} / 20</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.breakdown.cover / 20) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>④ 在途与在库库存水位扣减 (权重 15)</span>
                <span className="font-mono font-bold text-slate-800">{scoreBreakdown.breakdown.transit} / 15</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.breakdown.transit / 15) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>⑤ 供应商与工改高危修正 (权重 10)</span>
                <span className="font-mono font-bold text-slate-800">{scoreBreakdown.breakdown.risk} / 10</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.breakdown.risk / 10) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            📊 <strong>分级审批建议：</strong>85-100分正常审批；70-85分需确认原因；50-70分建议数量核减；&lt;50分强行拦截升级或驳回。
          </div>
        </div>

        {/* Right: Dynamic Suggested Decision Block (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                系统实时决策意见反馈
              </span>
              <span className="text-[10px] font-mono text-slate-400">决策引擎自动生成</span>
            </div>

            {/* Giant Suggested Decision Feedback Card */}
            <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-3 ${
              scoreBreakdown.total < 50 ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
              scoreBreakdown.total < 70 ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            }`}>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                {scoreBreakdown.total < 50 ? '❌ 拦截阻断·高危管控审批' : scoreBreakdown.total < 70 ? '⚠️ 智能核减·建议裁剪提报' : '✓ 科学放行·符合供应规划'}
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {scoreBreakdown.suggestion}
              </p>
              
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono space-y-2 text-[11px] text-slate-400">
                <div className="grid grid-cols-2 gap-2">
                  <div>• 车型销售走势：<strong className="text-slate-200">{salesTrend}%</strong></div>
                  <div>• 系统合理建议值：<strong className="text-slate-200">{suggestedQty} 件</strong></div>
                  <div>• 本次申请数量：<strong className="text-slate-200">{proposeQty} 件</strong></div>
                  <div>• 覆盖上限阈值：<strong className="text-slate-200">90 天</strong></div>
                  <div>• 采购后覆盖天数：<strong className="text-slate-200">{postCoverageDays} 天</strong></div>
                  <div>• 预计沉淀资金：<strong className="text-rose-400 font-bold">{Math.round(proposeQty * 0.085)} 万元</strong></div>
                </div>
              </div>
            </div>

            {/* List of active warnings among Rule 1 - Rule 6 */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">触发的采购审批规则细则：</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                {/* R1 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${r1Status.level === 'normal' ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 1：趋势方向匹配</span>
                  <span className="font-bold shrink-0">{r1Status.label}</span>
                </div>
                {/* R2 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${r2Status.level === 'normal' ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 2：需求覆盖规则</span>
                  <span className="font-bold shrink-0">{r2Status.label}</span>
                </div>
                {/* R3 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${r3Status.level === 'normal' ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 3：采购数量偏离</span>
                  <span className="font-bold shrink-0">{r3Status.label}</span>
                </div>
                {/* R4 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${r4Status.level === 'normal' ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 4：累计供需曲线偏离</span>
                  <span className="font-bold shrink-0">{r4Status.label}</span>
                </div>
                {/* R5 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${!r5Status.triggered ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 5：下滑库存高联合预警</span>
                  <span className="font-bold shrink-0">{r5Status.label}</span>
                </div>
                {/* R6 */}
                <div className={`p-2 rounded border flex items-center justify-between gap-2 ${!r6Status.triggered ? 'bg-slate-800/30 border-slate-800/50 text-slate-400' : 'bg-rose-950/40 border-rose-900/50 text-rose-200'}`}>
                  <span>规则 6：热销缺料覆盖不足预警</span>
                  <span className="font-bold shrink-0">{r6Status.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center font-mono">
            <span>智能卡点规则完全依据本期立项说明文档建立</span>
            <span className="text-emerald-400 font-bold">闭环决策引擎</span>
          </div>
        </div>

      </div>

      {/* Rules Encyclopedia (Detailed grid of the 6 Rules) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            四、采购审批 6 大核心预警规则库
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            系统后台判定逻辑细则，结合供需拟合系数，对每一次提报进行量化防线封锁
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Rule 1 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 1：趋势方向匹配规则</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">权重 25%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>判定销售走势和采购动作是否一致。防范车型大降而采购仍惯性大手大脚买入。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600 space-y-1">
                <div>• 销量趋势 = 未来预测量 / 过去销量 - 1</div>
                <div>• 采购趋势 = 采购后供给量 / 当前及在途量 - 1</div>
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ 下降 ≥ 20% 且 采购增加 ≥ 30% ➔ 风险（减少采购）
            </div>
          </div>

          {/* Rule 2 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 2：需求覆盖规则</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">权重 20%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>判定采购后，总库存供给可用天数(T)是否突破安全上限，或低于缺料红线。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600">
                公式：T = (在库 + 在途 + 采购量) / 日均消耗
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ T &gt; 90天 ➔ 积压风险； T &gt; 120天 ➔ 高积压风险
            </div>
          </div>

          {/* Rule 3 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 3：采购数量偏离规则</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">权重 30%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>检验本次采购数量是否明显偏离系统算出的科学建议采购量 [80% - 120%] 区间。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600">
                建议量 = 交期需求 + 安全天数 - 在库 - 在途
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ 数量 &gt; 建议上限 50% ➔ 高风险过量审批
            </div>
          </div>

          {/* Rule 4 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 4：累计供需曲线偏离规则</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">供需拟合度</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>判定周期内累计供给供给带 S(t) 和需求带 D(t) 的连续重合程度（供需拟合度 = 1 - 平均偏离率）。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600">
                偏离率 = 平均 |实际供给 - 合理供给| / 合理供给
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ 拟合度 &lt; 70% ➔ 关注； &lt; 50% ➔ 高风险
            </div>
          </div>

          {/* Rule 5 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 5：销售下滑+库存高+继续采购</span>
                <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono">联合立体预警</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>销量下滑且在库积压时，又继续下单导致覆盖度急升。重合工改变更即将发生时，100% 暴雷。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600">
                复合条件触发 ➔ 立体多维度穿透卡点
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ 下降+工改变更中+继续采购旧件 ➔ 极高风险
            </div>
          </div>

          {/* Rule 6 card */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-indigo-100 hover:shadow-sm transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">规则 6：热销增长+覆盖不足</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">战略防断料</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>目的：</strong>主销或大订量车型销量飙涨，但零部件在途和在库严重低于供应商到货交期的风险保障。
              </p>
              <div className="bg-slate-100/50 p-2 rounded text-[10px] font-mono text-slate-600">
                触发：热销中 且 库存后覆盖天数 &lt; 交期天数
              </div>
            </div>
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded">
              ⚠️ 采购覆盖低于交期 ➔ 极高缺料断产风险
            </div>
          </div>

        </div>
      </div>

      {/* 五、车型历史销量分析与未来销售趋势建议 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              板块五 · 经营智能
            </div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              五、车型历史销售情况与未来销量趋势建议
            </h3>
            <p className="text-xs text-slate-500">
              展示核心车型过去半年的真实销售业绩、在库预警，并对未来 3 个月的不同销售走势给出供应链补货与排产行动预案。
            </p>
          </div>
          
          {/* Active Model Selector */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {(['v1', 'v2', 'v3'] as const).map((vid) => (
              <button
                key={vid}
                onClick={() => setSelectedVehicle(vid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedVehicle === vid
                    ? 'bg-white text-slate-950 shadow-sm font-bold border border-slate-200/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {vehicleHistoryData[vid].name}
              </button>
            ))}
          </div>
        </div>

        {/* Info Grid of selected Vehicle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Historical statistics (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase tracking-wider">车型画像与配置</span>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-500" />
                {vehicleHistoryData[selectedVehicle].name}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{vehicleHistoryData[selectedVehicle].config}</p>
              
              <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">过去半年总销量：</span>
                  <strong className="text-slate-900 font-mono font-extrabold">{vehicleHistoryData[selectedVehicle].total} 辆</strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">过去半年月均销量：</span>
                  <strong className="text-slate-900 font-mono font-extrabold">{vehicleHistoryData[selectedVehicle].avg} 辆/月</strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">历史销售增长走势：</span>
                  <strong className={`font-mono font-extrabold ${vehicleHistoryData[selectedVehicle].yoyTrend.includes('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {vehicleHistoryData[selectedVehicle].yoyTrend}
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                成品车在库状态监控
              </div>
              <p className="text-[11px] text-amber-950/80 leading-relaxed">
                {vehicleHistoryData[selectedVehicle].stockStatus}
              </p>
            </div>

            {/* Quick action card: sync back with sandbox */}
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/60 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
                双向沙盘联动控制
              </div>
              <p className="text-[11px] text-indigo-950/70 leading-relaxed">
                一键将当前预测走势同步至上方的【第一步：沙盘模拟】，系统会立即运行6大预警规则并重算合理备货量。
              </p>
              <button
                onClick={() => {
                  const targetTrend = vehicleHistoryData[selectedVehicle].scenarios[trendScenario].sliderTrend;
                  setSalesTrend(targetTrend);
                  
                  // Set related properties if optimistic/pessimistic
                  if (selectedVehicle === 'v2') {
                    // Hot selling cargo van
                    setCurrentStockDays(15);
                    setInTransitDays(8);
                    setProposeQty(2000);
                  } else if (selectedVehicle === 'v1') {
                    // Overstocked micro truck
                    setCurrentStockDays(75);
                    setInTransitDays(20);
                    setProposeQty(1200);
                  } else {
                    // Steady micro-truck
                    setCurrentStockDays(28);
                    setInTransitDays(10);
                    setProposeQty(3000);
                  }

                  const element = document.getElementById('sandbox-ctrl-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                同步至沙盘：趋势设为 {vehicleHistoryData[selectedVehicle].scenarios[trendScenario].sliderTrend}%
              </button>
            </div>
          </div>

          {/* Middle Panel: Visual historical trend chart & projection (8 cols total) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Trend Forecast & Scenario Switcher */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">销售周期业绩曲线（过去6个月实销 + 未来3个月走势预估）</span>
                </div>
                
                {/* Scenario buttons */}
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  {(['neutral', 'optimistic', 'pessimistic'] as const).map((scen) => (
                    <button
                      key={scen}
                      onClick={() => setTrendScenario(scen)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        trendScenario === scen
                          ? scen === 'optimistic'
                            ? 'bg-emerald-500 text-white font-extrabold'
                            : scen === 'pessimistic'
                            ? 'bg-rose-500 text-white font-extrabold'
                            : 'bg-indigo-500 text-white font-extrabold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {scen === 'neutral' ? '中性' : scen === 'optimistic' ? '乐观' : '悲观'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic SVG with 9-month timeline */}
              <div className="relative w-full overflow-x-auto">
                {(() => {
                  const veh = vehicleHistoryData[selectedVehicle];
                  const pastSales = veh.sales;
                  const futureSales = veh.scenarios[trendScenario].forecast;
                  const allPoints = [...pastSales, ...futureSales];
                  
                  // Scale logic
                  const maxVal = Math.max(...allPoints) * 1.15;
                  const minVal = Math.max(0, Math.min(...allPoints) * 0.8);
                  const range = maxVal - minVal || 1;
                  
                  const getXCoord = (i: number) => 45 + (i / 8) * 440;
                  const getYCoord = (val: number) => 25 + (1 - (val - minVal) / range) * 115;
                  
                  return (
                    <div className="w-full min-w-[480px]">
                      <svg viewBox="0 0 520 175" className="w-full h-[175px]">
                        {/* Horizontal Grid lines */}
                        {[0, 0.5, 1].map((pct, idx) => {
                          const val = Math.round(minVal + pct * (maxVal - minVal));
                          const y = 25 + (1 - pct) * 115;
                          return (
                            <g key={idx}>
                              <line x1="45" y1={y} x2="495" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                              <text x="38" y={y + 3} fill="#64748b" fontSize="8" textAnchor="end" className="font-mono">
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Mid-boundary separator between past and future */}
                        <line x1={getXCoord(5)} y1="10" x2={getXCoord(5)} y2="155" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={getXCoord(5) - 6} y="18" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="end">
                          实销截止
                        </text>
                        <text x={getXCoord(5) + 6} y="18" fill="#a78bfa" fontSize="8" fontWeight="bold" textAnchor="start">
                          预测走势
                        </text>

                        {/* Solid Area background for past 6 months */}
                        <path
                          d={`
                            M ${getXCoord(0)} 145 
                            ${pastSales.map((v, i) => `L ${getXCoord(i)} ${getYCoord(v)}`).join(' ')} 
                            L ${getXCoord(5)} 145 Z
                          `}
                          fill={selectedVehicle === 'v1' ? 'url(#grad-indigo)' : selectedVehicle === 'v2' ? 'url(#grad-emerald)' : 'url(#grad-sky)'}
                          opacity="0.12"
                        />

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="grad-indigo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="grad-emerald" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="grad-sky" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Past 6 Months Solid Line */}
                        <path
                          d={pastSales.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getXCoord(i)} ${getYCoord(v)}`).join(' ')}
                          stroke={selectedVehicle === 'v1' ? '#6366f1' : selectedVehicle === 'v2' ? '#10b981' : '#0ea5e9'}
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Future 3 Months Dashed Line */}
                        <path
                          d={`M ${getXCoord(5)} ${getYCoord(pastSales[5])} ` + futureSales.map((v, i) => `L ${getXCoord(i + 6)} ${getYCoord(v)}`).join(' ')}
                          stroke={trendScenario === 'optimistic' ? '#10b981' : trendScenario === 'pessimistic' ? '#f43f5e' : '#818cf8'}
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Timeline points */}
                        {allPoints.map((v, idx) => {
                          const x = getXCoord(idx);
                          const y = getYCoord(v);
                          const isFuture = idx >= 6;
                          const ptColor = isFuture 
                            ? trendScenario === 'optimistic' ? '#10b981' : trendScenario === 'pessimistic' ? '#f43f5e' : '#818cf8'
                            : selectedVehicle === 'v1' ? '#6366f1' : selectedVehicle === 'v2' ? '#10b981' : '#0ea5e9';
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={y} r={isFuture ? "3.5" : "4.5"} fill={ptColor} stroke="#0f172a" strokeWidth="1.5" />
                              <text x={x} y={y - 8} fill="#94a3b8" fontSize="7" textAnchor="middle" className="font-mono font-bold">
                                {v}
                              </text>
                            </g>
                          );
                        })}

                        {/* X-axis labels */}
                        {[...veh.months, '7月(预)', '8月(预)', '9月(预)'].map((m, idx) => {
                          const x = getXCoord(idx);
                          return (
                            <text key={idx} x={x} y="165" fill="#64748b" fontSize="8" textAnchor="middle" className="font-mono">
                              {m}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* Legends */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                <span>实销结算期 (1-6月，各区域交付完成)</span>
                <div className="flex gap-4 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-indigo-500 inline-block rounded-full"></span> 历史实销
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 border-t border-dashed border-purple-400 inline-block"></span> 预测销量 ({trendScenario === 'neutral' ? '中性' : trendScenario === 'optimistic' ? '乐观' : '悲观'})
                  </span>
                </div>
                <span>智能预测阶段 (7-9月期)</span>
              </div>
            </div>

            {/* AI and Supply Chain Suggestions Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200/60">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-500" />
                  智能备货与经营行动预案建议 ({trendScenario === 'neutral' ? '中性预估' : trendScenario === 'optimistic' ? '乐观预估' : '悲观预估'})
                </h4>
                <div className="text-[10px] font-mono text-slate-500">
                  未来趋势增幅: <strong className={vehicleHistoryData[selectedVehicle].scenarios[trendScenario].percentage.includes('-') ? 'text-rose-500' : 'text-emerald-500'}>
                    {vehicleHistoryData[selectedVehicle].scenarios[trendScenario].percentage}
                  </strong>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  合理库存天数: <strong className="text-slate-800">{vehicleHistoryData[selectedVehicle].scenarios[trendScenario].coverage}</strong>
                </div>
              </div>

              {/* 3 Actions */}
              <div className="space-y-3.5 text-xs">
                {/* 1 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 font-mono">1</span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-800 block">工厂整车排产调控建议：</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {vehicleHistoryData[selectedVehicle].scenarios[trendScenario].production}
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 font-mono">2</span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-800 block">关键零部件采购/备货建议：</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {vehicleHistoryData[selectedVehicle].scenarios[trendScenario].parts}
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 font-mono">3</span>
                  <div className="space-y-0.5">
                    <strong className="text-slate-800 block">终端渠道销售与调拨决策：</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {vehicleHistoryData[selectedVehicle].scenarios[trendScenario].channel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
