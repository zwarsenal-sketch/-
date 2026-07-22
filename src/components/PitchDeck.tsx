/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingDown, 
  Coins, 
  Layers, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Database,
  LineChart,
  Bell,
  Cpu,
  BookOpen,
  Calculator,
  Calendar,
  Users,
  Target,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function PitchDeck() {
  // ROI Slider States
  const [annualSales, setAnnualSales] = useState<number>(100000); // 年销量 10 万辆
  const [avgCarCost, setAvgCarCost] = useState<number>(15); // 平均整车成本 15 万元
  const [currentVehicleDays, setCurrentVehicleDays] = useState<number>(45); // 现有整车库龄 45 天
  const [targetVehicleDays, setTargetVehicleDays] = useState<number>(30); // 目标整车库龄 30 天
  
  const [partsPurchaseCost, setPartsPurchaseCost] = useState<number>(80000); // 零部件年采购额 8 亿元 (80000万元)
  const [currentPartsDays, setCurrentPartsDays] = useState<number>(35); // 现有零部件库龄 35 天
  const [targetPartsDays, setTargetPartsDays] = useState<number>(20); // 目标零部件库龄 20 天

  const capitalInterestRate = 0.045; // 资金占用利息/机会成本 4.5%

  // Calculations
  // 1. 整车资金沉淀 = (年销量 * 成本) * (库龄 / 365)
  const currentVehicleCapital = (annualSales * avgCarCost) * (currentVehicleDays / 365);
  const targetVehicleCapital = (annualSales * avgCarCost) * (targetVehicleDays / 365);
  const vehicleCapitalReleased = currentVehicleCapital - targetVehicleCapital; // 释放整车沉淀资金

  // 2. 零部件资金沉淀 = 年采购额 * (库龄 / 365)
  const currentPartsCapital = partsPurchaseCost * (currentPartsDays / 365);
  const targetPartsCapital = partsPurchaseCost * (targetPartsDays / 365);
  const partsCapitalReleased = currentPartsCapital - targetPartsCapital; // 释放零部件沉淀资金

  // 3. 总共释放沉淀资金
  const totalCapitalReleased = vehicleCapitalReleased + partsCapitalReleased;

  // 4. 年化节省财务/资金占用利息成本 = 释放资金 * 利率 + 减少呆滞损失
  const annualSavings = totalCapitalReleased * capitalInterestRate + (totalCapitalReleased * 0.02); // 额外2%呆滞折旧规避

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Executive Intro Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            立项汇报演示 / EXECUTIVE PROJECT PITCH
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            造车库存经营决策系统 <span className="text-emerald-400 font-light font-mono text-xl block md:inline md:ml-2">S&OP Inventory Engine</span>
          </h1>
          <p className="text-slate-300 max-w-4xl leading-relaxed text-xs md:text-sm">
            打破销售订单、排产计划、BOM与实物库存的“数据孤岛”，从“粗放式采购”向“精细化资金与库存经营”变革。
            系统实现在排产决策与采购提报前置介入，规避高危呆滞，平衡成品配载，全方位释放沉淀流动资金。
          </p>
        </div>
      </div>

      {/* SECTION I: 一、项目背景 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="px-3 py-1 bg-slate-900 text-white font-black text-sm rounded-lg">一</div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            项目背景 <span className="text-xs text-slate-400 font-normal">/ Project Background</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. 现状问题 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  1. 现状核心痛点诊断
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-100">
                  亟待破局
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">传统大批量、粗放式排产采购模式在供需剧变时面临的严峻考验</p>
            </div>

            <div className="space-y-4 my-auto">
              {/* Pain 1 */}
              <div className="flex gap-3 items-start p-3 rounded-xl bg-rose-50/30 border border-rose-100/50">
                <div className="p-2 bg-rose-100/60 text-rose-600 rounded-lg shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-850 flex items-center gap-2">
                    <span>① 零部件过采导致呆滞高企</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold font-mono">资金死锁</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    采购提报与实际销售流速断层严重。一旦车型日耗骤降，采购惯性仍按历史基数提报，零件刚入库即变呆滞，吞噬大笔仓储费。
                  </p>
                </div>
              </div>

              {/* Pain 2 */}
              <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50/30 border border-amber-100/50">
                <div className="p-2 bg-amber-100/60 text-amber-600 rounded-lg shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-850 flex items-center gap-2">
                    <span>② 长库龄整车重度资金占压</span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-semibold font-mono">利息高企</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    整车周转缓慢，成品车库存覆盖率天数（DOC）处于失控水位。单车成本达十几万元，占用大量高昂利息（WACC 4.5%）及产生折旧跌价。
                  </p>
                </div>
              </div>

              {/* Pain 3 */}
              <div className="flex gap-3 items-start p-3 rounded-xl bg-blue-50/30 border border-blue-100/50">
                <div className="p-2 bg-blue-100/60 text-blue-600 rounded-lg shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-850 flex items-center gap-2">
                    <span>③ 热销车型核心缺料断档</span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold font-mono">交付迟滞</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    对交期长（Long Lead-time）的核心卡脖子物料（如 SiC 电控、电芯、长周期芯片）缺乏动态安全备货模型，销量爆发即断料，白白流失定单。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 解决思路 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-500" />
                  2. 库存经营：理念升级与双驱机制
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                  战略转型
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">从单纯的“缺料催货预警”跃升为多维度的“全价值链资金与库存经营”</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">传统：局部/被动视角</div>
                <ul className="space-y-1.5 text-[11px] text-slate-500">
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500 font-bold">✕</span> 只盯供需数量，忽视资金成本
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500 font-bold">✕</span> 部门信息割裂，数据无法拉通
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500 font-bold">✕</span> 事后呆滞产生，方进行折扣贱卖
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 space-y-2.5">
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">未来：全局/前置视角</div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> 综合考量数量、周转、均价与利息
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> 终端真实销售倒逼BOM配料拉通
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> 提报前置拦截，排产前规避风险
                  </li>
                </ul>
              </div>
            </div>

            {/* Equilibrium Formula Box */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                S&OP 供应链库存恒等拟合方程
              </div>
              <div className="text-xs font-mono text-slate-200">
                期末库存 = 期初库存 + 本期生产 - 本期销量
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                本决策系统以此公式为核心，引入经销商 PSI (进销存) 及直营销售大订漏斗，双向穿透：在生产或采购动作启动前，精准核算本期理论水位，凡偏离阈值者，强行实施拦截及预警。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION II: 二、项目概述 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="px-3 py-1 bg-slate-900 text-white font-black text-sm rounded-lg">二</div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            项目概述 <span className="text-xs text-slate-400 font-normal">/ Project Overview</span>
          </h2>
        </div>

        {/* 1. 方案概述 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              1. 方案概述：四层顶层卡点体系
            </h3>
            <p className="text-xs text-slate-400">
              通过打通底层数据孤岛，构建智能算法引擎，深度嵌入业务审批执行链路，构建全流程闭环控制。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/20 space-y-2">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg w-fit">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-indigo-900">① 数据治理拉通层</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                贯通 DMS 销售大订、渠道 PSI 进销存、S&OP 排产计划、物料 BOM 消耗以及 ERP 采购在途。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-50 bg-blue-50/20 space-y-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg w-fit">
                <LineChart className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-blue-900">② 经营算法建模层</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                搭建动态周转模型与多维资金沉淀计算器，定量分析库龄贬值风险与备货安全警戒红线。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-50 bg-amber-50/20 space-y-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg w-fit">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-amber-900">③ 阈值智能诊断层</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                多源数据交叉复算，实时诊断识别“开票口径倒挂”、“牛鞭效应塞货”以及“两极化厂店错配”。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-50 bg-emerald-50/20 space-y-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg w-fit">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-emerald-900">④ 审批卡点应用层</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                将数据校验硬插件深度植入采购申请审批、周排产评审及异地物流发运系统，拦截超限盲目决策。
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Roadmap and Stakeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 2. 项目节奏 */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              2. 项目实施节奏
            </h3>
            
            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white"></span>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>阶段一：数据底座与多网融合 (Month 1-2)</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">T1 期</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    全面连接 ERP、WMS、DMS 主数据库。打破技术藩篱，拉通单车多级 BOM 耗用和高流速在途订单，搭建底层统一大数据库。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white"></span>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>阶段二：模型建设与预警引擎 (Month 3-4)</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">T2 期</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    开发库龄资金模型，上线整车与零部件供需平衡动态算式。构建“厂库积压与店面贫血两极分摊”以及“渠道压货牛鞭倍数”诊断体系。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>阶段三：流程咬合与全线推广 (Month 5-6)</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">T3 期</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    实现卡点插件全面嵌入采购审批和排产决策评审，系统正式试运行。启动一车一码一单的周转追踪，常态化释放沉淀资本。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 关键干系方 */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              3. 关键干系方与业务协同
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* CFO Office */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  财务管理中心 (CFO)
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  管控 WACC 资本利息及呆滞计提贬值红线。用项目产生的“资金压降额”动态核定各大销区、工厂的经营健康度。
                </p>
              </div>

              {/* S&OP Production */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  排产计划部 (S&OP)
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  获取真实的终端 POS 零售速率和直营大宗大订，柔性规划下线方案，坚决掐断工厂的无序过剩和盲目赶产。
                </p>
              </div>

              {/* PMC Procurement */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  物控制造/采购中心
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  实时查收零件过采、库龄超限警报。实现“拉动式”精准补料，控制周采购基数，同时提前锁控长账单周期瓶颈件。
                </p>
              </div>

              {/* Sales Division */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  销售与渠道管理部
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  穿透并监控店面在库 PSI 进销存，严格卡控冲量账务开票带来的虚假大宗，协调物流解决“厂店在库分布两极化”。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION III: 三、项目收益与核心指标 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="px-3 py-1 bg-slate-900 text-white font-black text-sm rounded-lg">三</div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            项目收益与核心指标 <span className="text-xs text-slate-400 font-normal">/ Benefits & Core Metrics</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Targets */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                1. 业务改善核心指标目标
              </h3>
              <p className="text-xs text-slate-400">系统建成后，全链条供应链期望达成的极限压降成效</p>
            </div>

            <div className="space-y-4 my-auto">
              {/* Metric Target 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-800 block">整车 DOC 覆盖月数</span>
                  <span className="text-[10px] text-slate-450 block">成品车平均堆压在库周期</span>
                </div>
                <div className="text-right">
                  <span className="text-xs line-through text-slate-400 block font-mono">45 天</span>
                  <strong className="text-indigo-600 text-sm font-extrabold font-mono block">➔ 30 天</strong>
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-bold font-mono">-33.3%</span>
                </div>
              </div>

              {/* Metric Target 2 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-800 block">零部件周转覆盖库龄</span>
                  <span className="text-[10px] text-slate-450 block">原件堆压在工厂及仓库周期</span>
                </div>
                <div className="text-right">
                  <span className="text-xs line-through text-slate-400 block font-mono">35 天</span>
                  <strong className="text-emerald-600 text-sm font-extrabold font-mono block">➔ 20 天</strong>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded font-bold font-mono">-42.8%</span>
                </div>
              </div>

              {/* Metric Target 3 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-800 block">高危呆滞资金拦截率</span>
                  <span className="text-[10px] text-slate-450 block">提报审批插件前置卡住过采资金</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-800 text-sm font-extrabold font-mono block">50.0% +</strong>
                  <span className="text-[9px] bg-slate-150 text-slate-600 px-1 py-0.2 rounded font-bold block">全时在线诊断</span>
                </div>
              </div>

              {/* Metric Target 4 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-800 block">因核心件短缺停线率</span>
                  <span className="text-[10px] text-slate-450 block">SiC等长效件战略警戒备料防阻断</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-rose-500 block font-bold font-mono">降低 85%+</span>
                  <span className="text-[9px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded font-bold block">保供安全盾</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: ROI Dynamic Estimator */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-emerald-500" />
                    2. 项目业务价值动态估算器 (Boss Sandbox)
                  </h3>
                  <p className="text-xs text-slate-400">滑动下述参数，动态仿真计算库龄缩短后，可直接释放的现金洪峰与利息总额</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 text-xs px-2.5 py-1 rounded-lg font-bold">
                  高投资回报率 / High ROI
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Slider Group */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span className="font-bold text-slate-800">🚘 整车销售及生产总规模</span>
                    <span className="text-indigo-600 font-bold font-mono">{annualSales.toLocaleString()} 辆 / 年</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="300000" 
                    step="10000"
                    value={annualSales} 
                    onChange={(e) => setAnnualSales(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold">单车均价/成本 (万元)</label>
                      <input 
                        type="number" 
                        value={avgCarCost} 
                        onChange={(e) => setAvgCarCost(Number(e.target.value))}
                        className="w-full text-xs font-bold border-b border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-700 bg-transparent py-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold">整车库龄 (现有➔目标天)</label>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-550 font-medium font-mono">{currentVehicleDays}d</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <input 
                          type="number" 
                          value={targetVehicleDays} 
                          onChange={(e) => setTargetVehicleDays(Math.min(currentVehicleDays - 1, Number(e.target.value)))}
                          className="w-8 text-xs font-bold text-indigo-650 focus:outline-none border-b border-indigo-300 text-center bg-transparent"
                        />
                        <span className="text-slate-500">d</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parts Slider Group */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span className="font-bold text-slate-800">🔩 零部件年采购总金额</span>
                    <span className="text-emerald-600 font-bold font-mono">{(partsPurchaseCost / 10000).toFixed(1)} 亿元 / 年</span>
                  </div>
                  <input 
                    type="range" 
                    min="20000" 
                    max="200000" 
                    step="10000"
                    value={partsPurchaseCost} 
                    onChange={(e) => setPartsPurchaseCost(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold">零部件库龄 (现有➔目标天)</label>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-550 font-medium font-mono">{currentPartsDays}d</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <input 
                          type="number" 
                          value={targetPartsDays} 
                          onChange={(e) => setTargetPartsDays(Math.min(currentPartsDays - 1, Number(e.target.value)))}
                          className="w-8 text-xs font-bold text-emerald-650 focus:outline-none border-b border-emerald-300 text-center bg-transparent"
                        />
                        <span className="text-slate-500">d</span>
                      </div>
                    </div>
                    <div className="bg-slate-100/60 px-2 py-1 rounded text-right flex flex-col justify-center">
                      <span className="text-[9px] text-slate-450 block font-semibold">利息占用机会成本</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">年化 {capitalInterestRate * 100}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mt-2">
              <div className="space-y-1">
                <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  估算释放压降沉淀流动资金
                </div>
                <div className="text-3xl font-black text-emerald-700 font-mono flex items-baseline gap-1">
                  {(totalCapitalReleased / 10000).toFixed(2)} <span className="text-xs font-bold text-slate-600">亿元</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">
                  其中：整车释放 <span className="font-bold text-slate-700">{(vehicleCapitalReleased / 10000).toFixed(2)} 亿元</span>，零部件释放 <span className="font-bold text-slate-700">{(partsCapitalReleased / 10000).toFixed(2)} 亿元</span>。
                </p>
              </div>

              <div className="space-y-1 md:border-l md:border-emerald-500/20 md:pl-5 pt-3 md:pt-0">
                <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  年化直接财务节省 + 呆滞避免收益
                </div>
                <div className="text-3xl font-black text-teal-700 font-mono flex items-baseline gap-1">
                  {(annualSavings).toFixed(0)} <span className="text-xs font-bold text-slate-600">万元/年</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">
                  核算依据：利息机会成本直省 <span className="font-bold text-slate-700">{(totalCapitalReleased * capitalInterestRate).toFixed(0)} 万元</span>，额外计入贬值风险率 2.0% 的呆滞减免。
                </p>
              </div>
            </div>
            
            {/* Rule Explainer Link */}
            <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                计算原理：资产沉淀模型 C_cap = (年采购或销量总额 * (DOC_库龄 / 365))
              </span>
              <span className="text-[11px] font-bold text-emerald-600">数理拟合精确至单台零件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
