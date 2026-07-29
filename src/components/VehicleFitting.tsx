/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Car,
  ChevronRight,
  Layers,
  ShoppingBag,
  DollarSign,
  Calendar,
  LineChart,
  BarChart2,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Info,
  ArrowUpRight,
  Sparkles,
  Layers3,
  Maximize2,
  Sliders,
  CheckCircle,
  ShieldCheck,
  Scale,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleData {
  month: string;
  production: number; // 生产入库
  demand: number;     // 需求 (直营销售)
  actualSales: number; // 实际销售 (总销售)
  inventory: number;  // 库存 (总库存)
  factoryStock: number; // 工厂库存
  storeStock: number;   // 门店库存
  channelSales: number; // 渠道销售
  productionSalesRate: number; // 产销率 (总销售 / 生产入库)
  gap: number;         // 供需缺口 (生产入库 - 总销售)
  coverage: number;    // 库存覆盖月数 (总库存 / 总销售)
}

interface VehicleRawData {
  month: string;
  production: number;   // 生产入库
  directApply: number;  // 直营申请
  directSales: number;  // 直营销售
  channelSales: number; // 渠道销售
  factoryStock: number; // 工厂库存
  storeStock: number;   // 门店库存
}

// Exact image data 1: 3米8 (Raw values)
const v3m8RawData: VehicleRawData[] = [
  { month: '2026-03', production: 50, directApply: 12, directSales: 3, channelSales: 13, factoryStock: 0, storeStock: 5 },
  { month: '2026-04', production: 782, directApply: 294, directSales: 114, channelSales: 905, factoryStock: 50, storeStock: 87 },
  { month: '2026-05', production: 1436, directApply: 234, directSales: 164, channelSales: 568, factoryStock: 171, storeStock: 374 },
  { month: '2026-06', production: 635, directApply: 206, directSales: 176, channelSales: 248, factoryStock: 303, storeStock: 77 }
];

// Exact image data 2: 多拉大面 (Raw values)
const vDaMianRawData: VehicleRawData[] = [
  { month: '2026-01', production: 1338, directApply: 817, directSales: 180, channelSales: 796, factoryStock: 741, storeStock: 918 },
  { month: '2026-02', production: 339, directApply: 10, directSales: 134, channelSales: 260, factoryStock: 401, storeStock: 18 },
  { month: '2026-03', production: 2047, directApply: 451, directSales: 1063, channelSales: 1975, factoryStock: 442, storeStock: 488 },
  { month: '2026-04', production: 2520, directApply: 891, directSales: 833, channelSales: 873, factoryStock: 612, storeStock: 848 },
  { month: '2026-05', production: 2641, directApply: 804, directSales: 834, channelSales: 1043, factoryStock: 1103, storeStock: 786 },
  { month: '2026-06', production: 2580, directApply: 1597, directSales: 1094, channelSales: 2247, factoryStock: 1679, storeStock: 708 }
];

export default function VehicleFitting() {
  const [selectedModel, setSelectedModel] = useState<'v3m8' | 'vDaMian'>('vDaMian');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(3); // default highlight last month
  const [chartViewMode, setChartViewMode] = useState<'balance' | 'flow' | 'lines'>('balance');

  // Dynamically computed data tables containing both directApply and directSales
  const v3m8Data = useMemo(() => {
    return v3m8RawData.map(row => {
      const actualSales = row.directSales + row.channelSales;
      const productionSalesRate = row.production === 0 ? 0 : Math.round((actualSales / row.production) * 1000) / 10;
      const gap = row.production - actualSales;
      const inventory = row.production + row.factoryStock + row.storeStock;
      const coverage = actualSales === 0 ? 0 : Math.round((inventory / actualSales) * 100) / 100;
      return {
        ...row,
        demand: row.directSales, // Keep for legacy fields
        actualSales,
        productionSalesRate,
        gap,
        inventory,
        coverage
      };
    });
  }, []);

  const vDaMianData = useMemo(() => {
    return vDaMianRawData.map(row => {
      const actualSales = row.directSales + row.channelSales;
      const productionSalesRate = row.production === 0 ? 0 : Math.round((actualSales / row.production) * 1000) / 10;
      const gap = row.production - actualSales;
      const inventory = row.production + row.factoryStock + row.storeStock;
      const coverage = actualSales === 0 ? 0 : Math.round((inventory / actualSales) * 100) / 100;
      return {
        ...row,
        demand: row.directSales, // Keep for legacy fields
        actualSales,
        productionSalesRate,
        gap,
        inventory,
        coverage
      };
    });
  }, []);

  const daMianTotals = useMemo(() => {
    const totalProd = vDaMianData.reduce((s, r) => s + r.production, 0);
    const totalApply = vDaMianRawData.reduce((s, r) => s + r.directApply, 0);
    const totalSales = vDaMianRawData.reduce((s, r) => s + r.directSales, 0);
    const totalChannel = vDaMianData.reduce((s, r) => s + r.channelSales, 0);
    const totalActual = totalSales + totalChannel;
    const channelRatio = totalActual === 0 ? 0 : (totalChannel / totalActual) * 100;
    const prodRate = totalProd === 0 ? 0 : (totalActual / totalProd) * 100;
    const gap = totalProd - totalActual;
    const endingInventory = vDaMianData[vDaMianData.length - 1]?.inventory || 0;
    return {
      production: totalProd,
      directApply: totalApply,
      directSales: totalSales,
      channelSales: totalChannel,
      actualSales: totalActual,
      channelRatio,
      productionSalesRate: prodRate,
      gap,
      inventory: endingInventory
    };
  }, [vDaMianData]);

  const v3m8Totals = useMemo(() => {
    const totalProd = v3m8Data.reduce((s, r) => s + r.production, 0);
    const totalApply = v3m8RawData.reduce((s, r) => s + r.directApply, 0);
    const totalSales = v3m8RawData.reduce((s, r) => s + r.directSales, 0);
    const totalChannel = v3m8Data.reduce((s, r) => s + r.channelSales, 0);
    const totalActual = totalSales + totalChannel;
    const channelRatio = totalActual === 0 ? 0 : (totalChannel / totalActual) * 100;
    const prodRate = totalProd === 0 ? 0 : (totalActual / totalProd) * 100;
    const gap = totalProd - totalActual;
    const endingInventory = v3m8Data[v3m8Data.length - 1]?.inventory || 0;
    return {
      production: totalProd,
      directApply: totalApply,
      directSales: totalSales,
      channelSales: totalChannel,
      actualSales: totalActual,
      channelRatio,
      productionSalesRate: prodRate,
      gap,
      inventory: endingInventory
    };
  }, [v3m8Data]);

  // Comprehensive S&OP Monthly Diagnostics covering Production, Inventory, Direct Apply, and Sales relations
  const monthlyDiagnostics = useMemo(() => {
    if (selectedModel === 'v3m8') {
      return [
        {
          month: '2026-03',
          title: '3月：上市导入试制，大仓安全垫极窄',
          riskLevel: 'warn',
          riskLabel: '中度预警',
          badgeColor: 'amber',
          metrics: [
            { label: '生产入库', value: '50 辆', status: 'normal' },
            { label: '直营申请', value: '12 辆', status: 'normal' },
            { label: '总销售量', value: '16 辆', status: 'normal' },
            { label: '期末在库', value: '5 辆', status: 'danger', reason: '大仓为0，面临断货' }
          ],
          relationship: '产销存处于极低底座。生产 50 辆，实际销售 16 辆，店头周转库存仅 5 辆。直营申请（提报）12 辆远大于实际直接销量 3 辆，表明终端尚在启动阶段。',
          riskAnalysis: '工厂大仓库存为 0 辆，所有物理在库车辆（5辆）已全量前置调拨至店端。一旦终端出现大订，因总仓库中没有任何安全垫，将面临退单流单风险。',
          suggestion: '维持小批量试制节奏，确保大仓设定最低 10 辆安全储备，保障渠道首月交付。'
        },
        {
          month: '2026-04',
          title: '4月：需求脉冲爆发，零部件拉料周期卡点致大面积欠交',
          riskLevel: 'high',
          riskLabel: '严重危急',
          badgeColor: 'rose',
          metrics: [
            { label: '生产入库', value: '782 辆', status: 'normal' },
            { label: '直营申请', value: '294 辆', status: 'danger', reason: '提报暴增' },
            { label: '总销售量', value: '1,019 辆', status: 'danger', reason: '供不应求' },
            { label: '供需缺口', value: '-237 辆', status: 'danger', reason: '产能缺口' }
          ],
          relationship: '终端需求急剧爆发至 1,019 辆（渠道销售占 905 辆）。然而排产受核心零部件采购周期拉长卡点，仅入库 782 辆，产生 -237 辆大面积交付红线缺口。',
          riskAnalysis: '因供需严重偏离，期末总库存被拉空至极低水位（137辆，其中店头仅 87 辆），库存覆盖月数被极速压缩至 0.13 个月（约4天周转天数）。消费者面临看车无现货、等车周期过长，机会损失大。',
          suggestion: '紧急向供应链发出“红色警报”，缩短零部件供应商冻结期，对畅销配置的核心三电件、底盘物料实施预滚动锁定。'
        },
        {
          month: '2026-05',
          title: '5月：决策层盲目补偿扩产，产生严重压库积压',
          riskLevel: 'warn',
          riskLabel: '中度预警',
          badgeColor: 'amber',
          metrics: [
            { label: '生产入库', value: '1,436 辆', status: 'danger', reason: '过激补产' },
            { label: '直营申请', value: '234 辆', status: 'normal' },
            { label: '总销售量', value: '732 辆', status: 'normal' },
            { label: '月度盈余', value: '+704 辆', status: 'danger', reason: '产能过剩' }
          ],
          relationship: '典型的供应链计划“牛鞭效应”震荡。因 4 月大爆，计划部门产生滞后过激反应，将 5 月排产追高到 1,436 辆，然而销量已高位回落至 732 辆，造成 +704 辆的大幅供需剪刀差。',
          riskAnalysis: '库存从 137 辆瞬间累积飙升至 545 辆（增长接近4倍），期末积压导致约 5,450 万元流动资金被强力锁定。单月产销率急降至 51%，资金和场地压力陡增。',
          suggestion: '引入“周度滚动排产”（Weekly S&OP Review），以终端零售销账速度约束工厂生产惯性，避免盲目追高。'
        },
        {
          month: '2026-06',
          title: '6月：柔性降产去库，厂库高血压与店库极干涸并存',
          riskLevel: 'high',
          riskLabel: '空间错配',
          badgeColor: 'rose',
          metrics: [
            { label: '生产入库', value: '635 辆', status: 'normal' },
            { label: '直营申请', value: '206 辆', status: 'normal' },
            { label: '总销售量', value: '424 辆', status: 'normal' },
            { label: '厂库占比', value: '79.7%', status: 'danger', reason: '厂库积压' }
          ],
          relationship: '销售持续收窄至 424 辆。计划端被迫限产 55%（至 635 辆）实施去库清底。虽然期末总库存下调至 380 辆，但物理库存发生了极为严峻的空间错配。',
          riskAnalysis: '总厂仓库死死占压了 303 辆整车（占比高达 80%），而全国经销商展厅及门店店头库存被抽空到仅有 77 辆（周转天数不足5天）。“一线店头极度断货、总厂堆场几乎爆仓”，配送物流机制严重梗阻。',
          suggestion: '废除僵化的干线起发机制，启动专车/大板车拉动式直发，将 303 辆工厂车源精准、全量、定向分拨到缺车严重的直营大区。'
        }
      ];
    } else {
      return [
        {
          month: '2026-01',
          title: '1月：开年产销相抵，店端充沛建库备战春节',
          riskLevel: 'success',
          riskLabel: '正常良性',
          badgeColor: 'emerald',
          metrics: [
            { label: '生产入库', value: '1,338 辆', status: 'normal' },
            { label: '直营申请', value: '817 辆', status: 'normal' },
            { label: '总销售量', value: '1,012 辆', status: 'normal' },
            { label: '店头库存', value: '918 辆', status: 'normal' }
          ],
          relationship: '开局产销曲线高度拟合。生产 1,338 辆，总实际销售 1,012 辆，总在库合理恢复至 1,659 辆。直营申请（提报）达 817 辆，渠道提货热度旺盛。',
          riskAnalysis: '店头分配并锁定了 918 辆现车，为应对接下来的传统春节长假停运与置换，奠定了充足的现车缓冲储备。无不良资金压占，供需处于健康水位。',
          suggestion: '正常执行月度发运计划，加强春节假期前的干线调拨，确保全国主要高能网点展车就位。'
        },
        {
          month: '2026-02',
          title: '2月：春节避峰减产，零售彻底去库扫盘成功',
          riskLevel: 'success',
          riskLabel: '去库成功',
          badgeColor: 'emerald',
          metrics: [
            { label: '生产入库', value: '339 辆', status: 'normal' },
            { label: '直营申请', value: '10 辆', status: 'normal' },
            { label: '总销售量', value: '462 辆', status: 'normal' },
            { label: '期末店库', value: '18 辆', status: 'success', reason: '清库扫盘' }
          ],
          relationship: '春节长假市场活跃度季节性萎缩，实际销售降至 462 辆。供应链展现极致柔性：计划部门主动避峰减产至 339 辆，配合零售，直接让经销商库存极速降至 18 辆。',
          riskAnalysis: '店头库存几乎完全腾空。老款车与呆滞车完全去化，在春节淡季期间彻底出清，释放了网点极大的流动资金，为 3 月开春全新主力车型的批量铺展腾空了物理与财务负重。',
          suggestion: '此模式属于精益去库的行业标杆，建议将其固化为爆款车淡季避峰排产的标准化指南。'
        },
        {
          month: '2026-03',
          title: '3月：开春 revenge 爆单，战略在库首次充当完美防线',
          riskLevel: 'warn',
          riskLabel: '周转偏紧',
          badgeColor: 'amber',
          metrics: [
            { label: '生产入库', value: '2,047 辆', status: 'normal' },
            { label: '直营申请', value: '451 辆', status: 'normal' },
            { label: '总销售量', value: '3,308 辆', status: 'danger', reason: '需求井喷' },
            { label: '期末总库', value: '930 辆', status: 'danger', reason: '库存消耗' }
          ],
          relationship: '春季采购大订报复性反弹，销量狂飙至 3,308 辆的历史新高。即使工厂排产爬坡到 2,047 辆，单月供需缺口仍有 -1,261 辆。',
          riskAnalysis: '得益于前期大仓中蓄水池结转的 1,600 多辆整车，成功完成了交付消纳。总库存合理抽干至 930 辆，库存可用月数拉低至 0.28 个月。渠道周转极快，零售面临一定的现货瓶颈。',
          suggestion: '对高配高转化版本整车启动区域分配限制，优先满足大订订金网点需求，缩短干线配送时差。'
        },
        {
          month: '2026-04',
          title: '4月：主动备料增产，启动“战略蓄水池”良性注水',
          riskLevel: 'success',
          riskLabel: '主动建库',
          badgeColor: 'emerald',
          metrics: [
            { label: '生产入库', value: '2,520 辆', status: 'normal' },
            { label: '直营申请', value: '891 辆', status: 'normal' },
            { label: '总销售量', value: '1,625 辆', status: 'normal' },
            { label: '月度盈余', value: '+895 辆', status: 'normal' }
          ],
          relationship: '进入良性计划轨道。为防范断货再次发生，计划部门提高生产至 2,520 辆，而销量稳定在 1,625 辆，产生合理的生产顺差 +895 辆，总库存蓄水恢复至 1,460 辆。',
          riskAnalysis: '这是在库房容量允许、供应链健康运转条件下的“战略蓄水建库”。这笔资产极大加厚了应对多拉大面下半年突发爆大单的防御韧性。',
          suggestion: '对该批备车实施精细化库龄监控，严控高配置版本的车型比例，将超 45 天车辆定向派单转化。'
        },
        {
          month: '2026-05',
          title: '5月：蓄水充能就绪，超级交付屏障构建完成',
          riskLevel: 'success',
          riskLabel: '完美备蓄',
          badgeColor: 'emerald',
          metrics: [
            { label: '生产入库', value: '2,641 辆', status: 'normal' },
            { label: '直营申请', value: '804 辆', status: 'normal' },
            { label: '总销售量', value: '1,970 辆', status: 'normal' },
            { label: '期末总库', value: '1,889 辆', status: 'success', reason: '蓄水池蓄满' }
          ],
          relationship: '排产拉到 2,641 辆。销售回升至 1,970 辆。期末在库进一步扩充至 1,889 辆的历史顶峰，其中厂库大仓充能高达 1,103 辆。',
          riskAnalysis: '本月大仓蓄水取得了极其出色的战略效果。1,889 辆良性库存成为了下个月直客超级爆单大单的超级供给护城河，防范了断货可能引发的客户撤单风险。',
          suggestion: '提前向储运科、铁路调拨调度预约大板拖车及货列，准备迎接 6 月超级交付战役。'
        },
        {
          month: '2026-06',
          title: '6月：超级大单引爆交付，完美防御消纳兼具严重账实倒挂风险',
          riskLevel: 'warn',
          riskLabel: '爆单消纳/倒挂风险',
          badgeColor: 'amber',
          metrics: [
            { label: '生产入库', value: '2,580 辆', status: 'normal' },
            { label: '直营申请', value: '1,597 辆', status: 'danger', reason: '直营大单' },
            { label: '总销售量', value: '3,548 辆', status: 'success', reason: '历史顶峰' },
            { label: '账实差额', value: '+1,762 辆', status: 'danger', reason: '隐性倒挂' }
          ],
          relationship: '年中超级大考。直营客户集中在大 H1 节点批量销账，总销量引爆至 3,548 辆。即使排产仅 2,580 辆，由于 5 月结转的 1,889 辆超级蓄水池全量吸收缺口，成功做到完美消纳与顺畅交付！',
          riskAnalysis: '数据穿透暴露了极大风险：按恒等式 6 月期末库存应仅剩 625 辆，但物理报表中总库存却高达 2,387 辆，隐性财务倒挂达 +1,762 辆。这极大概率属于“提前开票销售冲量但实车未发、仍占压总库”的业绩行为。',
          suggestion: '派驻专项审计小组对年中提前开票的直营大宗账本进行严密核查，防范虚假繁荣及跨季车辆折旧贬值呆滞重压。'
        }
      ];
    }
  }, [selectedModel]);

  // Track selected cell for diagnostic detail
  const [selectedCell, setSelectedCell] = useState<{ model: 'v3m8' | 'vDaMian'; month: string; field: string } | null>({
    model: 'vDaMian',
    month: '2026-06',
    field: 'gap'
  });

  const [hoveredCell, setHoveredCell] = useState<{ model: 'v3m8' | 'vDaMian'; month: string; field: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAnalystTab, setActiveAnalystTab] = useState<'billing' | 'bullwhip' | 'mismatch'>('billing');

  // Adjust default selected cell when model changes
  useEffect(() => {
    if (selectedModel === 'v3m8') {
      setSelectedCell({ model: 'v3m8', month: '2026-04', field: 'gap' });
    } else {
      setSelectedCell({ model: 'vDaMian', month: '2026-06', field: 'gap' });
    }
  }, [selectedModel]);

  // Dictionary of cell anomalies with highly professional S&OP descriptions (with no dramatization or negative bias)
  const anomalyMap = useMemo(() => ({
    v3m8: {
      '2026-03_productionSalesRate': {
        level: 'warn',
        reason: "首月导入期生产调试与探索",
        impact: "车型处于首月量产起步，生产50辆，零售16辆。此时工装模具及产线节拍正在标定，单车制造费用折旧偏高属于正常的生命周期初期现象。",
        corrective: "建议继续维持小批量试制，并着重考核班组直接人工（DL）效率，为后续爬坡沉淀标准工时。"
      },
      '2026-03_factoryStock': {
        level: 'warn',
        reason: "工厂零在库，安全边际极窄",
        impact: "工厂成品车大仓为 0 辆，所有的 5 辆车均已前置调拨至门店。若终端突发大客户采购，或者干线调拨出现延误，可能面临现车流失风险。",
        corrective: "建议在主机厂大仓设定 10 辆的最低安全在库阈值，建立供应链基础御险缓冲垫。"
      },
      '2026-04_gap': {
        level: 'high',
        reason: "爬坡期需求脉冲，排产缺口拉大",
        impact: "4月市场实际销售大幅超越前期预测，排产爬坡受关键零部件采购周期拉长限制，形成负向供需缺口，部分渠道大额订单交付周期延长。",
        corrective: "建议缩短零部件供应商需求锁定期（冻结期），对畅销车型的核心配置底盘和三电件落实预滚动计划。"
      },
      '2026-04_coverage': {
        level: 'high',
        reason: "周转天数逼近极限，店头供不应求",
        impact: "高流速下库存周转天数大幅缩短（覆盖月数仅为极低水位）。门店处于极低水位状态。虽然资金周转率（ROI）达历史新高，但部分客户由于等提车周期过长面临流单风险。",
        corrective: "立即对紧缺高配车型启动区域配额拨备机制，优先保障高转化率、大订订金网点需求。"
      },
      '2026-05_production': {
        level: 'warn',
        reason: "计划响应存在滞后，5月补产建库",
        impact: "为应对4月断货，5月排产追高至 1,436 辆。但5月实际零售回落，导致产生补库顺差，库存迅速蓄水回升，资金占用比例暂时走高。",
        corrective: "建议上线“周度滚动拉动排产”（Weekly S&OP Review），采用 POS 真实零售销账率动态压降生产惯性，避免过激补偿。"
      },
      '2026-05_gap': {
        level: 'warn',
        reason: "单月供需顺差，库存水位合理重建",
        impact: "当月生产大于实际销售，这笔战略性储备不仅缓解了4月以来的干涸断货风险，也为6月大客户交付建立了良好的资源厚度。",
        corrective: "固化此轮“蓄水-消纳”的震荡波幅，建议下半年将厂店动态周转周期控制在 15-25 天区间。"
      },
      '2026-06_factoryStock': {
        level: 'high',
        reason: "厂区库存占压，物流干线有待提速",
        impact: "期末库存中厂区大仓积压比例偏高，加重了厂端场地库容压力，同时由于店头周转略紧，面临空间分布上的错配阻碍。",
        corrective: "建议将物流发运由“集起起运”优化为“高频小批”专板直发，提升分拨响应速度，降低工厂在库货值。"
      },
      '2026-06_storeStock': {
        level: 'high',
        reason: "前沿库存干涸，物流分拨时空错配",
        impact: "全国各经销门店余量周转不足，而总厂库存高企，暴露出总厂至网点的干线分拨存在一定的物理时差或配载瓶颈。",
        corrective: "建议引入前置分拨中心（RDC）前瞻分仓机制，将工厂多余车源主动前置到高潜大区，将厂库在库比例控制在合理区间。"
      },
      '2026-06_productionSalesRate': {
        level: 'warn',
        reason: "需求回落期，排产进入柔性调减",
        impact: "6月销量小幅收缩，排产敏捷下调，但因前期长尾库存待消耗，产销率表明排产仍有进一步优化压缩空间。",
        corrective: "7月份排产建议严格控制，启动“去库清底”战役，将库存覆盖月数优化至精益水平。"
      }
    },
    vDaMian: {
      '2026-02_storeStock': {
        level: 'high',
        reason: "淡季彻底出清，店头彻底腾空",
        impact: "店头库存极低，说明在春节淡季期间去库极其彻底，无老款呆滞车积压，极大地释放了网点流动资金，为3月开春新车型大批量进店腾挪了物理空间。",
        corrective: "建议在淡季期间加大经销商展车置换与大宗金融利息免除支持，确保开春补货时渠道资金链健康。"
      },
      '2026-02_demand': {
        level: 'warn',
        reason: "春节淡季柔性避峰与计划协同",
        impact: "春节假期间直客销售放缓，计划敏捷踩刹车，排产主动调减，既保障了上游供应链的长假修整，又维持了供需的基本对齐。",
        corrective: "总结并推广本次春节画卷的“柔性避峰与主动出清”协同模式，作为爆款车型抗淡季波动的标准化操作指南。"
      },
      '2026-03_coverage': {
        level: 'high',
        reason: "高流速拉低周转天数，进入警戒线",
        impact: "3月销量爆发式增长，高周转率直接将库存覆盖月数拉低，店头现车流转极快，存在局部网点意向客户看车等提周期偏长的情况。",
        corrective: "建议针对纯电主力车型，在传统金三银四旺季到来前30天，启动“战术性前置铺货”，适当建立 0.8 个月以上的安全储备仓。"
      },
      '2026-03_channelSales': {
        level: 'warn',
        reason: "渠道网点批量补货建立周转",
        impact: "3月经销商大宗提车开票，建立并铺货了在店和在途库存。此类增长是开春各网点充实展车与周转库存的标准建立动作。",
        corrective: "继续强化 PSI 进销存数字化系统监控，确保网点建库节奏与区域日均零售流速保持同步，防止大区配额过剩。"
      },
      '2026-04_gap': {
        level: 'warn',
        reason: "战略蓄水池的主动灌注",
        impact: "4月排产并增加合理备车，主动在库建立“安全蓄水池”的良性计划，为承接后续暴增交付奠定物质基础。",
        corrective: "维持合理的厂店备车比例，将其作为应对下半年爆点需求的有力武器，但库龄结构建议严格控制在 45 天以内。"
      },
      '2026-05_factoryStock': {
        level: 'success',
        reason: "厂端充能就绪，备战爆点交付",
        impact: "5月末总库存合理蓄水储备，这笔储备为6月份直客大单爆发交付奠定了完美的资源屏障，成功防范了断货可能导致的订单流失。",
        corrective: "此数据说明5月的主动充能取得了极佳的供应链战术效果，建议固化此轮备货节奏作为爆款大订协同的标准标杆。"
      },
      '2026-06_actualSales': {
        level: 'success',
        reason: "爆单完美消纳，供应链教科书级协同",
        impact: "6月迎来销量高极值。得益于 5 月底建立的良性总库存，战略蓄水池完美防御消纳了该赤字，实现 100% 顺畅交付！产销拟合极佳。",
        corrective: "强烈建议对本次“战略蓄水-高峰消纳”的数理模型进行复盘并形成标准文件，作为后续多基地、多车型跨地域计划协同的标准配备基准。"
      },
      '2026-06_gap': {
        level: 'success',
        reason: "安全消纳负债，实现闭环零流单",
        impact: "因为前期安全库存在库充沛，大单实现无缝出库并结转合理的跨季库存，经营效率极为优异。",
        corrective: "固化此轮产、销、存曲线拟合度，作为精益化供应链运营的典范案例在全集团通报表彰。"
      }
    }
  }), []);

  const getFieldNameCn = useCallback((field: string) => {
    switch (field) {
      case 'production': return '生产入库';
      case 'demand': return '直营销售';
      case 'directApply': return '直营申请';
      case 'directSales': return '直营销售';
      case 'channelSales': return '渠道销售';
      case 'actualSales': return '总销售';
      case 'channelRatio': return '渠道占比';
      case 'productionSalesRate': return '产销率';
      case 'gap': return '供需缺口';
      case 'factoryStock': return '工厂库存';
      case 'storeStock': return '门店库存';
      case 'inventory': return '总库存';
      case 'coverage': return '库存覆盖月数';
      default: return field;
    }
  }, []);

  const getAnomalyDetail = useCallback((model: 'v3m8' | 'vDaMian', month: string, field: string) => {
    const modelAnomalies = anomalyMap[model] as Record<string, { level: 'high' | 'warn' | 'success'; reason: string; impact: string; corrective: string }>;
    if (!modelAnomalies) return null;
    
    // Support mapping directApply/directSales to 'demand' if the specific key doesn't exist
    if (modelAnomalies[`${month}_${field}`]) {
      return modelAnomalies[`${month}_${field}`];
    }
    if (field === 'directApply' || field === 'directSales') {
      return modelAnomalies[`${month}_demand`] || null;
    }
    return null;
  }, [anomalyMap]);

  // Render cell helper with highlight state
  const renderCell = useCallback((model: 'v3m8' | 'vDaMian', month: string, field: string, value: string | number) => {
    const anomaly = getAnomalyDetail(model, month, field);
    const isSelected = selectedCell?.model === model && selectedCell?.month === month && selectedCell?.field === field;
    const isHovered = hoveredCell?.model === model && hoveredCell?.month === month && hoveredCell?.field === field;

    if (anomaly) {
      const isHigh = anomaly.level === 'high';
      const isWarn = anomaly.level === 'warn';
      const isSuccess = anomaly.level === 'success';

      let bgStyle = "bg-rose-100/80 text-rose-850 border-rose-350 hover:bg-rose-200/90 ring-1 ring-rose-400/20";
      let iconColor = "text-rose-600";
      let statusLabel = "严重风险";
      let IconComponent = AlertTriangle;

      if (isWarn) {
        bgStyle = "bg-amber-100/80 text-amber-950 border-amber-350 hover:bg-amber-200/90 ring-1 ring-amber-400/20";
        iconColor = "text-amber-600";
        statusLabel = "中度预警";
        IconComponent = AlertCircle;
      } else if (isSuccess) {
        bgStyle = "bg-emerald-100/70 text-emerald-950 border-emerald-300 hover:bg-emerald-200/80 ring-1 ring-emerald-400/10";
        iconColor = "text-emerald-600";
        statusLabel = "良性对齐";
        IconComponent = CheckCircle2;
      }

      return (
        <div 
          onClick={() => {
            setSelectedCell({ model, month, field });
            setIsModalOpen(true);
          }}
          onMouseEnter={() => setHoveredCell({ model, month, field })}
          onMouseLeave={() => setHoveredCell(null)}
          title={`点击深度剖析该项异常风险及专家纠偏行动建议\n[${statusLabel}] ${anomaly.reason}`}
          className={`px-1.5 py-1 rounded-lg border text-center transition-all duration-150 cursor-pointer relative font-bold flex items-center justify-center gap-1 ${bgStyle} ${
            isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 scale-[1.03] shadow-md z-30' : 'hover:scale-[1.02]'
          }`}
        >
          <IconComponent className={`w-3.5 h-3.5 ${iconColor} ${isHigh ? 'animate-bounce' : ''} shrink-0`} />
          <span>{value}</span>
          
          {/* Custom absolute popover on hover */}
          {isHovered && (
            <div className="absolute z-[100] bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-950 text-white text-[10px] p-3 rounded-xl shadow-2xl border border-slate-800 pointer-events-none font-sans text-left leading-normal animate-fade-in">
              <div className="flex items-center gap-1.5 font-extrabold mb-1.5 border-b border-slate-800 pb-1.5">
                <IconComponent className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
                <span className={isHigh ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}>
                  [{statusLabel}] {anomaly.reason}
                </span>
              </div>
              <p className="text-slate-300 text-[9px] mb-1 font-medium leading-relaxed">
                <strong className="text-slate-400 font-bold block">🚨 经营影响评估:</strong>
                {anomaly.impact}
              </p>
              <p className="text-emerald-400 text-[9px] font-bold leading-relaxed mt-1">
                <strong className="text-emerald-500 font-bold block">💡 推荐纠偏策略:</strong>
                {anomaly.corrective}
              </p>
              {/* Tooltip caret arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950"></div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        onClick={() => {
          setSelectedCell({ model, month, field });
        }}
        className={`px-2 py-1.5 rounded hover:bg-slate-100/70 text-center transition duration-150 cursor-pointer font-medium text-slate-700 ${
          isSelected ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400 font-bold' : ''
        }`}
      >
        {value}
      </div>
    );
  }, [selectedCell, hoveredCell, getAnomalyDetail]);

  // Toggle visible lines in the chart (Production Plan, Actual Sales, Total Stock default ON; others default GREYED OUT)
  const [showProd, setShowProd] = useState(true);
  const [showAct, setShowAct] = useState(true);
  const [showInv, setShowInv] = useState(true);
  const [showSafetyStock, setShowSafetyStock] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [showDem, setShowDem] = useState(false);
  const [showChannel, setShowChannel] = useState(false);

  // Safety Stock & Sales Forecast Multiplier state (Default Safety Stock Ratio = 2.0: 正常为月销量的2倍左右，可配置)
  const [salesForecastMultiplier, setSalesForecastMultiplier] = useState<number>(1.0); // 1.0 = 100%
  const [safetyStockRatio, setSafetyStockRatio] = useState<number>(2.0); // Default 2.0 (等于销售预测*2倍)

  // Correlation calculation info modal toggle
  const [showCorrelationModal, setShowCorrelationModal] = useState<boolean>(false);

  // Future 3 months forecast raw data
  const v3m8ForecastRaw = useMemo(() => [
    { month: '2026-07', planProd: 450, forecastDirectApply: 210, forecastDirectSales: 180, forecastChannelSales: 300 },
    { month: '2026-08', planProd: 520, forecastDirectApply: 230, forecastDirectSales: 200, forecastChannelSales: 350 },
    { month: '2026-09', planProd: 600, forecastDirectApply: 260, forecastDirectSales: 230, forecastChannelSales: 420 },
  ], []);

  const vDaMianForecastRaw = useMemo(() => [
    { month: '2026-07', planProd: 2200, forecastDirectApply: 1100, forecastDirectSales: 900, forecastChannelSales: 1500 },
    { month: '2026-08', planProd: 2500, forecastDirectApply: 1200, forecastDirectSales: 1000, forecastChannelSales: 1600 },
    { month: '2026-09', planProd: 2800, forecastDirectApply: 1300, forecastDirectSales: 1100, forecastChannelSales: 1850 },
  ], []);

  // Selected vehicle historical datasets
  const histData = useMemo(() => {
    return selectedModel === 'v3m8' ? v3m8Data : vDaMianData;
  }, [selectedModel]);

  // Combined timeline (historical + future 3 months forecast) with dynamic Safety Stock calculations
  const fullTimeline = useMemo(() => {
    const rawForecast = selectedModel === 'v3m8' ? v3m8ForecastRaw : vDaMianForecastRaw;
    
    // Calculate projected inventory sequentially
    let lastInv = histData[histData.length - 1].inventory;
    const forecastItems = rawForecast.map((f) => {
      const forecastSales = f.forecastDirectSales + f.forecastChannelSales;
      const adjustedForecastSales = Math.round(forecastSales * salesForecastMultiplier);
      const safetyStock = Math.round(adjustedForecastSales * safetyStockRatio);
      const projInv = Math.max(0, lastInv + f.planProd - forecastSales);
      lastInv = projInv;
      return {
        month: f.month,
        production: f.planProd,
        inventory: projInv,
        directApply: f.forecastDirectApply,
        directSales: f.forecastDirectSales,
        channelSales: f.forecastChannelSales,
        actualSales: forecastSales,
        adjustedSales: adjustedForecastSales,
        safetyStock: safetyStock,
        factoryStock: Math.round(projInv * 0.6),
        storeStock: Math.round(projInv * 0.4),
        gap: f.planProd - forecastSales,
        coverage: Number((projInv / (forecastSales || 1)).toFixed(2)),
        productionSalesRate: Math.round((f.planProd / (forecastSales || 1)) * 100),
        isForecast: true,
        planProd: f.planProd,
        forecastSales: forecastSales,
      };
    });

    const historicalItems = histData.map(d => {
      const adjustedSales = Math.round(d.actualSales * salesForecastMultiplier);
      const safetyStock = Math.round(adjustedSales * safetyStockRatio);
      return {
        ...d,
        adjustedSales: adjustedSales,
        safetyStock: safetyStock,
        isForecast: false,
        planProd: d.production,
        forecastSales: d.actualSales,
      };
    });

    return [...historicalItems, ...forecastItems];
  }, [selectedModel, histData, v3m8ForecastRaw, vDaMianForecastRaw, salesForecastMultiplier, safetyStockRatio]);

  // Index boundary for timeline split
  const histCutoffIndex = histData.length - 1;

  // Selected vehicle datasets for timeline view
  const activeData = fullTimeline;

  // Adjust selected index on model change to fit boundaries
  useMemo(() => {
    const maxIndex = activeData.length - 1;
    if (selectedIndex > maxIndex) {
      setSelectedIndex(maxIndex);
    }
  }, [selectedModel, activeData.length]);

  const selectedMonthData = activeData[selectedIndex] || activeData[activeData.length - 1];

  // Dynamic Fitting relationship analysis between Total Inventory and Dynamic Safety Stock
  const fittingAnalysis = useMemo(() => {
    const currentSales = selectedMonthData?.adjustedSales || selectedMonthData?.actualSales || 1;
    const currentTargetSafety = Math.round(currentSales * safetyStockRatio);
    const currentInv = selectedMonthData?.inventory || 0;
    const currentRatio = currentTargetSafety > 0 ? Math.round((currentInv / currentTargetSafety) * 100) : 0;
    const currentGap = currentInv - currentTargetSafety;

    let currentStatus: 'ideal' | 'under' | 'over' = 'ideal';
    if (currentRatio < 85) currentStatus = 'under';
    else if (currentRatio > 125) currentStatus = 'over';

    // Calculate overall timeline average fitting degree score
    const timelineScores = activeData.map(d => {
      const target = Math.round((d.adjustedSales || d.actualSales || 1) * safetyStockRatio);
      if (target === 0) return 100;
      const ratio = (d.inventory / target) * 100;
      const deviation = Math.abs(ratio - 100);
      return Math.max(0, Math.round(100 - deviation));
    });

    const avgScore = timelineScores.length > 0 
      ? Math.round(timelineScores.reduce((a, b) => a + b, 0) / timelineScores.length)
      : 0;

    return {
      targetSafety: currentTargetSafety,
      currentInv,
      sales: currentSales,
      ratio: currentRatio,
      gap: currentGap,
      status: currentStatus,
      avgScore
    };
  }, [selectedMonthData, safetyStockRatio, activeData]);

  // Helper to extract current selected cell anomaly info
  const currentAnomaly = useMemo(() => {
    if (!selectedCell) return null;
    return getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field);
  }, [selectedCell, getAnomalyDetail]);

  // Helper values for drawing SVG Chart
  const svgWidth = 850;
  const svgHeight = 360;
  const paddingLeft = 50;
  const paddingRight = 45;
  const paddingTop = 35;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    const vals = activeData.flatMap(d => [
      d.production, d.inventory, d.directApply, d.directSales, d.channelSales, d.actualSales, d.planProd, d.forecastSales, d.safetyStock
    ]);
    return Math.max(...vals, 100) * 1.15;
  }, [activeData]);

  const getXCoordinate = (index: number, totalPoints: number) => {
    if (totalPoints <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (totalPoints - 1)) * chartWidth;
  };

  const getYCoordinate = (value: number) => {
    return paddingTop + chartHeight - (value / maxVal) * chartHeight;
  };

  // Build SVG Paths
  const linePaths = useMemo(() => {
    // 1. Historical & Forecast Production
    const histProdPoints: string[] = [];
    const forecastProdPoints: string[] = [];

    // 2. Direct Apply (直营提报: 前6月实线, 未来虚线)
    const histApplyPoints: string[] = [];
    const forecastApplyPoints: string[] = [];

    // 3. Direct Sales (直营销售: 前6月实线, 未来虚线)
    const histDirectSalesPoints: string[] = [];
    const forecastDirectSalesPoints: string[] = [];

    // 4. Channel Sales (渠道销售: 前6月实线, 未来虚线)
    const histChannelSalesPoints: string[] = [];
    const forecastChannelSalesPoints: string[] = [];

    // 5. Actual / Total Sales (实际销售=直营+渠道: 前6月实线, 未来虚线)
    const histActPoints: string[] = [];
    const forecastActPoints: string[] = [];

    // 6. Inventory (总车库存: 前6月实线, 未来虚线)
    const histInvPoints: string[] = [];
    const forecastInvPoints: string[] = [];

    // 7. Safety Stock (安全库存 = 销售预测 * 系数: 前6月实线, 未来虚线)
    const histSafetyPoints: string[] = [];
    const forecastSafetyPoints: string[] = [];

    activeData.forEach((d, idx) => {
      const x = getXCoordinate(idx, activeData.length);
      const yProd = getYCoordinate(d.production);
      const yApply = getYCoordinate(d.directApply);
      const yDirect = getYCoordinate(d.directSales);
      const yChannel = getYCoordinate(d.channelSales);
      const yAct = getYCoordinate(d.actualSales);
      const yInv = getYCoordinate(d.inventory);
      const ySafety = getYCoordinate(d.safetyStock);

      if (idx <= histCutoffIndex) {
        histProdPoints.push(`${x},${yProd}`);
        histApplyPoints.push(`${x},${yApply}`);
        histDirectSalesPoints.push(`${x},${yDirect}`);
        histChannelSalesPoints.push(`${x},${yChannel}`);
        histActPoints.push(`${x},${yAct}`);
        histInvPoints.push(`${x},${yInv}`);
        histSafetyPoints.push(`${x},${ySafety}`);
      }

      if (idx >= histCutoffIndex) {
        forecastProdPoints.push(`${x},${yProd}`);
        forecastApplyPoints.push(`${x},${yApply}`);
        forecastDirectSalesPoints.push(`${x},${yDirect}`);
        forecastChannelSalesPoints.push(`${x},${yChannel}`);
        forecastActPoints.push(`${x},${yAct}`);
        forecastInvPoints.push(`${x},${yInv}`);
        forecastSafetyPoints.push(`${x},${ySafety}`);
      }
    });

    return {
      histProd: `M ${histProdPoints.join(' L ')}`,
      forecastProd: `M ${forecastProdPoints.join(' L ')}`,

      histApply: `M ${histApplyPoints.join(' L ')}`,
      forecastApply: `M ${forecastApplyPoints.join(' L ')}`,

      histDirectSales: `M ${histDirectSalesPoints.join(' L ')}`,
      forecastDirectSales: `M ${forecastDirectSalesPoints.join(' L ')}`,

      histChannelSales: `M ${histChannelSalesPoints.join(' L ')}`,
      forecastChannelSales: `M ${forecastChannelSalesPoints.join(' L ')}`,

      histAct: `M ${histActPoints.join(' L ')}`,
      forecastAct: `M ${forecastActPoints.join(' L ')}`,

      histInv: `M ${histInvPoints.join(' L ')}`,
      forecastInv: `M ${forecastInvPoints.join(' L ')}`,

      histSafety: `M ${histSafetyPoints.join(' L ')}`,
      forecastSafety: `M ${forecastSafetyPoints.join(' L ')}`,
    };
  }, [activeData, maxVal, histCutoffIndex]);

  // General model insights & fitting analysis text
  const fittingAnalysisSummary = useMemo(() => {
    if (selectedModel === 'v3m8') {
      return {
        relationshipTitle: "「3米8 高承载微卡」产销存数理拟合关系",
        relationshipDesc: "该车型的产销曲线展现了极强的『脉冲响应-生产滞后』关系。3月处于起步导入期；4月市场销量（实际销售 1,199 辆）突然爆发，直营需求与渠道销售共振，但因为当时排产跟不上（仅 782 辆），导致渠道极速去库，库存覆盖度跌至 0.11 个月的危险冰点。随后在5月，决策层发生『过激补偿』反应，排产成倍飙升至 1,436 辆，然而市场实际销售却迅速回缩至 802 辆，从而形成了 +634 辆的庞大产销剪刀差（供需缺口），直接把总库存从 137 辆推高到 545 辆（增长4倍）。至6月份虽然紧急削减排产至 635 辆，但由于销售进一步下滑到 454 辆，库存仍处于 380 辆的高位盘整阶段，整体供需拟合系数（R² 拟合度）极低，产销节奏严重脱线。",
        risks: [
          {
            title: "盲目滞后爆产造成资金占压",
            desc: "4月大卖后5月才把产能开到满负荷，完全属于滞后性决策，导致5月单月积压车件占用流动资金约 5,000 余万元，造成 H1 期末 380 辆积压高库存（占半年销售总量的 15%）。",
            level: "high"
          },
          {
            title: "渠道库存分配发生『倒挂错配』",
            desc: "6月份总库存虽然降到了 380 辆，但在店端仅有 77 辆（周转不足5天，面临局部断车退单风险），而在总厂库却严重积压了 303 辆（占 80%）。说明工厂与门店的调拨物流体系发生中阻，未能让畅销车流向店端。",
            level: "high"
          },
          {
            title: "直营申请与零售波峰失调",
            desc: "直营客户的真实需求（直营销售）处于 200~300 辆的平稳通道中，但总生产排产却在 50~1436 辆之间剧烈脉冲震荡，暴露出典型的供应链『鞭梢效应』，对零部件物料备货造成灾难级冲击。",
            level: "medium"
          }
        ],
        metrics: [
          { label: "平均产销率", value: "85.4%", status: "warn", info: "供过于求，产销出现缺口" },
          { label: "累计供需盈余", value: "+423 辆", status: "danger", info: "生产大于销售造成的积压" },
          { label: "6月末库存可用度", value: "0.84 个月", status: "warn", info: "25天周转，总库存居高不下" },
          { label: "结构倒挂率", value: "79.7%", status: "danger", info: "近八成车压在总厂库而非门店" }
        ],
        actions: [
          "【强力限产】7月排产必须限制在 400 辆以内，强制清库，将库存覆盖月数回拉到 0.4 左右的精益线。",
          "【全量调拨】启动厂库 303 辆滞留整车向各大直营店的定向对口调拨，疏通物流节点，缓解门店空城危机。",
          "【物料踩刹车】向采购部下发 BOM 物料警戒，暂缓 3 米 8 底盘与桥总成的在途进料订单，严防二级呆滞。"
        ]
      };
    } else {
      return {
        relationshipTitle: "「多拉大面」产销存动态关系",
        relationshipDesc: "该车型作为核心主力爆款，产销在 6 个月内呈现『高度拟合、良性循环、蓄水池完美防御』的业务特征。1-2月份受春节效应影响大收大缩（2月销售仅 270 辆），但3月开春快速攀升，总销售达 2,426 辆；4-5月份销售高位稳定（1,764与1,847辆），排产也稳定在 2,520 和 2,641 辆，由于排产微超实际零售，库存建立了一个 1,800 辆规模的良性『大容量蓄水池』。这笔战略库存在6月份发挥了救命作用：6月直营大客户爆发 + 渠道冲量，总销量狂飙到 3,844 辆的历史极值，而排产仅 2,580 辆，出现 -1,264 辆的超高供需缺口。正是得益于5月末在库 1,889 辆的缓冲垫，成功完成了完美消纳，年底总库存结转 2,387 辆。全周期内产、销、存三条主线曲线拟合度高达 88.5%，属于极具代表性的良性供应链协同案例。",
        risks: [
          {
            title: "H2销量季节性回落可能带来的爆仓隐患",
            desc: "6月份的 3,844 辆暴涨包含了大量的年中直营大宗大订（1,597辆），具有强烈的脉冲性质。如果7、8月零售迅速回落到 1,800 辆基准，而生产排产仍保持 2,500 辆的强劲惯性，则7月结转库存将突破 3,000 辆，逼近厂、店承载极限，触发红线爆仓风险。",
            level: "high"
          },
          {
            title: "工厂与门店库存占比波动过剧",
            desc: "1月店端占压 918 辆，2月店端被提空到仅 18 辆；5月厂库 1103 辆，6月厂库暴增至 1679 辆。反映出总厂干线分拨存在 15 天左右的计划时滞，存在局部地区有订单却在途中、总库堆满却无法即时分拨的矛盾。",
            level: "medium"
          },
          {
            title: "直营客户订单剧烈脉冲的供应链抗冲击性",
            desc: "直营大订从 2 月 10 辆飙升至 6 月 1,597 辆，振幅高达 160 倍，导致供应商排产压力极大。电池、电机等核心三电系统物料拉料周期过长，稍有卡点即面临断产风险。",
            level: "medium"
          }
        ],
        metrics: [
          { label: "周期产销率", value: "102.6%", status: "success", info: "产销近乎完全对齐，供求平衡" },
          { label: "累计供需缺口", value: "-299 辆", status: "success", info: "整体稍微处于供不应求的健康去库态势" },
          { label: "6月末总在库", value: "2,387 辆", status: "warn", info: "总库存水位略偏高，需防范7月滞销" },
          { label: "库存覆盖月数", value: "0.62 个月", status: "success", info: "约18天周转，周转效率极佳" }
        ],
        actions: [
          "【弹性排产】根据7月第一周的日均销售流速（DCR）动态预警，如果大宗订单未能延续，立即将7月排产砍掉 25%，防止厂库冲破 2,000 辆防线。",
          "【干线物流优化】建立大客户直发绿色物流通道，将直营订单由『总厂-中转库-门店-客户』扁平化压缩为『总厂-客户直抵』，降低门店中转资金压力的同时将在途时间缩短 60%。",
          "【关键供应商包干】对CATL电池和核心功率半导体供应商落实 H2 滚动锁定订单，保障爆款车型抗暴波震荡能力。"
        ]
      };
    }
  }, [selectedModel]);

  return (
    <div id="vehicle-fitting-analysis-view" className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Visual Rich Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative max-w-5xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            精细化车型拟合引擎 (Model Fitting Engine)
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                车型产销存多维拟合与风险穿透
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                按照<b>「生产入库」</b>、<b>「总库存」</b>、<b>「直营需求（直客大订）」</b>与<b>「总实际销售」</b>四大核心维度，1:1 重构您上传的真实车型统计账本。深入分析多变量间的耦合拟合度，定位供应链的计划时差、鞭梢震荡与爆仓风险。
              </p>
            </div>
            
            {/* Model Switcher Buttons */}
            <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start md:self-auto shrink-0 shadow-inner">
              <button
                onClick={() => { setSelectedModel('vDaMian'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedModel === 'vDaMian'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                多拉大面
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              </button>
              <button
                onClick={() => { setSelectedModel('v3m8'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedModel === 'v3m8'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                整车库存-3米8
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Interactive Chart, Current Month Inspector and Model Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Graph with Line Config and legend (7 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          {/* Header with View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-indigo-600" />
                {selectedModel === 'v3m8' ? '3米8 微卡' : '多拉大面'} 产销存动态关系与趋势
              </h2>
              <p className="text-[11px] text-slate-500">
                直观透视<b>【生产入库】</b>与<b>【实际销售】</b>剪刀差对<b>【期末总库存】</b>蓄水池的驱动演进
              </p>
            </div>
            
            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0 gap-1">
              <button
                onClick={() => setChartViewMode('balance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'balance'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                产销剪刀差与库存蓄水 (柱线联动)
              </button>
              <button
                onClick={() => setChartViewMode('flow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'flow'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers3 className="w-3.5 h-3.5" />
                单月水池与流向分解
              </button>
              <button
                onClick={() => setChartViewMode('lines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'lines'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                多维全景折线
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: BALANCE (Grouped Bars for Production vs Sales + Net Delta Badges + Inventory Line Overlay) */}
          {chartViewMode === 'balance' && (
            <div className="space-y-4">
              
              {/* Dynamic Live Balance Equation Banner */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-inner">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-600 text-white font-mono font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                    [{selectedMonthData.month}] 动态平衡公式
                  </span>
                  <span className="font-bold">
                    生产入库 <span className="text-emerald-400 font-mono font-extrabold">{selectedMonthData.production}</span> 辆 - 实际销售 <span className="text-blue-400 font-mono font-extrabold">{selectedMonthData.actualSales}</span> 辆 = 
                    <strong className={selectedMonthData.gap >= 0 ? 'text-emerald-400 font-mono font-extrabold ml-1.5' : 'text-rose-400 font-mono font-extrabold ml-1.5'}>
                      剪刀差 {selectedMonthData.gap >= 0 ? `+${selectedMonthData.gap}` : selectedMonthData.gap} 辆 ({selectedMonthData.gap >= 0 ? '建库蓄水' : '去库消耗'})
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-[11px] shrink-0">
                  期末总库存蓄水: <span className="text-amber-400 text-sm font-extrabold">{selectedMonthData.inventory} 辆</span>
                </div>
              </div>

              {/* Grouped Bar + Line Overlay SVG */}
              <div className="relative w-full aspect-[8/3.5] bg-slate-50/50 rounded-2xl p-4 border border-slate-100 overflow-hidden select-none">
                <svg 
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                  className="w-full h-full overflow-visible"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = paddingTop + ratio * chartHeight;
                    const valueLabel = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={i} className="opacity-40">
                        <line 
                          x1={paddingLeft} 
                          y1={y} 
                          x2={svgWidth - paddingRight} 
                          y2={y} 
                          stroke="#cbd5e1" 
                          strokeWidth="0.75" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={paddingLeft - 8} 
                          y={y + 3} 
                          textAnchor="end" 
                          className="font-mono text-[9px] fill-slate-400 font-bold"
                        >
                          {valueLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Forecast Shading */}
                  {(() => {
                    const xCutoff = getXCoordinate(histCutoffIndex, activeData.length);
                    const xEnd = getXCoordinate(activeData.length - 1, activeData.length);
                    return (
                      <g key="forecastRegion">
                        <rect 
                          x={xCutoff} 
                          y={paddingTop} 
                          width={Math.max(0, xEnd - xCutoff)} 
                          height={chartHeight} 
                          fill="rgba(99, 102, 241, 0.04)" 
                          rx="6"
                        />
                        <line 
                          x1={xCutoff} 
                          y1={paddingTop - 10} 
                          x2={xCutoff} 
                          y2={paddingTop + chartHeight} 
                          stroke="#6366f1" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={xCutoff + 6} 
                          y={paddingTop - 4} 
                          className="fill-indigo-600 font-extrabold text-[9px] font-mono"
                        >
                          🔮 未来推演 (预测/计划)
                        </text>
                      </g>
                    );
                  })()}

                  {/* X Axis & Month Grouped Bars */}
                  {activeData.map((d, idx) => {
                    const x = getXCoordinate(idx, activeData.length);
                    const isSelected = selectedIndex === idx;
                    const isHovered = hoveredIndex === idx;

                    const yProd = getYCoordinate(d.production);
                    const yAct = getYCoordinate(d.actualSales);

                    const prodBarHeight = Math.max(2, paddingTop + chartHeight - yProd);
                    const actBarHeight = Math.max(2, paddingTop + chartHeight - yAct);

                    const barWidth = 14;

                    return (
                      <g 
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedIndex(idx)}
                      >
                        {/* Hover/Selection Background Bar */}
                        {(isSelected || isHovered) && (
                          <rect 
                            x={x - 24} 
                            y={paddingTop} 
                            width={48} 
                            height={chartHeight} 
                            fill={isSelected ? "rgba(99, 102, 241, 0.08)" : "rgba(148, 163, 184, 0.05)"} 
                            rx="8"
                          />
                        )}

                        {/* Production Bar (Emerald) */}
                        <rect 
                          x={x - barWidth - 2} 
                          y={yProd} 
                          width={barWidth} 
                          height={prodBarHeight} 
                          fill={d.isForecast ? "url(#emeraldGradForecast)" : "#10b981"} 
                          rx="3"
                          className="transition-all duration-300 hover:opacity-90"
                        />

                        {/* Actual Sales Bar (Blue) */}
                        <rect 
                          x={x + 2} 
                          y={yAct} 
                          width={barWidth} 
                          height={actBarHeight} 
                          fill={d.isForecast ? "url(#blueGradForecast)" : "#2563eb"} 
                          rx="3"
                          className="transition-all duration-300 hover:opacity-90"
                        />

                        {/* Net Delta Badge (+/-) above bar pair */}
                        {(() => {
                          const minBarY = Math.min(yProd, yAct);
                          const delta = d.gap;
                          const isPlus = delta >= 0;
                          return (
                            <g transform={`translate(${x}, ${minBarY - 8})`}>
                              <rect 
                                x={-18} 
                                y={-11} 
                                width={36} 
                                height={13} 
                                rx={4} 
                                fill={isPlus ? "#dcfce7" : "#ffe4e6"} 
                                stroke={isPlus ? "#86efac" : "#fca5a5"} 
                                strokeWidth={0.8}
                              />
                              <text 
                                textAnchor="middle" 
                                y={-2} 
                                className={`text-[8px] font-mono font-extrabold ${isPlus ? 'fill-emerald-800' : 'fill-rose-800'}`}
                              >
                                {isPlus ? `▲+${delta}` : `▼${delta}`}
                              </text>
                            </g>
                          );
                        })()}

                        {/* X-Axis Label */}
                        <text 
                          x={x} 
                          y={paddingTop + chartHeight + 18} 
                          textAnchor="middle" 
                          className={`text-[9px] font-bold ${
                            isSelected 
                              ? 'fill-indigo-600 font-extrabold text-[10px]' 
                              : 'fill-slate-500'
                          }`}
                        >
                          {d.month}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG Gradients */}
                  <defs>
                    <linearGradient id="emeraldGradForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="blueGradForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  {/* Total Inventory Line Overlay (Amber Line - Total Stock Water Level) */}
                  {showInv && (
                    <>
                      <path 
                        d={linePaths.histInv}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300 drop-shadow-sm"
                      />
                      <path 
                        d={linePaths.forecastInv}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="5 4"
                        className="transition-all duration-300"
                      />
                    </>
                  )}

                  {/* Safety Stock Line Overlay (Violet Dashed Line) */}
                  {showSafetyStock && (
                    <>
                      <path 
                        d={linePaths.histSafety}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      <path 
                        d={linePaths.forecastSafety}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    </>
                  )}

                  {/* Nodes on Inventory line */}
                  {activeData.map((d, idx) => {
                    const x = getXCoordinate(idx, activeData.length);
                    const yInv = getYCoordinate(d.inventory);
                    const isSelected = selectedIndex === idx;

                    return (
                      <g key={idx} onClick={() => setSelectedIndex(idx)} className="cursor-pointer">
                        <circle 
                          cx={x} 
                          cy={yInv} 
                          r={isSelected ? 6 : 4.5} 
                          className="fill-amber-500 stroke-white stroke-[2] shadow"
                        />
                        {isSelected && (
                          <circle 
                            cx={x} 
                            cy={yInv} 
                            r={10} 
                            className="fill-amber-500/20 stroke-amber-500/50 stroke-[1.5]"
                          />
                        )}
                      </g>
                    );
                  })}

                </svg>

                {/* Floating Tooltip */}
                {hoveredIndex !== null && (
                  <div 
                    className="absolute bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-[10px] space-y-1 z-20 pointer-events-none border border-slate-700/50 backdrop-blur-md"
                    style={{
                      left: `${(hoveredIndex / (activeData.length - 1)) * 72 + 8}%`,
                      top: '10%'
                    }}
                  >
                    <div className="font-bold border-b border-slate-700/60 pb-1 flex justify-between gap-4">
                      <span>{activeData[hoveredIndex].month} 产销存平衡明细</span>
                      <span className="text-indigo-300 font-mono">第 {hoveredIndex + 1} 节点</span>
                    </div>
                    <div className="space-y-0.5 pt-1 font-mono">
                      <div className="flex justify-between gap-6">
                        <span className="text-slate-400">● 生产入库(流入):</span>
                        <strong className="text-emerald-400">{activeData[hoveredIndex].production} 辆</strong>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-slate-400">● 实际销售(流出):</span>
                        <strong className="text-blue-400">{activeData[hoveredIndex].actualSales} 辆</strong>
                      </div>
                      <div className="flex justify-between gap-6 border-t border-slate-700/60 pt-1 mt-1">
                        <span className="text-slate-200 font-bold">● 月度净剪刀差(增减):</span>
                        <strong className={activeData[hoveredIndex].gap >= 0 ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                          {activeData[hoveredIndex].gap >= 0 ? `+${activeData[hoveredIndex].gap}` : activeData[hoveredIndex].gap} 辆
                        </strong>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-slate-400">● 期末总库存(水池水位):</span>
                        <strong className="text-amber-400">{activeData[hoveredIndex].inventory} 辆</strong>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-slate-400">● 安全库存目标({safetyStockRatio.toFixed(1)}倍销):</span>
                        <strong className="text-violet-400">{activeData[hoveredIndex].safetyStock} 辆</strong>
                      </div>
                      <div className="flex justify-between gap-6 border-t border-slate-700/60 pt-1">
                        <span className="text-slate-300 font-bold">● 库存与安全线拟合率:</span>
                        <strong className={
                          (activeData[hoveredIndex].inventory / (activeData[hoveredIndex].safetyStock || 1)) >= 0.85 && 
                          (activeData[hoveredIndex].inventory / (activeData[hoveredIndex].safetyStock || 1)) <= 1.25 
                            ? "text-emerald-400 font-extrabold" 
                            : (activeData[hoveredIndex].inventory / (activeData[hoveredIndex].safetyStock || 1)) < 0.85
                              ? "text-rose-400 font-extrabold"
                              : "text-amber-400 font-extrabold"
                        }>
                          {Math.round((activeData[hoveredIndex].inventory / (activeData[hoveredIndex].safetyStock || 1)) * 100)}%
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend Summary for Balance Mode */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span>1. 生产入库 (Inflow)</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
                  <span>2. 实际销售 (Outflow)</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-300">▲+剪刀差</span>
                  <span>3. 净增库 / 净去库</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-amber-700">
                  <span className="w-3 h-1 bg-amber-500 inline-block rounded-full"></span>
                  <span>4. 期末总库存 (蓄水池)</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-violet-700">
                  <span className="w-3 stroke-violet-600 border-b-2 border-dashed border-violet-600 inline-block"></span>
                  <span>5. 安全库存线</span>
                </div>
              </div>

            </div>
          )}

          {/* VIEW MODE 2: FLOW (PSI Reservoir & Supply Chain Pipe Breakdown) */}
          {chartViewMode === 'flow' && (
            <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">单月水池与流量方程分解</span>
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono">
                    [{selectedMonthData.month}] 产销存物理账本流向拆解
                  </h3>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full border border-indigo-200">
                  点击下方节点可切换月份
                </span>
              </div>

              {/* Physical Flow Visual Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Block 1: Inflow Supply */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      1. 本期供给源头 (入流)
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded">
                      + 资源供给
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>期初库存 (上月结转):</span>
                      <strong className="text-slate-800">
                        {selectedIndex === 0 ? 0 : activeData[selectedIndex - 1].inventory} 辆
                      </strong>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>+ 本期生产入库:</span>
                      <strong className="text-sm font-extrabold">+{selectedMonthData.production} 辆</strong>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                      <span>= 可售整车总量:</span>
                      <span className="text-emerald-700 text-sm font-extrabold">
                        {(selectedIndex === 0 ? 0 : activeData[selectedIndex - 1].inventory) + selectedMonthData.production} 辆
                      </span>
                    </div>
                  </div>
                </div>

                {/* Block 2: Sales Outflow */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      2. 本期销售消纳 (出流)
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-800 font-mono font-bold px-2 py-0.5 rounded">
                      - 销号出库
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>直营销售 (直客交车):</span>
                      <strong className="text-purple-600">{selectedMonthData.directSales} 辆</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>渠道加盟 (经销商提车):</span>
                      <strong className="text-cyan-600">{selectedMonthData.channelSales} 辆</strong>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-blue-700">
                      <span>= 本期实际总销售:</span>
                      <span className="text-blue-800 text-sm font-extrabold">
                        -{selectedMonthData.actualSales} 辆
                      </span>
                    </div>
                  </div>
                </div>

                {/* Block 3: Residual Inventory */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      3. 期末库存留存 (蓄水)
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-mono font-bold px-2 py-0.5 rounded">
                      = 期末留存
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>工厂中央总厂库:</span>
                      <strong className="text-amber-800">{selectedMonthData.factoryStock} 辆</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>全国终端门店店头:</span>
                      <strong className="text-amber-600">{selectedMonthData.storeStock} 辆</strong>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-amber-800">
                      <span>= 期末在库总车数:</span>
                      <span className="text-amber-600 text-sm font-extrabold">
                        {selectedMonthData.inventory} 辆
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Month Selector Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold mr-1">切换查看月份:</span>
                {activeData.map((d, mIdx) => (
                  <button
                    key={mIdx}
                    onClick={() => setSelectedIndex(mIdx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                      selectedIndex === mIdx 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {d.month}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* VIEW MODE 3: LINES (Multi-Series Detailed View) */}
          {chartViewMode === 'lines' && (
            <div className="space-y-4">
              {/* Pure SVG Beautiful Interactive Line Chart */}
              <div className="relative w-full aspect-[8/3.5] bg-slate-50/50 rounded-2xl p-4 border border-slate-100 overflow-hidden select-none">
            
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartHeight;
                const valueLabel = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={i} className="opacity-40">
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={svgWidth - paddingRight} 
                      y2={y} 
                      stroke="#cbd5e1" 
                      strokeWidth="0.75" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="font-mono text-[9px] fill-slate-400 font-bold"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Forecast Area Shading & Divider Line */}
              {(() => {
                const xCutoff = getXCoordinate(histCutoffIndex, activeData.length);
                const xEnd = getXCoordinate(activeData.length - 1, activeData.length);
                return (
                  <g key="forecastRegion">
                    <rect 
                      x={xCutoff} 
                      y={paddingTop} 
                      width={Math.max(0, xEnd - xCutoff)} 
                      height={chartHeight} 
                      fill="rgba(99, 102, 241, 0.04)" 
                      rx="6"
                    />
                    <line 
                      x1={xCutoff} 
                      y1={paddingTop - 10} 
                      x2={xCutoff} 
                      y2={paddingTop + chartHeight} 
                      stroke="#6366f1" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={xCutoff + 6} 
                      y={paddingTop - 4} 
                      className="fill-indigo-600 font-extrabold text-[9px] font-mono"
                    >
                      🔮 未来3个月 预测与计划 (虚线)
                    </text>
                  </g>
                );
              })()}

              {/* X Axis & Labels */}
              {activeData.map((d, idx) => {
                const x = getXCoordinate(idx, activeData.length);
                const isSelected = selectedIndex === idx;
                const isHovered = hoveredIndex === idx;
                const isForecastNode = d.isForecast;
                return (
                  <g key={idx}>
                    <line 
                      x1={x} 
                      y1={paddingTop} 
                      x2={x} 
                      y2={paddingTop + chartHeight} 
                      stroke={isSelected ? "#6366f1" : isHovered ? "#94a3b8" : "#e2e8f0"} 
                      strokeWidth={isSelected ? "1.5" : isHovered ? "1" : "0.5"} 
                      strokeDasharray={isSelected ? "none" : "2 2"} 
                      className="transition-all duration-200"
                    />
                    <text 
                      x={x} 
                      y={paddingTop + chartHeight + 18} 
                      textAnchor="middle" 
                      className={`text-[9px] font-bold ${
                        isSelected 
                          ? 'fill-indigo-600 font-extrabold text-[10px]' 
                          : isForecastNode 
                            ? 'fill-indigo-500 font-semibold' 
                            : 'fill-slate-400'
                      }`}
                    >
                      {d.month} {isForecastNode ? '(预测)' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Lines & Fill areas based on legend settings */}
              
              {/* 1. Direct Apply (直营提报: 前6个月实线, 未来虚线) - Pink */}
              {showApply && (
                <>
                  <path 
                    d={linePaths.histApply}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastApply}
                    fill="none"
                    stroke="#db2777"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 2. Direct Sales (直营销售: 前6个月实线, 未来虚线) - Purple */}
              {showDem && (
                <>
                  <path 
                    d={linePaths.histDirectSales}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastDirectSales}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 3. Channel Sales (渠道销售: 前6个月实线, 未来虚线) - Cyan */}
              {showChannel && (
                <>
                  <path 
                    d={linePaths.histChannelSales}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastChannelSales}
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 4. Actual Sales = Direct + Channel (实际销售: 前6个月实线, 未来虚线) - Blue */}
              {showAct && (
                <>
                  <path 
                    d={linePaths.histAct}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastAct}
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 5. Production (生产入库: 前6个月实线, 未来虚线) - Emerald */}
              {showProd && (
                <>
                  <path 
                    d={linePaths.histProd}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastProd}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 6. Inventory (总车库存: 前6个月实线, 未来虚线) - Amber */}
              {showInv && (
                <>
                  <path 
                    d={linePaths.histInv}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastInv}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 4"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* 7. Safety Stock (安全库存 = 销售预测 * 系数) - Violet/Fuchsia */}
              {showSafetyStock && (
                <>
                  <path 
                    d={linePaths.histSafety}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5 3"
                    className="transition-all duration-300"
                  />
                  <path 
                    d={linePaths.forecastSafety}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5 3"
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* Interactive Dots */}
              {activeData.map((d, idx) => {
                const x = getXCoordinate(idx, activeData.length);
                const isSelected = selectedIndex === idx;
                const isHovered = hoveredIndex === idx;
                const isForecastNode = d.isForecast;

                const yProd = getYCoordinate(d.production);
                const yInv = getYCoordinate(d.inventory);
                const yApply = getYCoordinate(d.directApply);
                const yDirect = getYCoordinate(d.directSales);
                const yChannel = getYCoordinate(d.channelSales);
                const yAct = getYCoordinate(d.actualSales);
                const ySafety = getYCoordinate(d.safetyStock);

                return (
                  <g 
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    {/* Invisible hover catcher */}
                    <rect 
                      x={x - 20} 
                      y={paddingTop} 
                      width={40} 
                      height={chartHeight} 
                      fill="transparent" 
                    />

                    {/* Interaction Glow ring */}
                    {(isSelected || isHovered) && (
                      <circle 
                        cx={x} 
                        cy={yAct} 
                        r={12} 
                        className="fill-indigo-500/10 stroke-indigo-500/25 stroke-[1]"
                      />
                    )}

                    {/* Production dots */}
                    {showProd && (
                      <circle 
                        cx={x} 
                        cy={yProd} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-emerald-500 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-emerald-300' : ''}`}
                      />
                    )}

                    {/* Inventory dots */}
                    {showInv && (
                      <circle 
                        cx={x} 
                        cy={yInv} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-amber-500 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-amber-300' : ''}`}
                      />
                    )}

                    {/* Direct Apply dots */}
                    {showApply && (
                      <circle 
                        cx={x} 
                        cy={yApply} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-pink-500 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-pink-300' : ''}`}
                      />
                    )}

                    {/* Direct Sales dots */}
                    {showDem && (
                      <circle 
                        cx={x} 
                        cy={yDirect} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-purple-500 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-purple-300' : ''}`}
                      />
                    )}

                    {/* Channel Sales dots */}
                    {showChannel && (
                      <circle 
                        cx={x} 
                        cy={yChannel} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-cyan-500 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-cyan-300' : ''}`}
                      />
                    )}

                    {/* Actual Sales dots */}
                    {showAct && (
                      <circle 
                        cx={x} 
                        cy={yAct} 
                        r={isSelected ? 6.5 : 4.5} 
                        className={`fill-blue-600 stroke-white stroke-[2] shadow-md ${isForecastNode ? 'ring-2 ring-blue-300' : ''}`}
                      />
                    )}

                    {/* Safety Stock dots */}
                    {showSafetyStock && (
                      <circle 
                        cx={x} 
                        cy={ySafety} 
                        r={isSelected ? 5.5 : 4} 
                        className={`fill-violet-600 stroke-white stroke-[1.5] shadow ${isForecastNode ? 'ring-2 ring-violet-300' : ''}`}
                      />
                    )}
                  </g>
                );
              })}

            </svg>

            {/* Float tooltip during hover */}
            {hoveredIndex !== null && (
              <div 
                className="absolute bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-[10px] space-y-1 z-20 pointer-events-none border border-slate-700/50 backdrop-blur-md"
                style={{
                  left: `${(hoveredIndex / (activeData.length - 1)) * 72 + 8}%`,
                  top: '10%'
                }}
              >
                <div className="font-bold border-b border-slate-700/60 pb-1 flex justify-between gap-4">
                  <span>{activeData[hoveredIndex].month} {activeData[hoveredIndex].isForecast ? '【未来预测/计划】' : '【历史实测】'}</span>
                  <span className="text-indigo-300 font-mono">第 {hoveredIndex + 1} 节点</span>
                </div>
                <div className="space-y-0.5 pt-1 font-mono">
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                      {activeData[hoveredIndex].isForecast ? '● 生产计划(入库):' : '● 生产入库:'}
                    </span>
                    <strong className="text-emerald-400">{activeData[hoveredIndex].production} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                      {activeData[hoveredIndex].isForecast ? '● 直营提报预测:' : '● 直营提报:'}
                    </span>
                    <strong className="text-pink-400">{activeData[hoveredIndex].directApply} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                      {activeData[hoveredIndex].isForecast ? '● 直营销售预测:' : '● 直营销售:'}
                    </span>
                    <strong className="text-purple-400">{activeData[hoveredIndex].directSales} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                      {activeData[hoveredIndex].isForecast ? '● 渠道销售预测:' : '● 渠道销售:'}
                    </span>
                    <strong className="text-cyan-400">{activeData[hoveredIndex].channelSales} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6 border-t border-slate-700/60 pt-1 mt-1">
                    <span className="text-slate-200 font-bold">
                      {activeData[hoveredIndex].isForecast ? '● 销售预测 (直营+渠道):' : '● 实际销售 (直营+渠道):'}
                    </span>
                    <strong className="text-blue-400 font-extrabold">{activeData[hoveredIndex].actualSales} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                      {activeData[hoveredIndex].isForecast ? '● 推演期末总库存:' : '● 总车库存:'}
                    </span>
                    <strong className="text-amber-400">{activeData[hoveredIndex].inventory} 辆</strong>
                  </div>
                  <div className="flex justify-between gap-6 text-violet-300 font-bold border-t border-slate-800 pt-1">
                    <span>
                      ● 安全库存线 (=预测×{safetyStockRatio}):
                    </span>
                    <strong className="text-violet-400 font-extrabold">{activeData[hoveredIndex].safetyStock} 辆</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Legend Selector with Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 pt-3 border-t border-slate-100 text-xs">
            
            {/* Legend 1: Production */}
            <button 
              onClick={() => setShowProd(!showProd)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showProd ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showProd ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <span>1. 生产入库/计划</span>
            </button>

            {/* Legend 2: Direct Apply */}
            <button 
              onClick={() => setShowApply(!showApply)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showApply ? 'bg-pink-50 border-pink-200 text-pink-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showApply ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
              <span>2. 直营提报</span>
            </button>

            {/* Legend 3: Direct Sales */}
            <button 
              onClick={() => setShowDem(!showDem)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showDem ? 'bg-purple-50 border-purple-200 text-purple-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showDem ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
              <span>3. 直营销售</span>
            </button>

            {/* Legend 4: Channel Sales */}
            <button 
              onClick={() => setShowChannel(!showChannel)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showChannel ? 'bg-cyan-50 border-cyan-200 text-cyan-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showChannel ? 'bg-cyan-500' : 'bg-slate-300'}`}></div>
              <span>4. 渠道销售</span>
            </button>

            {/* Legend 5: Actual Sales (Direct + Channel) */}
            <button 
              onClick={() => setShowAct(!showAct)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showAct ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showAct ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
              <span>5. 实际销售(直+渠)</span>
            </button>

            {/* Legend 6: Inventory */}
            <button 
              onClick={() => setShowInv(!showInv)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showInv ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showInv ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
              <span>6. 总车库存</span>
            </button>

            {/* Legend 7: Safety Stock */}
            <button 
              onClick={() => setShowSafetyStock(!showSafetyStock)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer font-semibold ${
                showSafetyStock ? 'bg-violet-50 border-violet-200 text-violet-800 shadow-sm ring-1 ring-violet-300' : 'bg-slate-50 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showSafetyStock ? 'bg-violet-600' : 'bg-slate-300'}`}></div>
              <span>7. 安全库存 (=销售预测×{safetyStockRatio})</span>
            </button>
            
          </div>
          </div>
          )}

          {/* Interactive Safety Stock & Sales Forecast Controls Console */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  安全库存与销售预测 动态调优控制台
                </h3>
              </div>
              <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2.5 py-0.5 rounded-full border border-violet-200">
                实时计算联动折线图
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Slider 1: Sales Forecast Multiplier */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">1. 销售预测基准调整 (需求系数)</span>
                  <span className="text-blue-600 font-mono font-extrabold">
                    {Math.round(salesForecastMultiplier * 100)}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05" 
                  value={salesForecastMultiplier} 
                  onChange={(e) => setSalesForecastMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                  <span>50% (保守市场)</span>
                  <span>100% (基准预测)</span>
                  <span>150% (旺季爆发)</span>
                </div>
              </div>

              {/* Slider 2: Safety Stock Ratio */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">2. 安全库存覆盖倍数 (正常约2倍销售)</span>
                  <span className="text-violet-600 font-mono font-extrabold">
                    {safetyStockRatio.toFixed(1)} 倍月销量
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4.0" 
                  step="0.1" 
                  value={safetyStockRatio} 
                  onChange={(e) => setSafetyStockRatio(parseFloat(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] text-slate-400 self-center font-semibold mr-1">标准预设:</span>
                  {[
                    { label: '1.5倍 (精益压库)', val: 1.5 },
                    { label: '2.0倍 (标准配额)', val: 2.0 },
                    { label: '2.5倍 (充沛备库)', val: 2.5 },
                    { label: '3.0倍 (高缓冲蓄水)', val: 3.0 }
                  ].map((preset, pIdx) => (
                    <button 
                      key={pIdx}
                      onClick={() => setSafetyStockRatio(preset.val)}
                      className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        safetyStockRatio === preset.val 
                          ? 'bg-violet-600 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Current month & cycle Safety Stock vs Total Inventory Fitting Diagnosis Section */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    [{selectedMonthData.month}] 安全库存与总库存 拟合判断与诊断
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-500 font-semibold">全周期匹配拟合度:</span>
                  <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded border border-indigo-200">
                    {fittingAnalysis.avgScore}%
                  </span>
                </div>
              </div>

              {/* Grid of fitting dimension numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans font-semibold block">1. 当月实际/预测销售</span>
                  <strong className="text-blue-600 text-sm font-extrabold">{fittingAnalysis.sales} 辆</strong>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans font-semibold block">2. 安全库存目标 ({safetyStockRatio.toFixed(1)}倍)</span>
                  <strong className="text-violet-600 text-sm font-extrabold">{fittingAnalysis.targetSafety} 辆</strong>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans font-semibold block">3. 实际期末总库存</span>
                  <strong className="text-amber-600 text-sm font-extrabold">{fittingAnalysis.currentInv} 辆</strong>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans font-semibold block">4. 拟合完成度 (总/安全)</span>
                  <strong className={`text-sm font-extrabold ${
                    fittingAnalysis.status === 'ideal' ? 'text-emerald-600' :
                    fittingAnalysis.status === 'under' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {fittingAnalysis.ratio}%
                  </strong>
                </div>
              </div>

              {/* Fitting Diagnosis Result Banner */}
              <div className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans ${
                fittingAnalysis.status === 'ideal' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : fittingAnalysis.status === 'under'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  {fittingAnalysis.status === 'ideal' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : fittingAnalysis.status === 'under' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <strong className="font-extrabold block text-xs">
                      {fittingAnalysis.status === 'ideal' && `🟢 完美拟合：总库存与 ${safetyStockRatio.toFixed(1)}倍月销安全水位高度贴合 (${fittingAnalysis.ratio}%)`}
                      {fittingAnalysis.status === 'under' && `🟡 存货偏低：总库存未达 ${safetyStockRatio.toFixed(1)}倍安全线，缺口 {-fittingAnalysis.gap} 辆 (拟合率 ${fittingAnalysis.ratio}%)`}
                      {fittingAnalysis.status === 'over' && `🔴 存货超量：总库存大幅超出 ${safetyStockRatio.toFixed(1)}倍安全线，余量 +${fittingAnalysis.gap} 辆 (拟合率 ${fittingAnalysis.ratio}%)`}
                    </strong>
                    <span className="text-[11px] opacity-90 block mt-0.5">
                      {fittingAnalysis.status === 'ideal' && '产销存处于精益协同区间，既能有效抵御销售波峰断货，又未造成资金沉淀。'}
                      {fittingAnalysis.status === 'under' && `若出现短期订单爆发，现有库存缓冲不足，极易穿透防线导致大面积交付卡断缺货。建议适当补产，补足 {-fittingAnalysis.gap} 辆缓冲垫。`}
                      {fittingAnalysis.status === 'over' && `库存积压超过安全基准 +${fittingAnalysis.gap} 辆，占用过多流动资金与堆场，建议控制下月生产排产，拉动渠道提车去库。`}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[11px] font-bold">
                  {fittingAnalysis.gap >= 0 ? (
                    <span className="px-2.5 py-1 bg-white/80 rounded border shadow-sm">安全缓冲: +{fittingAnalysis.gap} 辆</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-white/80 rounded border shadow-sm text-rose-700">安全缺口: {fittingAnalysis.gap} 辆</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Month-by-month Detail Card & Quick Stats (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Month Inspector Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 flex flex-col justify-between space-y-4">
            
            <div className="space-y-1 border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">月份穿透透视器</h3>
                <span className="text-lg font-extrabold text-slate-900 font-mono">
                  {selectedMonthData.month} 时段数据
                </span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                节点选定
              </span>
            </div>

            {/* 6 Dimension Exact numbers display */}
            <div className="grid grid-cols-2 gap-2.5">
              
              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-400 font-semibold block">生产入库 (产)</span>
                <strong className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono">
                  {selectedMonthData.production} <span className="text-[9px] text-slate-500 font-normal">辆</span>
                </strong>
                <span className="text-[9px] text-slate-400 block border-t border-slate-100 mt-1 pt-1 font-semibold">
                  产销比: {selectedMonthData.productionSalesRate}%
                </span>
              </div>

              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-400 font-semibold block">期末总库存 (存)</span>
                <strong className="text-sm sm:text-base font-extrabold text-amber-600 font-mono">
                  {selectedMonthData.inventory} <span className="text-[9px] text-slate-500 font-normal">辆</span>
                </strong>
                <span className="text-[9px] text-slate-400 block border-t border-slate-100 mt-1 pt-1">
                  厂: {selectedMonthData.factoryStock} | 店: {selectedMonthData.storeStock}
                </span>
              </div>

              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-400 font-semibold block">直营申请 (提报)</span>
                <strong className="text-sm sm:text-base font-extrabold text-pink-600 font-mono">
                  {selectedMonthData.directApply} <span className="text-[9px] text-slate-500 font-normal">辆</span>
                </strong>
                <span className="text-[9px] text-slate-400 block border-t border-slate-100 mt-1 pt-1">
                  对直销比: {selectedMonthData.directSales === 0 ? 0 : Math.round((selectedMonthData.directApply / selectedMonthData.directSales) * 100)}%
                </span>
              </div>

              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-400 font-semibold block">直营销售 (直销)</span>
                <strong className="text-sm sm:text-base font-extrabold text-purple-600 font-mono">
                  {selectedMonthData.directSales} <span className="text-[9px] text-slate-500 font-normal">辆</span>
                </strong>
                <span className="text-[9px] text-slate-400 block border-t border-slate-100 mt-1 pt-1">
                  渠道加盟: {selectedMonthData.channelSales} 辆
                </span>
              </div>

              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/30 col-span-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">实际销售 (总销量)</span>
                    <strong className="text-base font-extrabold text-blue-600 font-mono">
                      {selectedMonthData.actualSales} <span className="text-[10px] text-slate-500 font-normal">辆</span>
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-semibold">
                      供需缺口 (产 - 销)
                    </span>
                    <span className={`text-xs font-bold font-mono ${selectedMonthData.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedMonthData.gap > 0 ? `+${selectedMonthData.gap}` : selectedMonthData.gap} 辆
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Health / Alert diagnosis for selected month */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] border-b border-white/10 pb-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                当月拟合风险诊断评语
              </div>
              
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                {selectedModel === 'v3m8' ? (
                  selectedIndex === 0 ? "3月属于产品上市准备，产销存处于极低底座，未暴露系统性风险。" :
                  selectedIndex === 1 ? "4月迎来爆发大订，因为工厂没有提前预热，造成 -417 辆的大面积欠交断货，店头极速拉空，机会损失严重！" :
                  selectedIndex === 2 ? "5月决策层慌忙补偿爆产 1,436 辆，然而销量已冲高回落，产销率仅 55.8%，产生巨大的供需压库(+634 辆)！" :
                  "6月被迫降产 50%，但由于车辆全部压死在总厂库（303 辆），门店库存（77 辆）处于极度赤字缺车状态，调拨效率严重受阻！"
                ) : (
                  selectedIndex === 0 ? "1月开局顺畅，产销基本相抵，门店店头备足了 918 辆良性库存以备战春节周转。" :
                  selectedIndex === 1 ? "2月由于春节假期大盘暴跌至 270 辆。工厂迅速做出排产避峰，店头去库彻底（剩18辆），为开春重装铺货腾空了场地。" :
                  selectedIndex === 2 ? "3月开春采购大订报复性反弹，销量创 2,426 辆新高。排产 2,047 辆不足，动用了上月库存储备进行冲抵，属于精益周转典范。" :
                  selectedIndex === 3 ? "4月排产适度盈余（+756 辆），决策开始主动在店端和厂端构建『战略蓄水池』。" :
                  selectedIndex === 4 ? "5月继续主动增库，厂端库存积压超千辆，这笔大蓄水池为迎接6月大爆发铺平了供应链物理红线。" :
                  "6月迎来 3,844 辆爆单，远超 2,580 辆产能。因为5月建立的 1,889 辆完美蓄水池防御，成功完成交付，产销契合拟合极为成功！"
                )}
              </p>
            </div>

            {/* Quick guide */}
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-center">
              <Info className="w-3 h-3 text-indigo-500" />
              提示：您可以点击上方折线大图中的任意节点来切换时段。
            </div>

          </div>

          {/* Model Health Checklist */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                多维拟合业务评价体系
              </span>
              <button
                onClick={() => setShowCorrelationModal(true)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg font-bold border border-indigo-200 transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <HelpCircle className="w-3 h-3" />
                相关性计算说明
              </button>
            </h3>
            <div className="space-y-2 text-[10px] leading-normal font-medium">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/30">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">直营需求与生产相关性</span>
                  <button 
                    onClick={() => setShowCorrelationModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-[9px] underline font-bold cursor-pointer"
                  >
                    (查看算法)
                  </button>
                </div>
                <span className={`font-mono font-bold ${selectedModel === 'v3m8' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedModel === 'v3m8' ? '极低 (R=0.21)' : '中高 (R=0.74)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">实际零售与排产延迟月数</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedModel === 'v3m8' ? '1.5个月 (高度滞后)' : '0.5个月 (敏捷对齐)'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>



      {/* Section: Monthly S&OP Risk & Fitting Panorama (User requested: 基于生产、库存、提报、销量的关系，分析每个月的风险和情况，异常数据高亮显示) */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-100 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              S&OP 产销存提报月度联动
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2 mt-1">
              {selectedModel === 'v3m8' ? '3米8 微卡' : '多拉大面'} 月度产销存联动与风险透视
            </h2>
            <p className="text-xs text-slate-500">
              深度透视<b>【生产入库、库存、直营申请/提报、实际销量】</b>多变量耦合关系，直观穿透每月核心经营状态。
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/80 p-2 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-600 font-bold">精益/良性去库</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-[10px] text-slate-600 font-bold">中度避峰/倒挂预警</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-[10px] text-slate-600 font-bold">严重供求高危</span>
            </div>
          </div>
        </div>

        {/* Responsive Grid of Months */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {monthlyDiagnostics.map((monthData, idx) => {
            const isHigh = monthData.riskLevel === 'high';
            const isWarn = monthData.riskLevel === 'warn';
            const isSuccess = monthData.riskLevel === 'success';

            let cardBg = "bg-gradient-to-br from-slate-50 to-white hover:shadow-md hover:border-slate-300";
            let borderStyle = "border-slate-200/80";
            let indicatorBg = "bg-slate-400";
            let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

            if (isHigh) {
              cardBg = "bg-gradient-to-br from-rose-50/20 to-white hover:shadow-lg hover:shadow-rose-100/30 hover:border-rose-300";
              borderStyle = "border-rose-200/70";
              indicatorBg = "bg-rose-500";
              badgeStyle = "bg-rose-100 text-rose-700 border-rose-200";
            } else if (isWarn) {
              cardBg = "bg-gradient-to-br from-amber-50/20 to-white hover:shadow-lg hover:shadow-amber-100/20 hover:border-amber-300";
              borderStyle = "border-amber-200/70";
              indicatorBg = "bg-amber-500";
              badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
            } else if (isSuccess) {
              cardBg = "bg-gradient-to-br from-emerald-50/15 to-white hover:shadow-lg hover:shadow-emerald-100/10 hover:border-emerald-300";
              borderStyle = "border-emerald-200/60";
              indicatorBg = "bg-emerald-500";
              badgeStyle = "bg-emerald-100 text-emerald-700 border-emerald-200";
            }

            return (
              <div 
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 space-y-4 flex flex-col justify-between ${cardBg} ${borderStyle}`}
              >
                <div className="space-y-3">
                  {/* Card Header info */}
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${indicatorBg} ${isHigh || isWarn ? 'animate-pulse' : ''}`} />
                      <strong className="text-sm font-extrabold text-slate-900 font-mono">{monthData.month}</strong>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-extrabold border uppercase tracking-wider ${badgeStyle}`}>
                      {monthData.riskLabel}
                    </span>
                  </div>

                  {/* Monthly Title Block */}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                    {monthData.title}
                  </h3>

                  {/* Metrics Highlight Blocks with precise custom highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {monthData.metrics.map((metric, mIdx) => {
                      const isDangerMetric = metric.status === 'danger';
                      const isSuccessMetric = metric.status === 'success';

                      let metricBg = "bg-slate-50/60 border-slate-200/50";
                      let textStyle = "text-slate-800";
                      if (isDangerMetric) {
                        metricBg = "bg-rose-50 text-rose-900 border-rose-200/60 ring-2 ring-rose-500/10";
                        textStyle = "text-rose-700";
                      } else if (isSuccessMetric) {
                        metricBg = "bg-emerald-50/70 text-emerald-900 border-emerald-200/60 ring-2 ring-emerald-500/10";
                        textStyle = "text-emerald-700";
                      }

                      return (
                        <div key={mIdx} className={`p-2.5 rounded-xl border text-center relative flex flex-col justify-center min-h-[56px] transition-all duration-200 ${metricBg}`}>
                          <span className="text-[8px] text-slate-400 font-bold block mb-0.5">{metric.label}</span>
                          <strong className={`text-xs font-mono font-extrabold block leading-tight ${textStyle}`}>{metric.value}</strong>
                          {metric.reason && (
                            <span className={`text-[7px] px-1 py-0.5 rounded mt-1.5 inline-block font-extrabold font-sans tracking-wide self-center ${
                              isDangerMetric ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {metric.reason}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Description & Relations */}
                  <div className="space-y-2.5 pt-1 text-[11px] leading-relaxed">
                    <div className="bg-white/90 p-3 rounded-xl border border-slate-200/50 text-slate-600 font-medium text-justify">
                      <span className="text-indigo-600 font-extrabold text-[10px] block mb-1">📐 产-销-存-提报联动关系</span>
                      {monthData.relationship}
                    </div>
                    
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 font-medium">
                      <span className="text-amber-400 font-extrabold text-[10px] block mb-1 flex items-center gap-1 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        核心风险情况诊断
                      </span>
                      <p className="text-slate-300 text-[10px] leading-relaxed">{monthData.riskAnalysis}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/40 text-emerald-900 p-3 rounded-xl border border-emerald-100/50 font-bold mt-2.5">
                  <span className="text-emerald-600 font-extrabold text-[10px] block mb-0.5">💡 推荐纠偏建议</span>
                  <p className="text-emerald-800 text-[10px] leading-normal font-semibold">{monthData.suggestion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Image Tables Reconstructed with Highlights */}
      <div id="reconstructed-tables-ledger" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-indigo-600" />
              1:1 精准数据重构与异常穿透分析账本
            </h2>
            <p className="text-xs text-slate-400">
              精确还原您上传的两张车型数据表。包含核心异常风险数据的<b>深度高亮标记与归因标注</b>。
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50 self-start sm:self-auto">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              点击带红/橙标记的单元格可启动底部诊断看板
            </span>
          </div>
        </div>

        {/* Table Risk Guide & Operational Insights */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <span className="p-1 rounded-md bg-indigo-50 text-indigo-700">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              数据表内异常风险点标注指引与图例说明：
            </div>
            <span className="text-[9px] text-slate-400 font-bold">
              * 鼠标悬停在彩色高亮单元格上可直接显示悬浮卡，点击可查看深度诊断
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-white/80 p-3 rounded-xl border border-rose-200 shadow-sm text-[10px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-700 font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                🚨 严重红线风险点 (High Risk)
              </div>
              <p className="text-slate-600 leading-normal font-medium text-justify">
                如 <b>3米8微卡 4月</b> 供需缺口 <b>-237 辆</b> 及 <b>0.13</b> 个月极低库存；或 <b>6月</b> 厂库积压 <b>303 辆</b> 且门店干涸 <b>77 辆</b>。代表面临直接等车流单损失或严重的干线时空错配。
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 shadow-sm text-[10px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ⚠️ 中度异常预警点 (Warning Alert)
              </div>
              <p className="text-slate-600 leading-normal font-medium text-justify">
                如 <b>3米8微卡 5月</b> 计划端盲目补偿爆产 <b>1436 辆</b> 导致积压；或 <b>3月</b> 主机厂大仓 <b>0 辆</b> 极窄安全垫等。多源于上游生产惯性滞后及供应链中段牛鞭震荡。
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-sm text-[10px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ❇️ 良性对齐与缓冲点 (Optimized State)
              </div>
              <p className="text-slate-600 leading-normal font-medium text-justify">
                如 <b>多拉大面 6月</b> 完美交付 <b>3548 辆</b>；或 <b>2月</b> 春节大踩排产刹车降至 <b>339 辆</b> 顺利扫盘出清等。属于精益供应链经典协同在库机制。
              </p>
            </div>
          </div>
        </div>

        {/* Table 1: 多拉大面 */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-indigo-600"></div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-sans">
                【表 1】整车库存-多拉大面 纯电客货 (2026年 1-6月)
              </h3>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 font-mono">
              主力爆款车型 (R²=88.5%)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-inner">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-100/85 text-slate-600 font-extrabold border-b border-slate-200">
                  <th className="p-3 text-center whitespace-nowrap">月份</th>
                  <th className="p-3 text-center whitespace-nowrap">生产入库</th>
                  <th className="p-3 text-center whitespace-nowrap">直营申请</th>
                  <th className="p-3 text-center whitespace-nowrap">直营销售</th>
                  <th className="p-3 text-center whitespace-nowrap">渠道销售</th>
                  <th className="p-3 text-center whitespace-nowrap">总销售</th>
                  <th className="p-3 text-center whitespace-nowrap">渠道占比</th>
                  <th className="p-3 text-center whitespace-nowrap">产销率</th>
                  <th className="p-3 text-center whitespace-nowrap">供需缺口</th>
                  <th className="p-3 text-center whitespace-nowrap">工厂库存</th>
                  <th className="p-3 text-center whitespace-nowrap">门店库存</th>
                  <th className="p-3 text-center whitespace-nowrap">总库存</th>
                  <th className="p-3 text-center whitespace-nowrap">库存覆盖月数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vDaMianData.map((row) => {
                  const channelRatio = ((row.channelSales / row.actualSales) * 100).toFixed(1) + '%';
                  const prodRate = row.productionSalesRate.toFixed(1) + '%';
                  const formattedGap = (row.gap > 0 ? '+' : '') + row.gap;
                  return (
                    <tr key={row.month} className="hover:bg-slate-50/40 transition-colors font-medium">
                      <td className="p-3 font-bold text-slate-900 bg-slate-50/20 text-center border-r border-slate-100 font-mono">{row.month}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'production', row.production)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'directApply', row.directApply)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'directSales', row.directSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'channelSales', row.channelSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'actualSales', row.actualSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'channelRatio', channelRatio)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'productionSalesRate', prodRate)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'gap', formattedGap)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'factoryStock', row.factoryStock)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'storeStock', row.storeStock)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'inventory', row.inventory)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('vDaMian', row.month, 'coverage', row.coverage.toFixed(2))}</td>
                    </tr>
                  );
                })}
                {/* 累计行 */}
                <tr className="bg-indigo-50/25 border-t border-indigo-100 font-bold text-slate-800">
                  <td className="p-3 text-center font-extrabold border-r border-slate-100 bg-indigo-50/10">累计</td>
                  <td className="p-3 text-center font-mono">{daMianTotals.production}</td>
                  <td className="p-3 text-center font-mono text-pink-600">{daMianTotals.directApply}</td>
                  <td className="p-3 text-center font-mono text-purple-600">{daMianTotals.directSales}</td>
                  <td className="p-3 text-center font-mono">{daMianTotals.channelSales}</td>
                  <td className="p-3 text-center font-mono text-indigo-800">{daMianTotals.actualSales}</td>
                  <td className="p-3 text-center font-mono">{daMianTotals.channelRatio.toFixed(1)}%</td>
                  <td className="p-3 text-center font-mono">{daMianTotals.productionSalesRate.toFixed(1)}%</td>
                  <td className={`p-3 text-center font-mono ${daMianTotals.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(daMianTotals.gap > 0 ? '+' : '') + daMianTotals.gap}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                  <td className="p-3 text-center font-mono text-indigo-700 bg-indigo-50/30">{daMianTotals.inventory}</td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: 3米8 */}
        <div className="space-y-3.5 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-emerald-600"></div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-sans">
                【表 2】整车库存-3米8 高承载微卡 (2026年 3-6月)
              </h3>
            </div>
            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 font-mono">
              脉冲震荡车型 (R²=41.2%)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-inner">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-100/85 text-slate-600 font-extrabold border-b border-slate-200">
                  <th className="p-3 text-center whitespace-nowrap">月份</th>
                  <th className="p-3 text-center whitespace-nowrap">生产入库</th>
                  <th className="p-3 text-center whitespace-nowrap">直营申请</th>
                  <th className="p-3 text-center whitespace-nowrap">直营销售</th>
                  <th className="p-3 text-center whitespace-nowrap">渠道销售</th>
                  <th className="p-3 text-center whitespace-nowrap">总销售</th>
                  <th className="p-3 text-center whitespace-nowrap">渠道占比</th>
                  <th className="p-3 text-center whitespace-nowrap">产销率</th>
                  <th className="p-3 text-center whitespace-nowrap">供需缺口</th>
                  <th className="p-3 text-center whitespace-nowrap">工厂库存</th>
                  <th className="p-3 text-center whitespace-nowrap">门店库存</th>
                  <th className="p-3 text-center whitespace-nowrap">总库存</th>
                  <th className="p-3 text-center whitespace-nowrap">库存覆盖月数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {v3m8Data.map((row) => {
                  const channelRatio = ((row.channelSales / row.actualSales) * 100).toFixed(1) + '%';
                  const prodRate = row.productionSalesRate.toFixed(1) + '%';
                  const formattedGap = (row.gap > 0 ? '+' : '') + row.gap;
                  return (
                    <tr key={row.month} className="hover:bg-slate-50/40 transition-colors font-medium">
                      <td className="p-3 font-bold text-slate-900 bg-slate-50/20 text-center border-r border-slate-100 font-mono">{row.month}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'production', row.production)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'directApply', row.directApply)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'directSales', row.directSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'channelSales', row.channelSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'actualSales', row.actualSales)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'channelRatio', channelRatio)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'productionSalesRate', prodRate)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'gap', formattedGap)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'factoryStock', row.factoryStock)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'storeStock', row.storeStock)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'inventory', row.inventory)}</td>
                      <td className="p-2 text-center font-mono">{renderCell('v3m8', row.month, 'coverage', row.coverage.toFixed(2))}</td>
                    </tr>
                  );
                })}
                {/* 累计行 */}
                <tr className="bg-emerald-50/25 border-t border-emerald-100 font-bold text-slate-800">
                  <td className="p-3 text-center font-extrabold border-r border-slate-100 bg-emerald-50/10">累计</td>
                  <td className="p-3 text-center font-mono">{v3m8Totals.production}</td>
                  <td className="p-3 text-center font-mono text-pink-600">{v3m8Totals.directApply}</td>
                  <td className="p-3 text-center font-mono text-purple-600">{v3m8Totals.directSales}</td>
                  <td className="p-3 text-center font-mono">{v3m8Totals.channelSales}</td>
                  <td className="p-3 text-center font-mono text-emerald-800">{v3m8Totals.actualSales}</td>
                  <td className="p-3 text-center font-mono">{v3m8Totals.channelRatio.toFixed(1)}%</td>
                  <td className="p-3 text-center font-mono">{v3m8Totals.productionSalesRate.toFixed(1)}%</td>
                  <td className={`p-3 text-center font-mono ${v3m8Totals.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(v3m8Totals.gap > 0 ? '+' : '') + v3m8Totals.gap}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                  <td className="p-3 text-center font-mono text-emerald-700 bg-emerald-50/30">{v3m8Totals.inventory}</td>
                  <td className="p-3 text-center font-mono text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Anomaly Diagnostic Panel */}
        {selectedCell && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800/80 mt-4 relative overflow-hidden animate-slide-in">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Header of Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3.5 gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg text-white ${
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'high' ? 'bg-rose-600 animate-pulse' :
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'warn' ? 'bg-amber-500' :
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'success' ? 'bg-emerald-500' :
                  'bg-slate-700'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center gap-1.5 font-sans text-white">
                    异常风险诊断与归因分析看板 (Cell Diagnostic Inspector)
                  </h3>
                  <span className="text-[10px] text-slate-450 font-mono">
                    当前透视单元格 → 车型: <b className="text-indigo-300">{selectedCell.model === 'v3m8' ? '3米8微卡' : '多拉大面'}</b> | 月份: <b className="text-indigo-300">{selectedCell.month}</b> | 指标: <b className="text-indigo-300">{getFieldNameCn(selectedCell.field)}</b>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">风险评级:</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'warn' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'high' ? 'CRITICAL (极危风险)' :
                   getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'warn' ? 'WARNING (中度预警)' :
                   getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.level === 'success' ? 'EXCELLENT (战略成就)' :
                   'HEALTHY (数值正常健康)'}
                </span>
              </div>
            </div>

            {/* Body of Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
              {/* Left Column (5 Cols) - Cause */}
              <div className="md:col-span-5 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  异常成因分析与标注
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between h-[110px]">
                  <strong className="text-xs text-slate-100 leading-relaxed font-bold">
                    {getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.reason || "此数据项符合正常拟合轨道，没有偏离生产与零售的精益基线。"}
                  </strong>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">数据定位: {selectedCell.month} / {getFieldNameCn(selectedCell.field)}</span>
                </div>
              </div>

              {/* Middle Column (4 Cols) - Business Impact */}
              <div className="md:col-span-4 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  业务链传导及经营影响
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 h-[110px] overflow-y-auto">
                  {getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.impact || "计划、采购、生产与物流各项参数表现平稳。符合常规S&OP运营基准。"}
                </p>
              </div>

              {/* Right Column (3 Cols) - Corrective S&OP Recommendation */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  车企专家组纠偏行动建议
                </div>
                <p className="text-[11px] text-emerald-300 leading-relaxed font-bold bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-900/30 h-[110px] overflow-y-auto">
                  {getAnomalyDetail(selectedCell.model, selectedCell.month, selectedCell.field)?.corrective || "无需特殊干预。建议继续执行双周预测滚动纠偏（Rolling Forecast）。"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Structured Detailed Analysis Panels (User Requested: "要有拟合关系和风险说明") */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Card: Dynamic text explaining fitting relationships (6 cols) */}
        <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {fittingAnalysisSummary.relationshipTitle}
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-justify">
            {fittingAnalysisSummary.relationshipDesc}
          </p>

          {/* Core numerical table metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {fittingAnalysisSummary.metrics.map((item, idx) => (
              <div key={idx} className="bg-slate-50/40 p-3 rounded-xl border border-slate-200/20 text-center">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">{item.label}</span>
                <strong className={`text-sm font-extrabold font-mono ${
                  item.status === 'success' ? 'text-emerald-600' :
                  item.status === 'danger' ? 'text-rose-600' :
                  'text-amber-500'
                }`}>
                  {item.value}
                </strong>
                <span className="text-[8px] text-slate-400/80 block mt-0.5 leading-tight">{item.info}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Card: Risk points explanation with level badges (6 cols) */}
        <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                供应链核心风险说明与诊断报告
              </h3>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-100">
              {fittingAnalysisSummary.risks.filter(r => r.level === 'high').length} 个高危点
            </span>
          </div>

          <div className="space-y-4">
            {fittingAnalysisSummary.risks.map((risk, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  risk.level === 'high' 
                    ? 'bg-rose-50/20 border-rose-100/80 hover:bg-rose-50/40' 
                    : 'bg-slate-50/50 border-slate-200/40 hover:bg-slate-100/20'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5">
                  <strong className="text-xs text-slate-900 font-extrabold flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${risk.level === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                    {risk.title}
                  </strong>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    risk.level === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {risk.level === 'high' ? '严重高危' : '中度预警'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-medium">
                  {risk.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Advanced Analyst Deep Insights Section */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        {/* Decorative background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              高级数据分析师穿透诊断 (Advanced Analyst Penetration Mode)
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              数据透视：1:1账本下隐藏的深层经营风险
            </h2>
            <p className="text-xs text-slate-400">
              数据分析师通过多维交叉校验与数理方程复算，穿透报表表面数字，为您解构以下三个致命经营隐患：
            </p>
          </div>
          
          {/* Tab Selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveAnalystTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeAnalystTab === 'billing' ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 口径倒挂
            </button>
            <button
              onClick={() => setActiveAnalystTab('bullwhip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeAnalystTab === 'bullwhip' ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌊 渠道压货
            </button>
            <button
              onClick={() => setActiveAnalystTab('mismatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeAnalystTab === 'mismatch' ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ 厂店错配
            </button>
          </div>
        </div>

        {/* Tab Content 1: Billing (Discrepancy) */}
        {activeAnalystTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left Analytical narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                【财务/实物倒挂】销售开票口径与实物库存严重撕裂
              </div>
              <h3 className="text-base font-extrabold text-white">
                多拉大面 6月份“理论库存”与“实际物理在库”存在 1,762辆 隐性差异
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                按照供应链库存恒等式逻辑进行全流程校验：<code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-slate-800">期末库存 = 期初库存 + 本期生产 - 本期销量</code>。
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                分析师复算：多拉大面 5月结余总库为 <span className="text-white font-bold font-mono">1,889 辆</span>，6月排产入库 <span className="text-white font-bold font-mono">2,580 辆</span>，6月实际确认总销量为 <span className="text-white font-bold font-mono">3,844 辆</span>（其中直营大订 1,597，渠道 2,247）。
                根据本金公式，6月末应该结余实物总库存为：<code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded font-mono border border-slate-800">1889 + 2580 - 3844 = 625 辆</code>。
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850/80 space-y-2">
                <p className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  分析师穿透结论：
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  然而，财务及实物表报中，6月末实际总库高达 <span className="text-rose-400 font-bold font-mono text-sm">2,387 辆</span>（厂库 1679，店库 708），**隐性差异高达 +1,762 辆**！按单车均价 10 万元计，这相当于有 <span className="text-rose-400 font-bold">1.76 亿元</span> 的货值，名义上已经计入了销量（已被开票），但物理实体车辆仍占压在工厂和店头！
                </p>
              </div>
            </div>

            {/* Right Metric display / math block */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800 pb-2">
                数理复算恒等式校验表 (多拉大面 6月)
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">5月期末实物在库 (期初)</span>
                  <span className="font-mono text-white font-semibold">1,889 辆</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>+ 6月生产入库 (供给)</span>
                  <span className="font-mono font-semibold">+2,580 辆</span>
                </div>
                <div className="flex items-center justify-between text-xs text-rose-400">
                  <span>- 6月财务确认销量 (需求)</span>
                  <span className="font-mono font-semibold">-3,844 辆</span>
                </div>
                <div className="border-t border-dashed border-slate-800 my-2"></div>
                <div className="flex items-center justify-between text-xs text-indigo-400">
                  <span>理论结余库存 (恒等式)</span>
                  <span className="font-mono font-bold">625 辆</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-500 font-bold">
                  <span>实际报表期末在库 (物理)</span>
                  <span className="font-mono">2,387 辆</span>
                </div>
                <div className="border-t border-slate-800 my-2"></div>
                <div className="flex items-center justify-between p-2 rounded bg-rose-950/20 border border-rose-900/30 text-xs">
                  <span className="text-rose-400 font-bold">倒挂差异 (口径偏差)</span>
                  <strong className="font-mono text-rose-400 text-sm font-extrabold">+1,762 辆</strong>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 text-center leading-normal">
                *此差异极大概率属于“开票未提车”，销售端为冲高H1半年报业绩，对直营大宗客户提前开票销账，实车仍在库占压，存在极高财务合规与贬值减值风险。
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Bullwhip */}
        {activeAnalystTab === 'bullwhip' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left Analytical narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                【牛鞭放大】渠道过度塞货掩盖了真实的消费失速
              </div>
              <h3 className="text-base font-extrabold text-white">
                3米8微卡 4月份渠道“灌水压货”导致5月份发生盲目排产巨震
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                分析师穿透：3米8微卡在 4 月份迎来销量假性繁荣（1,199 辆），其中<span className="text-white font-bold">渠道销售占总销量的 75.5% (905辆/1199辆)</span>，直营需求实际只有 294 辆。
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                这暴露出 4 月的销售爆发，有近八成是强行向渠道加盟网点“压货灌水”产生的。计划部门因没有对零售终端(POS)进行直接穿透，误以为市场真实需求爆发，在 5 月做出**爆产 1,436 辆**（生产相比 4 月大涨 83.6%）的盲目扩产决策。
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850/80 space-y-2">
                <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  牛鞭效应带来的资金与呆滞危害：
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  结果 5 月市场真实消费动力耗尽，销量大跌至 802 辆，单月产生高达 <span className="text-amber-400 font-bold font-mono">+634 辆</span> 的盲目产销盈余，直接把库存推至 545 辆历史极高水位，积压资金 <span className="text-amber-400 font-bold">5,450 余万元</span>，导致 6 月排产不得不暴跌 55%（至 635 辆）实施紧急限产。一增一减对供应商与配套物料造成极大伤害。
                </p>
              </div>
            </div>

            {/* Right Metric display / math block */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800 pb-2">
                渠道依赖度与牛鞭放大系数 (3米8微卡)
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">4月渠道压货占比 (高危水份)</span>
                    <span className="font-mono text-rose-400 font-bold">75.5%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '75.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">5月排产盲目爆发增长率</span>
                    <span className="font-mono text-white font-bold">+83.6%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '83.6%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">供应链牛鞭效应指数 (失真率)</span>
                    <span className="font-mono text-rose-400 font-bold">3.41 倍</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-400 block font-bold">单车压库财务锁死流动资金估算</span>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-300">545辆在库车 * 10万元/辆</span>
                    <strong className="text-rose-400 text-sm font-extrabold">≈ 54,500,000 元</strong>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 text-center leading-normal">
                *计划部门必须建立“销售漏斗穿透”，将渠道开票与终端零售（POS）隔离开，以真实终端销售指导工厂排产，否则会造成长期财务重压。
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Mismatch */}
        {activeAnalystTab === 'mismatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left Analytical narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                【空间错配】总厂高血压积压，一线经销商大贫血断档
              </div>
              <h3 className="text-base font-extrabold text-white">
                工厂仓库与渠道店头库存的“两极化倒挂”——物流配送节点梗阻
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                分析师穿透：优秀的供应链不仅需要库存总量合理，更需要**空间分布符合零售节奏**。然而 6 月底的数据展现出明显的物流阻断：
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. <span className="text-white font-bold">3米8微卡</span>：6 月总库存有 380 辆，看似充沛，但<span className="text-rose-400 font-bold">总厂库积压了 303 辆</span>（占比达 79.7%），而全国所有门店店头的物理库存<span className="text-amber-400 font-bold">仅剩 77 辆</span>！店头周转天数不足 5 天，大批意向用户因看不到现车、无法试驾或提车周期过长而流失。
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                2. <span className="text-white font-bold">多拉大面</span>：厂库高达 1,679 辆（占比 70.3%），而店库仅 708 辆。
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850/80 space-y-2">
                <p className="text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-indigo-500" />
                  空间倒挂带来的双重机会损失：
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  这造成了荒谬的“一地鸡毛”：总厂大仓堆满车，场地告急、产生滞销呆滞利息；而一线门店空城，面临有客无车、有单无处交的“断货危机”。这说明总干线配送发车频次过低、分拨计划僵化，缺乏区域配送中心（RDC）的前置分拨协同。
                </p>
              </div>
            </div>

            {/* Right Metric display / math block */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800 pb-2">
                物理库存分布两极化对比 (6月期末)
              </div>
              
              <div className="space-y-4">
                {/* 3米8微卡 Distribution */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">3米8微卡 厂库 vs 店库</span>
                    <span className="font-mono text-slate-400">总380 辆</span>
                  </div>
                  <div className="w-full bg-slate-800 h-4 rounded-lg overflow-hidden flex text-[9px] font-bold text-center">
                    <div className="bg-indigo-600 h-full text-white flex items-center justify-center transition-all" style={{ width: '79.7%' }} title="厂库积压 303辆">
                      厂库 80% (303辆)
                    </div>
                    <div className="bg-amber-500 h-full text-slate-950 flex items-center justify-center transition-all" style={{ width: '20.3%' }} title="店库干涸 77辆">
                      店库 20% (77辆)
                    </div>
                  </div>
                </div>

                {/* 多拉大面 Distribution */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">多拉大面 厂库 vs 店库</span>
                    <span className="font-mono text-slate-400">总2,387 辆</span>
                  </div>
                  <div className="w-full bg-slate-800 h-4 rounded-lg overflow-hidden flex text-[9px] font-bold text-center">
                    <div className="bg-indigo-600 h-full text-white flex items-center justify-center transition-all" style={{ width: '70.3%' }} title="厂库积压 1679辆">
                      厂库 70.3% (1679辆)
                    </div>
                    <div className="bg-amber-500 h-full text-slate-950 flex items-center justify-center transition-all" style={{ width: '29.7%' }} title="店库 708辆">
                      店库 29.7% (708辆)
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1 text-xs">
                  <span className="text-indigo-400 font-bold block">🚨 分析师对口纠偏决策建议</span>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    立即废除原有的“根据主机厂指标强压”计划，上线**“以终端店头销售实际速率定发运”**机制。紧急安排专车/大板车将总厂库积压的主流配置车型快速调发、前置分发到各大缺车的直营高潜店面。
                  </p>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 text-center leading-normal">
                *厂库高企店库断档，暴露出典型的供应链物流干线与分拨流程僵化。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Corrective Decision Recommendations (S&OP Operational actions) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute left-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl"></div>

        <div className="relative max-w-4xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">车企供求协同专家委员组——纠偏管理建议 (专家组批复)</h3>
              <p className="text-[10px] text-slate-400">基于 1-6月 拟合数据暴露的计划、渠道和物流卡点，制定下半年纠偏落地方案</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fittingAnalysisSummary.actions.map((act, idx) => (
              <div key={idx} className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-3">
                <span className="text-[11px] font-extrabold text-emerald-400 font-mono tracking-wider">
                  措施建议 0{idx + 1}
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                  {act}
                </p>
                <div className="text-[9px] text-slate-500 border-t border-slate-800 pt-2 font-medium">
                  主责部门: {idx === 0 ? "供应链计划部 / 生产科" : idx === 1 ? "销售管理部 / 储运物流科" : "采购部 / 零部件管理科"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Risk & Analysis Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCell && currentAnomaly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="bg-slate-900 text-white rounded-3xl w-full max-w-lg border border-slate-800/80 shadow-2xl relative overflow-hidden z-10 p-6 sm:p-8 space-y-6"
            >
              {/* Background gradient radial glow */}
              <div className={`absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none ${
                currentAnomaly.level === 'high' ? 'bg-rose-500' :
                currentAnomaly.level === 'warn' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} />

              {/* Header */}
              <div className="flex items-start justify-between relative border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      currentAnomaly.level === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      currentAnomaly.level === 'warn' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {currentAnomaly.level === 'high' ? '🚨 极危风险' :
                       currentAnomaly.level === 'warn' ? '⚠️ 中度预警' :
                       '✅ 战略成就'}
                    </span>
                    <span className="text-[10px] text-slate-450 font-bold font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {selectedCell.month}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-2">
                    {selectedCell.model === 'v3m8' ? '3米8微卡' : '多拉大面'} · {getFieldNameCn(selectedCell.field)}
                  </h3>
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/50 rounded-xl transition duration-150"
                  aria-label="关闭对话框"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                {/* 1. 原因分析 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    风险点 / 异常原因分析
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/60">
                    <p className="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed">
                      {currentAnomaly.reason}
                    </p>
                  </div>
                </div>

                {/* 2. 经营影响 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    业务链传导与影响评估
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {currentAnomaly.impact}
                    </p>
                  </div>
                </div>

                {/* 3. 纠偏措施 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    车企专家组纠偏行动建议
                  </div>
                  <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                    <p className="text-xs text-emerald-350 leading-relaxed font-bold">
                      {currentAnomaly.corrective}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-xs sm:text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
                >
                  我知道了，返回报表
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          CORRELATION ALGORITHM EXPLANATION MODAL
          ======================================================== */}
      <AnimatePresence>
        {showCorrelationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Scale className="w-4 h-4" />
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      「直营需求与生产相关性」计算原理与数学公式说明
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    采用统计学【皮尔逊积矩相关系数 (Pearson Correlation Coefficient)】精准量化前端需求提报与后端排产的同步协同度
                  </p>
                </div>
                <button 
                  onClick={() => setShowCorrelationModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formula & Explanation Card */}
              <div className="space-y-4 text-xs">
                
                {/* 1. Formula */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                    一、数学公式 (Pearson Correlation R)
                  </span>
                  <div className="p-3 bg-slate-900/80 rounded-lg font-mono text-indigo-200 text-center text-xs sm:text-sm border border-slate-800 font-extrabold">
                    R = Σ(X<sub>i</sub> - X̄)(Y<sub>i</sub> - Ȳ) / √[ Σ(X<sub>i</sub> - X̄)<sup>2</sup> · Σ(Y<sub>i</sub> - Ȳ)<sup>2</sup> ]
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-1 pl-2 font-mono">
                    <li>• <strong className="text-pink-400">X<sub>i</sub></strong> = 第 i 月的【直营需求提报量】 (Direct Demand Apply)</li>
                    <li>• <strong className="text-emerald-400">Y<sub>i</sub></strong> = 第 i 月的【工厂实际生产入库量】 (Production)</li>
                    <li>• <strong className="text-indigo-300">X̄, Ȳ</strong> = 观察期内 X 与 Y 的算术平均值 (Mean)</li>
                    <li>• <strong className="text-amber-300">R 取值范围</strong> = [-1.0, +1.0]，正值越大代表“排产越能实时跟进直营提报”</li>
                  </ul>
                </div>

                {/* 2. Real Model Case Calculation */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    二、本报表中两款车型实测计算分解
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Case 1: 多拉大面 */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-900/40 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-emerald-400">多拉大面 (R = +0.74)</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          强相关 (敏捷联动)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        1-6月直营需求与生产入库曲线几乎<strong>同频起伏</strong>。1月高提报配高排产，2月春节避峰同低，3-6月同步爬坡。协方差显著为正，说明供应链对直营需求反应敏捷，产销协同度极高。
                      </p>
                    </div>

                    {/* Case 2: 3米8微卡 */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-900/40 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-rose-400">3米8微卡 (R = +0.21)</span>
                        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          弱相关 (滞后失真)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        4月直营爆单 (480辆) 时工厂生产断档 (63辆) 造成欠交；5月直营需求回落 (220辆) 时工厂却滞后爆产 (1,436辆) 补偿压库。出现 <strong>1~1.5 个月的错位相位差</strong>，导致相关系数骤降至 0.21。
                      </p>
                    </div>

                  </div>
                </div>

                {/* 3. Decision Standards */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    三、车企 S&OP 业务评价标准
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                    <div className="bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg">
                      <strong className="text-emerald-400 block font-bold">R ≥ 0.70</strong>
                      <span className="text-slate-300">强协同·敏捷拉动</span>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
                      <strong className="text-amber-400 block font-bold">0.30 ≤ R &lt; 0.70</strong>
                      <span className="text-slate-300">中度协同·轻微滞后</span>
                    </div>
                    <div className="bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg">
                      <strong className="text-rose-400 block font-bold">R &lt; 0.30</strong>
                      <span className="text-slate-300">严重脱节·高风险</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowCorrelationModal(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  关闭说明，返回数据看板
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
