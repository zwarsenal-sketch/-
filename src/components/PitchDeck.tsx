/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Layers, 
  RefreshCw, 
  CheckSquare, 
  ArrowRight, 
  ShieldAlert, 
  Car, 
  Package, 
  Database, 
  LineChart, 
  Bell, 
  Cpu, 
  TrendingUp, 
  FileCheck, 
  RotateCcw, 
  UserCheck, 
  Search, 
  Sliders, 
  CheckCircle2, 
  Building2, 
  Store, 
  ChevronRight,
  GitMerge,
  Workflow,
  AlertTriangle,
  Zap,
  Activity,
  X,
  ExternalLink,
  Eye,
  Maximize2,
  Check
} from 'lucide-react';

interface FeatureModalItem {
  step: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  addedFeature: string;
  tabName: string;
  tabKey: string;
  asIsPainPoint: string;
  toBeCapability: string;
  highlights: string[];
  previewType: 'fitting' | 'scenario' | 'procurement' | 'vehicleStock' | 'partsStock' | 'vehicleFitting';
}

const LIFECYCLE_STEPS: FeatureModalItem[] = [
  {
    step: '01',
    name: '终端销售',
    desc: '真实订单与预测拟合',
    icon: Store,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    addedFeature: '终端真实订单与销量趋势拟合模型',
    tabName: 'Tab 5 销量拟合与需求预测',
    tabKey: 'fitting',
    asIsPainPoint: '依赖离线 Excel 手工推算，部门割裂且数据滞后，无法捕捉终端真实现金定金订单与退单波动。',
    toBeCapability: '结合历史交付、客户定金订单与市场热度，基于指数平滑算法实时拟合未来 1-3 个月销量趋势。',
    highlights: [
      '多种动态拟合算法（指数平滑与季节回归）',
      '自动推算月度/季度销售目标缺口与预警指标',
      '实时反哺向【02 需求上报】与【03 生产排产】传导'
    ],
    previewType: 'fitting'
  },
  {
    step: '02',
    name: '需求上报',
    desc: '实时汇总与缺口推算',
    icon: TrendingUp,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    addedFeature: '供需缺口动态推算与 DOC 库龄覆盖模拟',
    tabName: 'Tab 2 场景模拟器 (供需缺口)',
    tabKey: 'scenario',
    asIsPainPoint: '缺乏统一数据视角，大区上报需求虚高，无法精准掌控安全库存周转天数 (DOC)。',
    toBeCapability: '自动汇聚全国订单，扣除在途/在库车辆，计算 7~30 天缺口预警水位线与 DOC 演变。',
    highlights: [
      '实时计算全国及各区域 7-30 天车辆供需缺口',
      '支持交互式增速参数调节与 DOC 覆盖天数推演',
      '根据安全库存红线提前向供应链触发风险告警'
    ],
    previewType: 'scenario'
  },
  {
    step: '03',
    name: '生产排产',
    desc: '产销平滑比与排产卡口',
    icon: Cpu,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    addedFeature: '产销匹配度校验与排产审批前置卡口',
    tabName: 'Tab 6 产销率拟合与排产评审',
    tabKey: 'vehicleFitting',
    asIsPainPoint: '热爆时脱销，热度退去后轰高产能，造成生产慢半拍与工厂大面积盲目爆产。',
    toBeCapability: '排产申请前自动比对产销匹配度，偏离率 >15% 时硬卡口直接打回拦截。',
    highlights: [
      '产销匹配度与过量排产偏离率自动比对',
      '嵌入排产审批硬卡口，无需求排产禁止提交系统',
      '平滑均衡工厂产能，消除供应链“牛鞭效应”'
    ],
    previewType: 'vehicleFitting'
  },
  {
    step: '04',
    name: '零部件采购',
    desc: 'BOM需求算式与硬卡口',
    icon: Package,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    addedFeature: '采购硬卡口插件与 BOM 算式推荐',
    tabName: 'Tab 1 采购审批硬卡口 & Tab 4 零部件看板',
    tabKey: 'procurementPlugin',
    asIsPainPoint: '采购凭阶梯折扣经验下单，无 BOM 匹配校验，长库龄积压数千万元呆滞物料。',
    toBeCapability: '嵌入 OA/采购审批插件，强制按“需求+安全库-当前库-在途库”推送建议采购量并卡关。',
    highlights: [
      '嵌入式采购审批插件，强制执行需求算式',
      '超出覆盖天数/预算直接系统打回，不可绕过',
      '高价值三电（电池/电驱/电控）与底盘物料 100% 校验'
    ],
    previewType: 'procurement'
  },
  {
    step: '05',
    name: '生产下线',
    desc: 'BOM欠料预警与按需制造',
    icon: Workflow,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    addedFeature: '装车计划倒推与零部件欠料预警水位',
    tabName: 'Tab 4 零部件看板 & Tab 2 缺料推算',
    tabKey: 'partsStock',
    asIsPainPoint: '关键零部件欠料停产与辅料极度过剩并存，产线频繁拉停，生产计划紊乱。',
    toBeCapability: '按车装计划倒推 10 天预警水位线，确保零停工且零多余物料沉淀。',
    highlights: [
      '提前 10 天倒推 BOM 缺料水位线，消除拉停风险',
      '呆滞物料（>90天未动用）可视化预警与代用提示',
      '下线整车自动精准匹配待交付客户订单'
    ],
    previewType: 'partsStock'
  },
  {
    step: '06',
    name: '整车入库',
    desc: 'VIN一车一档与全景透视',
    icon: Building2,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    addedFeature: '整车 VIN 码一车一档与在库全景透视',
    tabName: 'Tab 3 整车库存看板 (OMS6.1)',
    tabKey: 'vehicleStock',
    asIsPainPoint: '总库堆满数百台车辆放不下，全国门店却无样车，信息不透，厂店错位。',
    toBeCapability: '穿透总厂库、中转库、门店库，一车一档掌握 VIN 码、配置与真实在库天数。',
    highlights: [
      '整车 VIN 码一车一档，全路径穿透三种形态仓库',
      '0-30天/31-60天/90+天库龄结构与红黄牌告警',
      '解决“厂降店旱”配比矛盾，全流程在线可视化'
    ],
    previewType: 'vehicleStock'
  },
  {
    step: '07',
    name: '库存调拨',
    desc: '目标水位拉动与超期去化',
    icon: Car,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    addedFeature: '目标区域水位拉动与超期车责任派单',
    tabName: 'Tab 3 整车库存 & Tab 4 规则设置',
    tabKey: 'vehicleStock',
    asIsPainPoint: '调拨僵化缺乏需求拉动，超期车无人跟进促销，车龄越长贬值越高，造成坏账死锁。',
    toBeCapability: '按区域订单配发激活“拉动式调拨”；库龄 >60 天车辆自动派发去化任务至责任人。',
    highlights: [
      '按区域缺口与销存比，智能计算最佳调拨路线',
      '长库龄整车自动触发 5 步责任链推送到区域经理',
      '联动促销折扣与二次跨区调拨，加速资金变现'
    ],
    previewType: 'vehicleStock'
  }
];

export default function PitchDeck() {
  const [activeTab, setActiveTab] = useState<'all' | 'solution' | 'overview' | 'compare'>('all');
  const [activeToBeStage, setActiveToBeStage] = useState<number>(0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              立项汇报 / Project Initiation Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              造车库存经营预警系统立项方案
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              围绕整车与零部件建立统一的库存健康分析、阈值预警与业务闭环能力，实现需求驱动采购排产，全链路资金提效。
            </p>
          </div>

          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              全部架构
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'solution' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              一、解决思路
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              二、项目概述
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'compare' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              三、现状 vs 优化后对比
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 一：解决思路 */}
      {(activeTab === 'all' || activeTab === 'solution') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-lg shadow-sm">
                SECTION 01
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                一、解决思路
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              Core Methodologies & Operating Logic
            </span>
          </div>

          {/* 总体思路卡片 */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 shadow-md border border-emerald-500/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  总体思路 / Core Strategy
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  用销售需求驱动生产和采购，用库存健康度判断经营风险，用预警机制推动业务闭环。
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  需求驱动
                </span>
                <span className="text-slate-500">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  健康诊断
                </span>
                <span className="text-slate-500">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  闭环管控
                </span>
              </div>
            </div>
          </div>

          {/* Item 1: 建立统一库存视角 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">1</div>
              <h3 className="text-base font-extrabold text-slate-900">
                建立统一库存视角
              </h3>
              <span className="text-xs text-slate-400">（全链路数据归集与统一全景）</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* 整车库存视角 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-indigo-100/80 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                      <Car className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">1.1 整车库存视角</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    成品车多维看板
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  穿透从工厂大仓到终端门店的全路径整车实物与账面分布：
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'VIN 唯一码', desc: '一车一档精细追踪' },
                    { label: '车型配置', desc: '款型/颜色/选装包' },
                    { label: '区域布局', desc: '华东/华南/西北等' },
                    { label: '门店分布', desc: '直营店/加盟经销商' },
                    { label: '仓库节点', desc: '总厂库/中转库/店库' },
                    { label: '库龄水位', desc: '超期/常规/安全' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 零部件库存视角 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-emerald-100/80 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">1.2 零部件库存视角</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    物料台账与BOM
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  精准打通多层级 BOM 结构，透视核心物料周转与沉淀：
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: '物料编码', desc: 'P001~P999 唯一物料' },
                    { label: 'BOM 用量', desc: '单车配套用量比例' },
                    { label: '供应商', desc: '供货周期与产能' },
                    { label: '库龄分布', desc: '超60/90天呆滞' },
                    { label: '在途/可用', desc: '实际可动用库存' },
                    { label: '库存数量', desc: '实物盘点与账面' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: 建立需求驱动的库存判断模型 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">2</div>
              <h3 className="text-base font-extrabold text-slate-900">
                建立需求驱动的库存判断模型
              </h3>
              <span className="text-xs text-slate-400">（算式推演，精准预判供需缺口）</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Formula 1 */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-md">
                    模型 2.1：需求预测算式
                  </span>
                  <span className="text-[10px] text-indigo-600 font-extrabold">Demand Forecasting</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700 bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800">销量趋势</span>
                  <span className="text-indigo-500 font-extrabold">+</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800">销售订单</span>
                  <span className="text-indigo-500 font-extrabold">+</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800">生产计划</span>
                  <span className="text-indigo-500 font-extrabold">+</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-800">BOM 用量</span>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <div className="text-xs font-extrabold text-indigo-700 bg-indigo-100/80 px-3 py-1.5 rounded-lg border border-indigo-200">
                    ➔ 预测整车需求 / 零部件需求
                  </div>
                </div>
              </div>

              {/* Formula 2 */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                    模型 2.2：补库/采购算式
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold">Replenishment Calc</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700 bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded">预测需求</span>
                  <span className="text-emerald-500 font-extrabold">+</span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded">安全库存</span>
                  <span className="text-rose-500 font-extrabold">-</span>
                  <span className="px-2 py-1 bg-rose-50 text-rose-800 rounded">当前库存</span>
                  <span className="text-rose-500 font-extrabold">-</span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded">在途库存</span>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  <div className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200">
                    ➔ 建议补库量 / 建议采购量
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: 把预警嵌入业务流程 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">3</div>
                <h3 className="text-base font-extrabold text-slate-900">
                  把预警嵌入业务流程
                </h3>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                不只在看板展示，更硬性拦截业务节点
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: '采购审批',
                  tag: '前置卡口 01',
                  color: 'border-blue-200 bg-blue-50/30 text-blue-900',
                  iconColor: 'bg-blue-600',
                  action: '采购前校验数量是否匹配需求、库存、BOM',
                  detail: '防止采购惯性过采，避免零部件入库即变呆滞'
                },
                {
                  title: '排产审批',
                  tag: '前置卡口 02',
                  color: 'border-indigo-200 bg-indigo-50/30 text-indigo-900',
                  iconColor: 'bg-indigo-600',
                  action: '排产前校验产销率、供需缺口、库龄',
                  detail: '避免工厂盲目生产，控制整车DOC覆盖天数'
                },
                {
                  title: '库存调拨',
                  tag: '动态调配 03',
                  color: 'border-amber-200 bg-amber-50/30 text-amber-900',
                  iconColor: 'bg-amber-600',
                  action: '调拨前提示目标区域库存水位',
                  detail: '破解“厂里缺货/店里呆滞”或南北极错位梗阻'
                },
                {
                  title: '门店库存管理',
                  tag: '终端响应 04',
                  color: 'border-emerald-200 bg-emerald-50/30 text-emerald-900',
                  iconColor: 'bg-emerald-600',
                  action: '超期库存自动预警至门店/城市经理',
                  detail: '推动终端优先促销消化长库龄车，及时变现'
                }
              ].map((node, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${node.color} space-y-3 flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                        [ ] {node.title}
                      </span>
                      <span className="text-[10px] font-bold opacity-75">{node.tag}</span>
                    </div>
                    <div className="text-xs font-extrabold leading-snug">
                      {node.action}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                    💡 {node.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item 4: 形成预警闭环 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">4</div>
                <h3 className="text-base font-extrabold text-slate-900">
                  形成预警闭环 (5步闭环机制)
                </h3>
              </div>
              <span className="text-xs text-slate-400">五步闭环流程，实现问题发生到解决的完整追踪</span>
            </div>

            {/* Visual Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {[
                {
                  step: '1',
                  title: '识别风险',
                  sub: '规则触发预警',
                  desc: '设置阈值，自动捕获过采/缺料/长库龄/资金占用异常',
                  icon: AlertTriangle,
                  color: 'bg-rose-50 border-rose-200 text-rose-700'
                },
                {
                  step: '2',
                  title: '推送责任人',
                  sub: '精准责任派发',
                  desc: '按区域/车型/物料自动路由至采购员、计划员、城市经理',
                  icon: UserCheck,
                  color: 'bg-blue-50 border-blue-200 text-blue-700'
                },
                {
                  step: '3',
                  title: '记录处理动作',
                  sub: '业务动作跟进',
                  desc: '记录调拨、降价促销、暂停排产、采购退单等具体举措',
                  icon: FileCheck,
                  color: 'bg-amber-50 border-amber-200 text-amber-700'
                },
                {
                  step: '4',
                  title: '跟踪结果',
                  sub: '水位动态回归',
                  desc: '持续追踪库存水位是否成功回归合理区间，评估改善',
                  icon: Activity,
                  color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
                },
                {
                  step: '5',
                  title: '复盘预警准确率',
                  sub: '阈值持续优化',
                  desc: '复盘规则触发准确度，动态迭代优化阈值参数',
                  icon: RotateCcw,
                  color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-2 relative flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          {item.step}
                        </span>
                        <IconComp className="w-4 h-4 opacity-75" />
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 mt-2">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight pt-2 border-t border-slate-200/60">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 二：项目概述 */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600 text-white font-black text-xs rounded-lg shadow-sm">
                SECTION 02
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                二、项目概述
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              Project Architecture & Vision Summary
            </span>
          </div>

          {/* 1. 方案概述 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">1</div>
              <h3 className="text-base font-extrabold text-slate-900">
                方案概述
              </h3>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl space-y-2 border border-slate-800">
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                造车库存经营预警系统建设目标：
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                本项目建议建设<b>“造车库存经营预警系统”</b>，围绕<b>整车</b>和<b>零部件</b>建立统一的<b>库存健康分析</b>、<b>阈值预警</b>和<b>业务闭环能力</b>。
              </p>
            </div>
          </div>

          {/* 2. 业务层级 (Visual Hierarchy Diagram / 层级图) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm">2</div>
                <h3 className="text-base font-extrabold text-slate-900">
                  业务层级架构图 (Business Tier Hierarchy)
                </h3>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-extrabold">
                四层递进式架构设计
              </span>
            </div>

            {/* Hierarchical Stack Diagram */}
            <div className="space-y-3 max-w-5xl mx-auto pt-2">
              
              {/* Layer 4: 应用层 */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-md space-y-2 border border-emerald-500/40 transform hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-black tracking-wide uppercase">
                      Layer 4
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-200" />
                      应用层（业务嵌入与动作执行）
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-100 bg-emerald-700/50 px-2.5 py-0.5 rounded-full">
                    前端业务流卡点
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
                  📌 <b>核心功能：</b>嵌入<b>采购审批</b>、<b>排产评审</b>、<b>库存调拨</b>、<b>促销策略</b>等业务动作。
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-center -my-1.5 relative z-10">
                <div className="bg-slate-200 text-slate-600 px-3 py-0.5 rounded-full text-[10px] font-black border border-slate-300 shadow-2xs">
                  ▲ 驱动业务动作 / Business Action
                </div>
              </div>

              {/* Layer 3: 预警层 */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md space-y-2 border border-amber-400/40 transform hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-black tracking-wide uppercase">
                      Layer 3
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-200" />
                      预警层（风险识别与阈值触警）
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-100 bg-amber-700/50 px-2.5 py-0.5 rounded-full">
                    阈值与异常告警
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs sm:text-sm text-amber-50 leading-relaxed font-medium">
                  📌 <b>核心功能：</b>对<b>整车积压 / 缺货</b>、<b>零部件过采 / 缺料</b>、<b>资金占用</b>等进行实时预警。
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-center -my-1.5 relative z-10">
                <div className="bg-slate-200 text-slate-600 px-3 py-0.5 rounded-full text-[10px] font-black border border-slate-300 shadow-2xs">
                  ▲ 算法判定结果 / Model Calculation
                </div>
              </div>

              {/* Layer 2: 分析层 */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl shadow-md space-y-2 border border-indigo-400/40 transform hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-black tracking-wide uppercase">
                      Layer 2
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-indigo-200" />
                      分析层（算法模型与规则计算）
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-100 bg-indigo-700/50 px-2.5 py-0.5 rounded-full">
                    计算与评估引擎
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs sm:text-sm text-indigo-50 leading-relaxed font-medium">
                  📌 <b>核心功能：</b>建立<b>整车库存健康模型</b>和<b>零部件采购阈值模型</b>。
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-center -my-1.5 relative z-10">
                <div className="bg-slate-200 text-slate-600 px-3 py-0.5 rounded-full text-[10px] font-black border border-slate-300 shadow-2xs">
                  ▲ 数据供给与拉通 / Raw Data Pipeline
                </div>
              </div>

              {/* Layer 1: 数据层 */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-2 border border-slate-700 transform hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-black tracking-wide uppercase">
                      Layer 1
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-300" />
                      数据层（统一数据底座）
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-700/60 px-2.5 py-0.5 rounded-full">
                    数据打通与归集
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  📌 <b>核心功能：</b>打通<b>销量</b>、<b>订单</b>、<b>生产</b>、<b>BOM</b>、<b>库存</b>、<b>采购</b>、<b>在途</b>、<b>售后消耗</b>等全链路数据。
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SECTION 三：现状 vs 优化后 (汽车生命周期业务流转视角) */}
      {(activeTab === 'all' || activeTab === 'compare') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-600 text-white font-black text-xs rounded-lg shadow-sm">
                SECTION 03
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                三、现状 (As-Is) vs 优化后 (To-Be) 汽车生命周期业务流转对比
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              End-to-End Vehicle Lifecycle Process Flow
            </span>
          </div>

          {/* Intro Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-500/30 uppercase">
                <Workflow className="w-3.5 h-3.5 text-amber-400" />
                业务流转对比 (Process Pipeline Comparison)
              </div>
              <h3 className="text-base font-extrabold text-white">
                全生命周期重塑：从“链路断裂与被动救火”到“需求驱动与强卡口闭环”
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                ✕ 现状：无卡口/环节脱节
              </span>
              <span className="text-slate-500 font-bold">➔</span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                ✓ 优化后：需求拉动/强卡口闭环
              </span>
            </div>
          </div>

          {/* VISUAL PROCESS PIPELINE COMPARISON (4 STAGES & LIFECYCLE FLOW) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-8">
            
            {/* 7-STEP LIFECYCLE FLOW */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2">
                    汽车全生命周期 · 7大步骤串联流程
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  终端销售驱动全链条敏捷响应
                </span>
              </div>

              {/* 7 Sequential Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 relative pt-1">
                {[
                  { step: '01', name: '终端销售', desc: '真实订单/预测拟合', icon: Store, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                  { step: '02', name: '需求上报', desc: '实时汇总与缺口算式', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
                  { step: '03', name: '生产排产', desc: '产销平滑与排产卡口', icon: Cpu, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
                  { step: '04', name: '零部件采购', desc: 'BOM需求算式与硬卡口', icon: Package, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
                  { step: '05', name: '生产下线', desc: 'BOM欠料预警与按需制造', icon: Workflow, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                  { step: '06', name: '整车入库', desc: 'VIN码在库全景透视', icon: Building2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                  { step: '07', name: '库存调拨', desc: '目标水位拉动与去化', icon: Car, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' }
                ].map((stg, idx) => {
                  const IconComp = stg.icon;
                  return (
                    <div key={idx} className="relative group">
                      <div className={`p-2.5 rounded-xl border ${stg.color} flex flex-col items-center text-center space-y-1.5 bg-slate-800/80 h-full justify-between`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-mono font-bold text-slate-400">STEP {stg.step}</span>
                          <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                        <span className="font-extrabold text-xs text-white tracking-tight">{stg.name}</span>
                        <span className="text-[10px] text-slate-300 font-medium leading-tight">{stg.desc}</span>
                      </div>
                      
                      {/* Arrow indicator between steps */}
                      {idx < 6 && (
                        <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SVG LOOP BACK DASHED ARROW (07 库存调拨 ➔ 01 终端销售 逆向传导) */}
              <div className="relative my-3 pt-2">
                <div className="hidden md:block relative">
                  <svg className="w-full h-10 text-emerald-400" viewBox="0 0 800 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 735 8 C 735 34, 65 34, 65 8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="5 4" 
                      className="animate-pulse opacity-80"
                    />
                    <polygon points="55,8 68,2 68,14" fill="currentColor" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>【07 库存调拨送到店】➔ 触发【01 终端销售】真实数据 ➔ 动态反哺【02 需求上报】与【03 生产排产】</span>
                  </div>
                </div>

                {/* Mobile Fallback Banner */}
                <div className="md:hidden bg-gradient-to-r from-emerald-500/20 via-indigo-500/10 to-amber-500/20 rounded-xl p-2.5 border border-emerald-500/30 flex items-center justify-between text-xs text-slate-200 gap-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      【07 库存调拨】送到店后，【01 终端销售】真实数据再次反哺【02/03 需求与排产】，形成动态流转！
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PIPELINE SWIMLANE 1: AS-IS (现状) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <h4 className="text-xs font-black text-rose-900 bg-rose-100/80 px-2.5 py-1 rounded-md border border-rose-200">
                    现状 (As-Is) 业务流转：各环节独立割裂 · 缺乏校验拦截 · 损耗沉淀
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  ✕ 无统一数据视角 / 缺失卡口机制
                </span>
              </div>

              {/* As-Is Broken Pipeline Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                {[
                  {
                    title: '盲目经验采购',
                    tag: '孤岛采购',
                    badges: ['仅凭阶梯折扣', '无 BOM 需求校验', '呆滞积压'],
                    status: '✕ 缺料与过采并存'
                  },
                  {
                    title: '拍脑袋盲目排产',
                    tag: '脱节生产',
                    badges: ['滞后盲目开工', '忽视销存比/DOC', '牛鞭效应'],
                    status: '✕ 工厂车满为患'
                  },
                  {
                    title: '厂降店旱/僵化调拨',
                    tag: '堵塞仓配',
                    badges: ['总库压车无处放', '门店缺乏展示车', '无在库透视'],
                    status: '✕ 区域供需错位'
                  },
                  {
                    title: '账实倒挂/沉淀死锁',
                    tag: '危机销售',
                    badges: ['提前开票算销货', '超期长库龄无人跟', '资金占用'],
                    status: '✕ 坏账与资产贬值'
                  }
                ].map((node, idx) => (
                  <div key={idx} className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-3 space-y-2 relative flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {node.tag}
                        </span>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <div className="font-extrabold text-xs text-slate-800">{node.title}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {node.badges.map((b, bIdx) => (
                          <span key={bIdx} className="text-[10px] bg-white border border-rose-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-rose-700 pt-2 border-t border-rose-200/60 flex items-center gap-1">
                      <span>{node.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TRANSFORMATION BRIDGE / KEY SHIFT */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-emerald-400">系统优化升级的核心变革：</span>
                  <span className="text-slate-300 ml-1">在 4 大生命周期节点强制嵌入【数据校验硬卡口】与【5步闭环责任链】</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-md shrink-0">
                TRANSFORMATION ⚡
              </span>
            </div>

            {/* PIPELINE SWIMLANE 2: TO-BE (优化后，阶段 1~5 竖向排列 + 右侧功能截图展示) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h4 className="text-xs font-black text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
                    优化后 (To-Be) 业务流转：阶段 1~5 嵌入式硬卡口 & 界面截图展示
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ 点击左侧阶段切换右侧系统截图与功能细节
                </span>
              </div>

              {/* VERTICAL STAGE LIST (LEFT) & FUNCTIONAL SCREENSHOT PREVIEW (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* LEFT COLUMN: Stages 1~5 Vertically Arranged */}
                <div className="lg:col-span-5 space-y-2.5">
                  {[
                    {
                      stage: '阶段 01',
                      title: '需求算式推算推荐',
                      checkpoint: '【需求算式】按真实订单与 DOC 水位推算',
                      outcome: '精准算式推荐 / 杜绝虚高',
                      tabName: 'Tab 5 销量拟合 & Tab 2 场景模拟器',
                      asIs: '凭经验估算/大区虚报需求，采购量缺乏算式依据。',
                      toBe: '结合终端真实定金订单与市场热度，按算式推算需求建议量。',
                      highlights: [
                        '结合真实现金定金订单与交付趋势拟合',
                        '自动推算月度/季度销售缺口与 DOC 覆盖天数',
                        '需求算式实时反哺向【采购】与【排产】传导'
                      ],
                      previewType: 'fitting'
                    },
                    {
                      stage: '阶段 02',
                      title: '采购审批硬卡口',
                      checkpoint: '【采购审批】OA/采购系统嵌入式硬卡口',
                      outcome: '零超采过采 / 违规采购 100% 拦截',
                      tabName: 'Tab 1 采购审批硬卡口插件',
                      asIs: '凭供应商阶梯折扣下单，无 BOM 算式校验，致呆滞积压。',
                      toBe: '嵌入 OA/采购审批插件，强制按“需求算式 = 预测需求 + 安全库 - 当前库 - 在途库”强卡口打回。',
                      highlights: [
                        '嵌入式 OA / 采购审批硬卡口插件',
                        '根据 BOM 算式推荐建议采购量并限制上限',
                        '高价值三电（电池/电驱/ECU）100% 自动卡校验'
                      ],
                      previewType: 'procurement'
                    },
                    {
                      stage: '阶段 03',
                      title: '产销平滑排产计划',
                      checkpoint: '【排产卡口】硬性审核产销率与 DOC 天数',
                      outcome: '平滑产能 / 抑制牛鞭效应',
                      tabName: 'Tab 6 产销率拟合与排产评审',
                      asIs: '脱节盲目开工，缺乏产销比对，大面积盲目爆产。',
                      toBe: '排产申请前自动比对产销匹配度，偏离率 >15% 时硬卡口直接打回，平滑平衡工厂产能。',
                      highlights: [
                        '产销匹配度与过量排产偏离率自动比对',
                        '嵌入排产审批卡口，无需求排产禁止提交系统',
                        '平滑均衡工厂产能，消除供应链“牛鞭效应”'
                      ],
                      previewType: 'vehicleFitting'
                    },
                    {
                      stage: '阶段 04',
                      title: 'VIN一车一档仓配透视',
                      checkpoint: '【调拨卡口】按目标水位拉动与全路径匹配',
                      outcome: '厂店通畅 / 动态调配',
                      tabName: 'Tab 3 整车库存看板 (OMS 6.1)',
                      asIs: '厂降店旱，总库堆满数十台，门店无展车。',
                      toBe: '一车一档穿透总厂库、中转库、门店库，掌握 VIN 码与库龄，按目标水位拉动调拨。',
                      highlights: [
                        '整车 VIN 码一车一档，全路径穿透三种形态仓库',
                        '0-30天/31-60天/90+天库龄结构与红黄牌告警',
                        '解决“厂降店旱”配比矛盾，全流程在线可视化'
                      ],
                      previewType: 'vehicleStock'
                    },
                    {
                      stage: '阶段 05',
                      title: '超期自动预警与变现',
                      checkpoint: '【去化卡口】责任派发与促销变现联动',
                      outcome: '快速回笼资金 / ROE 提升',
                      tabName: 'Tab 3 整车库存 & Tab 4 规则设置',
                      asIs: '长库龄无人跟进，车龄贬值呆滞死锁。',
                      toBe: '库龄 >60 天车辆自动触发 5 步责任链推送到区域经理，联动促销与二次调拨快速变现。',
                      highlights: [
                        '按区域缺口与销存比，智能计算最佳调拨路线',
                        '长库龄整车自动触发 5 步责任链推送到区域经理',
                        '联动促销折扣与二次跨区调拨，加速资金变现'
                      ],
                      previewType: 'vehicleStock'
                    }
                  ].map((item, idx) => {
                    const isActive = activeToBeStage === idx;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setActiveToBeStage(idx)}
                        className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                          isActive 
                            ? 'bg-slate-900 text-white border-emerald-400 shadow-lg ring-2 ring-emerald-500/20' 
                            : 'bg-emerald-50/30 text-slate-800 border-emerald-200/90 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                            isActive ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.stage}
                          </span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${
                            isActive ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                            <span>{isActive ? '当前展示中' : '点击查看截图'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <h5 className={`font-extrabold text-xs sm:text-sm mb-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </h5>

                        <div className={`p-1.5 rounded-lg text-[10px] font-extrabold mb-1.5 border ${
                          isActive 
                            ? 'bg-slate-800 border-slate-700 text-emerald-300' 
                            : 'bg-white border-emerald-200 text-emerald-800'
                        }`}>
                          {item.checkpoint}
                        </div>

                        <div className={`text-[10px] sm:text-[11px] font-black flex items-center justify-between pt-1 border-t ${
                          isActive ? 'border-slate-800 text-emerald-400' : 'border-emerald-200 text-emerald-700'
                        }`}>
                          <span>✓ {item.outcome}</span>
                          <span className="text-[10px] opacity-80 hidden sm:inline">{item.tabName.split('&')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RIGHT COLUMN: Functional Screenshot Preview Box */}
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5 text-white flex flex-col justify-between space-y-4">
                  
                  {/* Active Stage Header & Tab Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-md">
                        阶段 0{activeToBeStage + 1} 功能截图
                      </span>
                      <h4 className="font-extrabold text-sm text-white">
                        {[
                          '需求算式推算与真实销量拟合',
                          '采购审批硬卡口插件与需求算式校验',
                          '产销平滑比拟合与排产评审',
                          'VIN 一车一档与全路径仓配透视',
                          '超期车辆 5 步责任去化与资金回笼'
                        ][activeToBeStage]}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      OMS 对应 Tab: {[
                        'Tab 5 销量拟合 & Tab 2 场景',
                        'Tab 1 采购审批硬卡口插件',
                        'Tab 6 产销率拟合与排产评审',
                        'Tab 3 整车库存 (OMS 6.1)',
                        'Tab 3 整车库存 & Tab 4 规则'
                      ][activeToBeStage]}
                    </span>
                  </div>

                  {/* As-Is vs To-Be Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                      <div className="text-rose-400 font-extrabold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>现状 (As-Is) 痛点：</span>
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        {[
                          '依赖离线 Excel 手工估计/大区虚报需求，采购缺乏准确推算。',
                          '凭阶梯折扣经验下单，无 BOM 匹配校验，致呆滞积压数千万元。',
                          '脱节生产，暴热时脱销，热度退去轰高产能致工厂车满为患。',
                          '厂降店旱，总库堆满数十台无法交付，门店无展示样车。',
                          '超期长库龄无人跟进，车辆贬值加剧，形成死锁沉淀。'
                        ][activeToBeStage]}
                      </p>
                    </div>

                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
                      <div className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>优化后 (To-Be) 核心能力：</span>
                      </div>
                      <p className="text-slate-200 text-[10px] leading-relaxed font-medium">
                        {[
                          '真实订单拟合趋势，结合 DOC 覆盖天数自动推算精准需求建议。',
                          '嵌入式采购审批卡口，强按需求算式推算并拦截超出限制的申请。',
                          '排产前自动比对产销匹配度，偏离率 >15% 时硬卡口打回。',
                          '一车一档穿透总库/中转库/门店库，按目标水位拉动调拨。',
                          '库龄 >60 天自动触发 5 步责任链，联动促销变现资金。'
                        ][activeToBeStage]}
                      </p>
                    </div>
                  </div>

                  {/* REALISTIC MOCK UI SCREENSHOT FRAME (系统界面效果截图) */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-inner space-y-3">
                    {/* Browser Mock Navigation */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-mono text-slate-400 ml-2">
                          System Screenshot: OMS_Module_Stage0{activeToBeStage + 1}.png
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        LIVE SYSTEM CAPTURE
                      </span>
                    </div>

                    {/* Screenshot UI Content Stage 1 */}
                    {activeToBeStage === 0 && (
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            需求算式推算 & 终端真实销量拟合模型
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">订单交付率: 94.2%</span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">月度目标需求: <b>3,500 台</b></span>
                            <span className="text-emerald-400 font-bold">终端真实拟合: 3,820 台 (超越目标)</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg text-slate-300 font-mono text-[10px] space-y-1 border border-slate-800">
                            <div>建议采购算式 = 预测需求 (1,500) + 安全库 (500) - 当前库 (600) - 在途 (200) = <b>1,200 套</b></div>
                            <div className="text-emerald-400 font-bold">DOC 安全天数推演: 18.5 天 (目标线: 15-20天)</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">实付定金订单:</span>
                            <div className="text-white font-bold text-xs mt-0.5">2,450 单 (已锁单)</div>
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">7天拟合缺口:</span>
                            <div className="text-amber-400 font-bold text-xs mt-0.5">-180 台 (预警)</div>
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">指数平滑精度:</span>
                            <div className="text-emerald-400 font-bold text-xs mt-0.5">96.8% 高精度</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Screenshot UI Content Stage 2 */}
                    {activeToBeStage === 1 && (
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            OMS 采购审批硬卡口插件 · 零部件 BOM 算式校验
                          </span>
                          <span className="text-[10px] text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                            ✕ 硬卡口阻止拦截
                          </span>
                        </div>
                        <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-2">
                          <div className="text-rose-300 font-extrabold text-[11px] flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>【硬卡口拦截告警】申请采购 2,000 套电池包，超出需求算式上限 1,200 套！</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg text-slate-300 font-mono text-[10px] space-y-1 border border-slate-800">
                            <div>建议采购量 = 预测需求 (1,500) + 安全库 (500) - 当前库 (600) - 在途 (200) = <b>1,200 套</b></div>
                            <div className="text-rose-400 font-bold">超出数量: +800 套 | 系统打回原因: 风险覆盖天数超标 (38天 &gt; 20天)</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">电池包在库:</span>
                            <div className="text-white font-bold text-xs mt-0.5">600 套 (安全)</div>
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">电驱总成在途:</span>
                            <div className="text-white font-bold text-xs mt-0.5">200 套 (5天内到)</div>
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-slate-400">建议采购额:</span>
                            <div className="text-emerald-400 font-bold text-xs mt-0.5">¥ 1,440 万元</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Screenshot UI Content Stage 3 */}
                    {activeToBeStage === 2 && (
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-indigo-400" />
                            产销率匹配度拟合与排产评审看板
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            ✓ 产销评审通过
                          </span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">月度拟合需求: <b>3,800 台/月</b></span>
                            <span className="text-slate-300">工厂申请排产: <b>4,200 台/月</b></span>
                            <span className="text-emerald-400 font-extrabold">偏离率: 10.5% (≤ 15% 安全)</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>平滑产能匹配进度:</span>
                              <span>DOC 覆盖天数: 18.5 天 (安全线 15~25天)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[78%]"></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[10px] text-indigo-200 flex items-center justify-between">
                          <span><b>产销卡口校验：</b>已核对全国 12 个销售大区实付定金订单与 30 天预测，未见盲目爆产风险。</span>
                        </div>
                      </div>
                    )}

                    {/* Screenshot UI Content Stage 4 */}
                    {activeToBeStage === 3 && (
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-amber-400" />
                            OMS 6.1 整车 VIN 码一车一档与全路径仓配透视
                          </span>
                          <span className="text-[10px] text-indigo-400 font-mono">VIN: LSVABC12384910</span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] space-y-2">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>存放位置: <b className="text-white">华东中转库 (B区-08号)</b></span>
                            <span className="text-amber-400 font-bold">在库时间: 42 天</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-300 grid grid-cols-2 gap-2 border border-slate-800">
                            <div>车型配置: <b>长续航双电机 / 极夜黑</b></div>
                            <div>状态: <b className="text-emerald-400">已匹配杭州体验店调拨单</b></div>
                            <div>移库记录: <b>总厂库 ➔ 华东库</b></div>
                            <div>预定交付日: <b>2026-07-28</b></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span>全库龄占比: 0-30天 (65%) | 31-60天 (25%) | 60+天 (10%)</span>
                          <span className="text-emerald-400 font-bold">厂店供需比: 1.05 平衡</span>
                        </div>
                      </div>
                    )}

                    {/* Screenshot UI Content Stage 5 */}
                    {activeToBeStage === 4 && (
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-orange-400" />
                            超期车辆 5 步责任去化派单与变现
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            ⚠ 触发责任去化链
                          </span>
                        </div>
                        <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
                          <div className="text-amber-300 font-extrabold text-[11px] flex items-center justify-between">
                            <span>长库龄车辆 (库龄 &gt;60 天): <b>45 台待去化</b></span>
                            <span className="text-emerald-400">预计回笼资金: ¥ 1,125 万元</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-[9px] text-center pt-1 font-bold">
                            <div className="p-1 bg-amber-500 text-slate-950 rounded">1. 自动派单</div>
                            <div className="p-1 bg-amber-500 text-slate-950 rounded">2. 区域签收</div>
                            <div className="p-1 bg-emerald-500 text-slate-950 rounded">3. 降价促销</div>
                            <div className="p-1 bg-slate-800 text-slate-400 rounded">4. 跨区调拨</div>
                            <div className="p-1 bg-slate-800 text-slate-400 rounded">5. 考核结案</div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-[10px] text-slate-300 flex justify-between">
                          <span>责任人: <b>华东大区经理 (张经理)</b></span>
                          <span className="text-emerald-400 font-bold">资金周转 ROE 影响: +8.2%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Highlights Bullet Checklist */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-200">阶段 0{activeToBeStage + 1} 新增功能细节：</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        [
                          '真实定金订单与交付拟合模型',
                          '自动计算 7-30 天车辆缺口水位',
                          '实时反哺向【采购】与【排产】传导'
                        ],
                        [
                          '嵌入式 OA 采购硬卡口插件',
                          'BOM 算式限制采购上限',
                          '三电与底盘件 100% 自动卡校验'
                        ],
                        [
                          '产销匹配度与偏离率自动比对',
                          '偏离率 >15% 系统直接拦截打回',
                          '平滑产能消除供应链牛鞭效应'
                        ],
                        [
                          '整车 VIN 码一车一档全路径穿透',
                          '0-30/31-60/90+ 天库龄红黄牌告警',
                          '解决厂降店旱，全流程在线可视化'
                        ],
                        [
                          '智能计算跨区域最佳调拨路线',
                          '长库龄整车自动触发 5 步责任链',
                          '联动促销与跨区调拨加速变现资金'
                        ]
                      ][activeToBeStage].map((hl, hlIdx) => (
                        <div key={hlIdx} className="p-2 bg-slate-800/90 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* COMPARISON SUMMARY MATRIX TABLE */}
            <div className="pt-2">
              <div className="text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                核心维度变革对比矩阵 (Key Strategic Differences)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5 rounded-tl-lg">对比维度</th>
                      <th className="p-2.5 text-rose-800 bg-rose-50/60">现状 (As-Is 传统模式)</th>
                      <th className="p-2.5 text-emerald-800 bg-emerald-50/60">优化后 (To-Be 新系统)</th>
                      <th className="p-2.5 rounded-tr-lg">经营改善收益</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">核心驱动力</td>
                      <td className="p-2.5 bg-rose-50/20 text-rose-900">部门隔离推式、依赖经验/折扣</td>
                      <td className="p-2.5 bg-emerald-50/20 text-emerald-900 font-bold">终端销售订单与 BOM 算式拉动</td>
                      <td className="p-2.5 text-slate-900">彻底消除零部件过采呆滞与缺料停工</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">过程卡口控制</td>
                      <td className="p-2.5 bg-rose-50/20 text-rose-900">缺失前置校验，事后被动救火</td>
                      <td className="p-2.5 bg-emerald-50/20 text-emerald-900 font-bold">采购、排产、调拨前置硬性卡口</td>
                      <td className="p-2.5 text-slate-900">阻止不合理采购和盲目排产直接过关</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">库存透明度</td>
                      <td className="p-2.5 bg-rose-50/20 text-rose-900">盲盒视角，厂店脱节“厂降店旱”</td>
                      <td className="p-2.5 bg-emerald-50/20 text-emerald-900 font-bold">VIN一车一档，全路径在库水位透视</td>
                      <td className="p-2.5 text-slate-900">动态按需平衡全国门店与大仓库存</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">风险预警机制</td>
                      <td className="p-2.5 bg-rose-50/20 text-rose-900">看板仅做展示，无责任人跟进</td>
                      <td className="p-2.5 bg-emerald-50/20 text-emerald-900 font-bold">自动推送到人 + 5步责任链去化</td>
                      <td className="p-2.5 text-slate-900">超期车去化率100%跟踪，大幅加快回款</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Quick Summary Footer */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>立项架构总结：需求驱动 ➔ 统一视角 ➔ 规则模型 ➔ 硬性嵌入 ➔ 五步闭环</span>
        </div>
        <span className="text-[11px] text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
          Ready for Management Review
        </span>
      </div>

    </div>
  );
}
