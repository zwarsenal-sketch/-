/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Car,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Layers,
  ShoppingBag,
  Wrench,
  DollarSign,
  Undo2,
  Calendar,
  Layers2,
  LineChart,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  ArrowRight
} from 'lucide-react';

// Monthly baseline data for the three vehicles (original Sandbox)
interface MonthData {
  month: string;
  sales: number;      // 销量
  production: number; // 生产计划
}

const baselineData: Record<string, { name: string; price: number; initialStock: number; months: MonthData[] }> = {
  v1: {
    name: '多拉3米8 (高承载微卡)',
    price: 9.8, // 万元
    initialStock: 1450, // 2026年初库存
    months: [
      { month: '1月', sales: 320, production: 400 },
      { month: '2月', sales: 280, production: 350 },
      { month: '3月', sales: 450, production: 500 },
      { month: '4月', sales: 420, production: 420 },
      { month: '5月', sales: 390, production: 380 },
      { month: '6月', sales: 360, production: 300 },
      { month: '7月(预)', sales: 340, production: 320 },
      { month: '8月(预)', sales: 330, production: 310 },
      { month: '9月(预)', sales: 320, production: 300 },
      { month: '10月(预)', sales: 350, production: 340 },
      { month: '11月(预)', sales: 380, production: 360 },
      { month: '12月(预)', sales: 400, production: 380 },
    ]
  },
  v2: {
    name: '多拉大面 (定制纯电客货)',
    price: 7.2, // 万元
    initialStock: 600,
    months: [
      { month: '1月', sales: 620, production: 580 },
      { month: '2月', sales: 510, production: 500 },
      { month: '3月', sales: 780, production: 750 },
      { month: '4月', sales: 840, production: 800 },
      { month: '5月', sales: 910, production: 880 },
      { month: '6月', sales: 990, production: 950 },
      { month: '7月(预)', sales: 1050, production: 1000 },
      { month: '8月(预)', sales: 1100, production: 1050 },
      { month: '9月(预)', sales: 1150, production: 1100 },
      { month: '10月(预)', sales: 1200, production: 1150 },
      { month: '11月(预)', sales: 1250, production: 1200 },
      { month: '12月(预)', stroke: '1300', sales: 1300, production: 1250 } as any, // fallback compatible
    ]
  },
  v3: {
    name: '多拉小货 (重载小微卡)',
    price: 4.8, // 万元
    initialStock: 3000,
    months: [
      { month: '1月', sales: 2800, production: 2900 },
      { month: '2月', sales: 2400, production: 2450 },
      { month: '3月', sales: 3100, production: 3150 },
      { month: '4月', sales: 3250, production: 3200 },
      { month: '5月', sales: 3310, production: 3300 },
      { month: '6月', sales: 3300, production: 3320 },
      { month: '7月(预)', sales: 3350, production: 3400 },
      { month: '8月(预)', sales: 3400, production: 3420 },
      { month: '9月(预)', sales: 3420, production: 3450 },
      { month: '10月(预)', sales: 3500, production: 3550 },
      { month: '11月(预)', sales: 3600, production: 3650 },
      { month: '12月(预)', sales: 3700, production: 3750 },
    ]
  }
};

// User uploaded real historical data for Jan - Jun 2026
const realHistoricalData = [
  { month: '1月', production: 1338, factoryStock: 1677, storeStock: 918, directApply: 817, sales: 796 },
  { month: '2月', production: 339, factoryStock: 2265, storeStock: 18, directApply: 10, sales: 260 },
  { month: '3月', production: 2073, factoryStock: 2583, storeStock: 493, directApply: 678, sales: 1988 },
  { month: '4月', production: 3302, factoryStock: 2548, storeStock: 935, directApply: 1192, sales: 1778 },
  { month: '5月', production: 4042, factoryStock: 3875, storeStock: 1160, directApply: 1041, sales: 1611 },
  { month: '6月', production: 3215, factoryStock: 4975, storeStock: 785, directApply: 1805, sales: 2495 }
];

export default function FittingAnalysis() {
  // Mode: macro_uploaded (the user's real uploaded data) vs single_sandbox (the original three-car sandbox)
  const [activeMode, setActiveMode] = useState<'macro_uploaded' | 'single_sandbox'>('macro_uploaded');

  // Selected vehicle for the original sandbox
  const [selectedVehicle, setSelectedVehicle] = useState<'v1' | 'v2' | 'v3'>('v1');
  
  // Sandbox future planning adjustments (Jul - Dec)
  const [prodAdj, setProdAdj] = useState<number>(0);  // % change in future production plans (-50% to +50%)
  const [salesAdj, setSalesAdj] = useState<number>(0); // % change in future sales forecasts (-30% to +30%)
  
  // Custom manual overrides for sandbox
  const [manualProd, setManualProd] = useState<Record<string, Record<number, number>>>({ v1: {}, v2: {}, v3: {} });
  const [manualSales, setManualSales] = useState<Record<string, Record<number, number>>>({ v1: {}, v2: {}, v3: {} });

  // ----------------------------------------------------
  // Macro Uploaded Data State and Simulation Logics
  // ----------------------------------------------------
  const [macroScenario, setMacroScenario] = useState<'status_quo' | 'lean_sop' | 'promo_destock'>('status_quo');
  const [macroProdAdj, setMacroProdAdj] = useState<number>(0); // % change in future production plans
  const [macroSalesAdj, setMacroSalesAdj] = useState<number>(0); // % change in future sales forecasts
  
  // Manual overrides for macro forecasted months
  const [macroManualProd, setMacroManualProd] = useState<Record<number, number>>({});
  const [macroManualSales, setMacroManualSales] = useState<Record<number, number>>({});
  
  // Active selected risk card to highlight elements in the graph
  const [activeRiskHighlight, setActiveRiskHighlight] = useState<string | null>(null);
  
  // Legend filters for macro graph
  const [showProduction, setShowProduction] = useState<boolean>(true);
  const [showSales, setShowSales] = useState<boolean>(true);
  const [showFactoryStock, setShowFactoryStock] = useState<boolean>(true);
  const [showStoreStock, setShowStoreStock] = useState<boolean>(true);
  const [showDirectApply, setShowDirectApply] = useState<boolean>(true);

  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  // Restore everything to default
  const handleReset = () => {
    setProdAdj(0);
    setSalesAdj(0);
    setManualProd({ v1: {}, v2: {}, v3: {} });
    setManualSales({ v1: {}, v2: {}, v3: {} });
    
    setMacroScenario('status_quo');
    setMacroProdAdj(0);
    setMacroSalesAdj(0);
    setMacroManualProd({});
    setMacroManualSales({});
    setActiveRiskHighlight(null);
  };

  // Switch simulation scenario for the Macro User-Uploaded Dataset
  const handleSelectScenario = (scenario: 'status_quo' | 'lean_sop' | 'promo_destock') => {
    setMacroScenario(scenario);
    setMacroManualProd({});
    setMacroManualSales({});
    if (scenario === 'status_quo') {
      setMacroProdAdj(0);
      setMacroSalesAdj(0);
    } else if (scenario === 'lean_sop') {
      setMacroProdAdj(-45); // Cut production heavily to consume bloated factory stock
      setMacroSalesAdj(-5);  // Realistic conservative demand
    } else if (scenario === 'promo_destock') {
      setMacroProdAdj(-20); // Minor production cuts
      setMacroSalesAdj(30);  // Boost sales heavily via promotion/subsidies
    }
  };

  // ----------------------------------------------------
  // COMPUTING MACRO (USER UPLOADED) DATA & PROJECTIONS
  // ----------------------------------------------------
  const computedMacroMonths = useMemo(() => {
    const months = ['7月(预)', '8月(预)', '9月(预)', '10月(预)', '11月(预)', '12月(预)'];
    
    // Baseline forecasts (extrapolated from historical averages)
    // Avg Sales = ~1488, Avg Production = ~2385
    const baseSales = [1800, 1600, 1700, 2100, 2200, 2500]; // Seasonal baseline
    const baseProduction = [3000, 2800, 3100, 3200, 3200, 2900]; // Standard high production baseline

    // Deep copy historical
    const fullTimeline = realHistoricalData.map(d => ({ ...d, isFuture: false }));

    let currentFactoryStock = 4975; // Starting from 6月 ending
    let currentStoreStock = 785; // Starting from 6月 ending

    months.forEach((m, idx) => {
      const globalIdx = idx + 6;
      
      // Calculate projected sales
      let sales = baseSales[idx];
      sales = Math.round(sales * (1 + macroSalesAdj / 100));
      if (macroManualSales[globalIdx] !== undefined) {
        sales = macroManualSales[globalIdx];
      }

      // Calculate projected production
      let production = baseProduction[idx];
      production = Math.round(production * (1 + macroProdAdj / 100));
      if (macroManualProd[globalIdx] !== undefined) {
        production = macroManualProd[globalIdx];
      }

      // S&OP routing logic for Channel Inventory (Factory vs Store)
      // Standard flow: Production goes to factory. Factory allocates to stores based on direct applies or allocation target.
      // Under 'lean_sop' or 'promo_destock', we assume high allocation efficiency (fast logistics, factory pushes cars to store)
      let allocationToStore = Math.round(sales * 1.05); // Standard healthy allocation
      if (macroScenario === 'status_quo') {
        // Poor allocation: store stays relatively low, factory swells
        allocationToStore = Math.round(sales * 0.85); 
      }

      // Factory stock change
      currentFactoryStock = Math.max(0, currentFactoryStock + production - allocationToStore);
      
      // Store stock change
      currentStoreStock = Math.max(0, currentStoreStock + allocationToStore - sales);

      // Under the custom preset scenario we force specific mathematical convergence
      if (macroScenario === 'lean_sop') {
        // Ideal stock depletion
        const targetTotalStock = Math.max(1500, 5760 - (idx + 1) * 700); 
        currentStoreStock = Math.round(targetTotalStock * 0.35); // 35% at stores (healthy distribution)
        currentFactoryStock = Math.round(targetTotalStock * 0.65);
      } else if (macroScenario === 'promo_destock') {
        const targetTotalStock = Math.max(1800, 5760 - (idx + 1) * 650);
        currentStoreStock = Math.round(targetTotalStock * 0.3);
        currentFactoryStock = Math.round(targetTotalStock * 0.7);
      }

      // Direct sales application is driven by store sales and store stock gaps
      let directApply = Math.round(sales * 1.1);
      if (macroScenario === 'status_quo') {
        // Still lagged
        directApply = Math.round(sales * 0.8);
      }

      fullTimeline.push({
        month: m,
        production,
        factoryStock: currentFactoryStock,
        storeStock: currentStoreStock,
        directApply,
        sales,
        isFuture: true
      });
    });

    return fullTimeline;
  }, [macroSalesAdj, macroProdAdj, macroManualProd, macroManualSales, macroScenario]);

  // Macro Statistics (1-6月 actuals + 7-12月 projections)
  const macroStats = useMemo(() => {
    const totalSales = computedMacroMonths.reduce((sum, m) => sum + m.sales, 0);
    const totalProduction = computedMacroMonths.reduce((sum, m) => sum + m.production, 0);
    const actualSales = realHistoricalData.reduce((sum, m) => sum + m.sales, 0);
    const actualProd = realHistoricalData.reduce((sum, m) => sum + m.production, 0);

    // Production-to-Sales Ratio (Jan-Jun)
    const h1BalanceRate = Math.round((actualProd / actualSales) * 1000) / 10;
    
    // Overall 12-month Balance Rate
    const fullBalanceRate = Math.round((totalProduction / totalSales) * 1000) / 10;

    // 6月 Ending stock (actual)
    const junEndingTotalStock = 4975 + 785; // 5760
    const junAvgMonthlySales = actualSales / 6; // 1488
    const junDoi = Math.round((junEndingTotalStock / junAvgMonthlySales) * 30); // 116 days

    // 12月 (Year-end) Stock status
    const decData = computedMacroMonths[11];
    const decEndingStock = decData.factoryStock + decData.storeStock;
    const decAvgSales = computedMacroMonths.slice(6, 12).reduce((sum, m) => sum + m.sales, 0) / 6;
    const decDoi = Math.round((decEndingStock / decAvgSales) * 30);

    // Average tied up capital in stock (Assuming 8.0万元 average car price)
    const h1AvgStockVal = Math.round((realHistoricalData.reduce((sum, m) => sum + m.factoryStock + m.storeStock, 0) / 6) * 8.0 / 100) / 100; // 亿
    const fullYearAvgStockVal = Math.round((computedMacroMonths.reduce((sum, m) => sum + m.factoryStock + m.storeStock, 0) / 12) * 8.0 / 100) / 100; // 亿

    return {
      totalSales,
      totalProduction,
      h1BalanceRate,
      fullBalanceRate,
      junEndingTotalStock,
      junDoi,
      decEndingStock,
      decDoi,
      h1AvgStockVal,
      fullYearAvgStockVal
    };
  }, [computedMacroMonths]);

  // ----------------------------------------------------
  // COMPUTING SINGLE VEHICLE SANDBOX LOGICS (Original)
  // ----------------------------------------------------
  const vehicleInfo = baselineData[selectedVehicle];
  const computedSandboxMonths = useMemo(() => {
    let currentStock = vehicleInfo.initialStock;
    
    return vehicleInfo.months.map((item, idx) => {
      const isFuture = idx >= 6;
      let sales = item.sales;
      let production = item.production;
      
      if (isFuture) {
        sales = Math.round(item.sales * (1 + salesAdj / 100));
        production = Math.round(item.production * (1 + prodAdj / 100));
        
        if (manualSales[selectedVehicle][idx] !== undefined) {
          sales = manualSales[selectedVehicle][idx];
        }
        if (manualProd[selectedVehicle][idx] !== undefined) {
          production = manualProd[selectedVehicle][idx];
        }
      }
      
      currentStock = Math.max(0, currentStock + production - sales);
      const dailySales = Math.max(1, sales / 30);
      const coverageDays = Math.round((currentStock / dailySales) * 10) / 10;
      
      return {
        month: item.month,
        isFuture,
        sales,
        production,
        endingStock: currentStock,
        coverageDays,
        netDelta: production - sales,
      };
    });
  }, [selectedVehicle, prodAdj, salesAdj, manualProd, manualSales, vehicleInfo]);

  const sandboxStats = useMemo(() => {
    const totalSales = computedSandboxMonths.reduce((sum, m) => sum + m.sales, 0);
    const totalProduction = computedSandboxMonths.reduce((sum, m) => sum + m.production, 0);
    const balanceRate = Math.round((totalProduction / totalSales) * 1000) / 10;
    const finalStock = computedSandboxMonths[computedSandboxMonths.length - 1].endingStock;
    const finalCoverage = computedSandboxMonths[computedSandboxMonths.length - 1].coverageDays;
    
    let stockoutMonths = 0;
    let overstockMonths = 0;
    let totalTiedCapital = 0;
    
    computedSandboxMonths.forEach((m, idx) => {
      if (idx >= 6) {
        if (m.coverageDays < 20) stockoutMonths++;
        else if (m.coverageDays > 50) overstockMonths++;
      }
      totalTiedCapital += m.endingStock * vehicleInfo.price;
    });

    const avgTiedCapital = Math.round((totalTiedCapital / computedSandboxMonths.length) / 100); // 亿
    
    return {
      totalSales,
      totalProduction,
      balanceRate,
      finalStock,
      finalCoverage,
      stockoutMonths,
      overstockMonths,
      avgTiedCapital
    };
  }, [computedSandboxMonths, vehicleInfo]);

  // Sandbox AI Feedback
  const sandboxAiFeedback = useMemo(() => {
    if (selectedVehicle === 'v1') {
      if (prodAdj <= -15 && sandboxStats.finalCoverage <= 40) {
        return {
          status: 'success',
          title: '排产已有效调减，产销存拟合处于合理区间',
          desc: '您将未来的排产调减了，年底可用库存覆盖天数降至较健康的 ' + sandboxStats.finalCoverage + ' 天。成功避免了资金的长期呆滞，预计可释放运营资金约 ' + Math.round((sandboxStats.avgTiedCapital * 0.15) * 100) / 100 + ' 亿元。',
          actions: ['继续对华东大区过剩车辆开展向华西或大西北的跨区调拨。', '停止购买高额在途物料，防止多余零部件囤积库房造成二级呆滞。']
        };
      } else {
        return {
          status: 'warning',
          title: '多拉3米8 库存水平持续偏高，产销处于失衡通道',
          desc: '当前未针对排产做足够调减（年底可用库存覆盖天数高达 ' + sandboxStats.finalCoverage + ' 天，远超 30 天安全警戒线）。若维持目前排产，在库车辆不仅面临高额呆滞资金占用（约 ' + sandboxStats.avgTiedCapital + ' 亿元），还将因改款换代产生跌价拨备风险。',
          actions: ['【强力建议】将“排产偏差”滑动至 -20% 以下，切断工厂无效盲目灌产。', '配合终端营销部门，启动促销政策（如2年免息、置换补贴）快速消纳历史高库龄车辆。']
        };
      }
    } else if (selectedVehicle === 'v2') {
      if (prodAdj >= 20 && sandboxStats.finalCoverage >= 25) {
        return {
          status: 'success',
          title: '排产增幅适宜，成功对齐暴涨的客户需求',
          desc: '您主动调增了爆款“多拉大面”的后续排产（年底可用库存覆盖天数恢复至 ' + sandboxStats.finalCoverage + ' 天）。生产能力与市场旺盛订单形成了完美的曲线契合，避免了客户因等待过长（原先14天内断供风险）退单的重大损失。',
          actions: ['与电池（CATL）及主芯片供应商建立产能包干协议，确保生产线原料不发生局部卡点。', '启动下线整车“直发终端”快速通道，减少中转库入库时间。']
        };
      } else {
        return {
          status: 'danger',
          title: '严重断供警报！生产供给远低于销售大订需求',
          desc: '“多拉大面”为当前强劲爆款，但生产端排产配置不足，年底库存覆盖天数仅有 ' + sandboxStats.finalCoverage + ' 天，面临全国性的大面积断车断货风险。客户订车等待期恐超过45天，极易引发客户大批退订，痛失市场份额。',
          actions: ['【强力建议】调增“排产偏差”至 +25% 以上，实行车厂双班或三班满负荷赶产。', '将多拉3米8的部分微卡产线紧急柔性调整，部分产能分配给多拉大面。']
        };
      }
    } else {
      if (sandboxStats.finalCoverage >= 20 && sandboxStats.finalCoverage <= 40) {
        return {
          status: 'success',
          title: '精益化产销协同极度卓越',
          desc: '“多拉小货”的生产和销量实现了完美的动态贴合，库存可用天数稳居 ' + sandboxStats.finalCoverage + ' 天的极佳健康段内。库存周转处于汽车供应链行业的顶级水平。',
          actions: ['继续保持当前排产配额，每周通过经销店下订数据进行5%以内微调。', '可适当将精力投入到供应商准时交货率（OTD）的日常维护上。']
        };
      } else {
        return {
          status: 'warning',
          title: '产销平衡发生偏移，需进行适度微调',
          desc: '由于排产或销量的大幅变动，“多拉小货”年底库存覆盖天数达到了 ' + sandboxStats.finalCoverage + ' 天，脱离了 25-30 天的精益区间，请适度往回微调。',
          actions: ['轻微调节生产排产，使其向 0% 基准靠拢，保持产销曲线的拟合度。']
        };
      }
    }
  }, [selectedVehicle, prodAdj, sandboxStats]);

  // ----------------------------------------------------
  // CHART COORDINATES CALCULATION (SHARED DESIGN)
  // ----------------------------------------------------
  const width = 840;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value calculators
  const maxMacroVal = useMemo(() => {
    const all = computedMacroMonths.flatMap(m => [m.sales, m.production, m.factoryStock, m.storeStock, m.directApply]);
    return Math.max(...all, 5000) * 1.05;
  }, [computedMacroMonths]);

  const maxSandboxVal = useMemo(() => {
    const all = computedSandboxMonths.flatMap(m => [m.sales, m.production, m.endingStock]);
    return Math.max(...all, 1000) * 1.1;
  }, [computedSandboxMonths]);

  // Coordinates helper functions
  const getX = (index: number) => paddingLeft + (index / 11) * chartWidth;
  const getY = (val: number) => {
    const max = activeMode === 'macro_uploaded' ? maxMacroVal : maxSandboxVal;
    return paddingTop + chartHeight - (val / max) * chartHeight;
  };

  return (
    <div id="fitting-analysis-tab" className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Dynamic Tab Selector Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative max-w-5xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI & 数字化供应链产销存拟合分析
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                月度整车供需拟合与动态风险管理
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                高维对齐<b>市场需求（销）</b>、<b>工厂产能（产）</b>、<b>各级在库（存）</b>与<b>渠道申请</b>。深度穿透供应链核心数据，实时拟合排产偏差，拦截长库龄压仓、终端大面积断供等核心运营风险。
              </p>
            </div>
            
            {/* Master Tab Selectors */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start md:self-auto shrink-0 shadow-inner">
              <button
                onClick={() => { setActiveMode('macro_uploaded'); setActiveRiskHighlight(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeMode === 'macro_uploaded'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                1. 2026上半年大盘拟合 (用户上传数据)
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping"></span>
              </button>
              <button
                onClick={() => { setActiveMode('single_sandbox'); setActiveRiskHighlight(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeMode === 'single_sandbox'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                2. 单车型精益沙盘模拟
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODE 1: MACRO UPLOADED USER DATA ANALYSIS & SIMULATION
          ======================================================== */}
      {activeMode === 'macro_uploaded' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Key Metrics Cards for H1 actual status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">H1大盘供需偏离度</span>
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold font-mono text-slate-900">
                  {macroStats.h1BalanceRate}%
                </div>
                <div className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  严重过剩！生产为实际销量的 1.6倍
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                1-6月产 14,309 辆，销 8,928 辆
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">6月末结转大盘库存</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Layers2 className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold font-mono text-slate-900">
                  {macroStats.junEndingTotalStock} 辆
                </div>
                <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  可用天数 {macroStats.junDoi} 天 (标准 30天)
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                工厂 {realHistoricalData[5].factoryStock} | 门店 {realHistoricalData[5].storeStock} 辆
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">门店库存安全覆盖天数</span>
                <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold font-mono text-slate-900 text-rose-600">
                  9.4 天
                </div>
                <div className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                  断供警告！门店库存极度亏空
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                工厂暴仓积压 4,975辆，门店仅 785辆
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">H1平均在库占压资金</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold font-mono text-indigo-600">
                  约 {macroStats.h1AvgStockVal} 亿元
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  大额流动资金固化在工厂仓库
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                按整车均价 8.0 万元/辆测算
              </div>
            </div>

          </div>

          {/* Core Interactive Risk Point Cards (User Requested: "帮我做个拟合分析，是否有风险点") */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/40">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                  大盘产销存拟合：4 大高危业务风险诊断（点击卡片可在图表中高亮识别）
                </h3>
                <p className="text-[11px] text-slate-400">结合多维曲线，供应链各业务段严重撕裂、信息滞后、渠道塞货</p>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2.5 py-1 rounded-full border border-rose-100">
                4个核心漏洞亟待修复
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Risk 1 */}
              <button
                onClick={() => setActiveRiskHighlight(activeRiskHighlight === 'overproduction' ? null : 'overproduction')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeRiskHighlight === 'overproduction'
                    ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/10'
                }`}
              >
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                    ① 产销失联 (排产盲目)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1">工厂狂塞，车卖不掉</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  上半年累积<b>过剩排产达 5,381辆</b>。5月份单月排产 4042辆而销量仅 1611辆。生产线完全按照传统产能考核，未与市场真实零售订单挂钩，工厂盲目灌产。
                </p>
                <div className="text-[9px] text-indigo-600 font-bold mt-2 flex items-center gap-1">
                  查看供需差值 (Delta) 曲线
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>

              {/* Risk 2 */}
              <button
                onClick={() => setActiveRiskHighlight(activeRiskHighlight === 'channel_mismatch' ? null : 'channel_mismatch')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeRiskHighlight === 'channel_mismatch'
                    ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/10'
                }`}
              >
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                    ② 渠道结构错配 (有市无车)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1">工厂暴仓，门店挨饿</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  <b>2月份门店库存仅剩 18辆</b>（近乎空城断档），而工厂积压 2,265辆！6月份销量高达 2495辆，但门店仅 785辆，极速周转天数仅 9天。车子全积压在总厂。
                </p>
                <div className="text-[9px] text-indigo-600 font-bold mt-2 flex items-center gap-1">
                  对比 厂库(橙) VS 门店(青)
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>

              {/* Risk 3 */}
              <button
                onClick={() => setActiveRiskHighlight(activeRiskHighlight === 'capital_freeze' ? null : 'capital_freeze')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeRiskHighlight === 'capital_freeze'
                    ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/10'
                }`}
              >
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[11px] font-bold text-red-700 bg-red-100/60 px-2 py-0.5 rounded">
                    ③ 资金高额占压与跌价
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1">4.6亿元现金流固化</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  6月末<b>在库总值达 4.61亿元</b>。随着下半年车市改款换代、政策补贴变化，呆滞在工厂的 4,975辆老款车辆将面临严重的物理损耗、电池亏电损坏与跌价提存。
                </p>
                <div className="text-[9px] text-indigo-600 font-bold mt-2 flex items-center gap-1">
                  查看在存总水位线 (5760辆)
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>

              {/* Risk 4 */}
              <button
                onClick={() => setActiveRiskHighlight(activeRiskHighlight === 'bullwhip_effect' ? null : 'bullwhip_effect')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeRiskHighlight === 'bullwhip_effect'
                    ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/10'
                }`}
              >
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                    ④ 直营申请鞭梢滞后
                  </span>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1">申请动作与零售完全脱线</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  直营申请起伏剧烈（2月仅 10辆，6月暴涨至 1,805辆），零售订单传导链条存在严重审批卡点与物流时差，导致工厂在做下月排产时得到的反馈完全失真。
                </p>
                <div className="text-[9px] text-indigo-600 font-bold mt-2 flex items-center gap-1">
                  对比 申请(紫) VS 实销(蓝)
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>

            </div>
          </div>

          {/* Layout: Graph and Sandbox Simulation for Macro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sandbox Controller (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-500" />
                    大盘 S&OP 排产模拟决策沙盘
                  </h3>
                  <p className="text-[11px] text-slate-400">调整 7-12月 规划，验证如何将 5760辆积压消化</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg text-[10px] flex items-center gap-1 hover:bg-slate-50 transition cursor-pointer font-semibold"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  恢复默认
                </button>
              </div>

              {/* Step 1: Preset Scenarios */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-600 block">快捷调用战略调控方案</label>
                <div className="space-y-2">
                  {/* Scenario A */}
                  <button
                    onClick={() => handleSelectScenario('status_quo')}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      macroScenario === 'status_quo'
                        ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-slate-900 font-extrabold">方案 A：现状维持 (工厂持续满负荷)</strong>
                        {macroScenario === 'status_quo' && <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">模拟中</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        不对排产进行调控，工厂继续高水位排产。预计年底大盘积压暴增至 <b>12,160 辆</b>，资金压死 <b>9.7 亿元</b>。
                      </p>
                    </div>
                  </button>

                  {/* Scenario B */}
                  <button
                    onClick={() => handleSelectScenario('lean_sop')}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      macroScenario === 'lean_sop'
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-slate-900 font-extrabold">方案 B：精益协同 (削产补店 / 强推调拨)</strong>
                        {macroScenario === 'lean_sop' && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">推荐方案</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        未来排产急砍 <b>-45%</b>。精益控制，打通直营物流绿色通道，将 factory 囤积车辆直接调拨铺货至缺车的门店。年底库存重回 <b>1,500辆 (30天DIO)</b> 健康线。
                      </p>
                    </div>
                  </button>

                  {/* Scenario C */}
                  <button
                    onClick={() => handleSelectScenario('promo_destock')}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      macroScenario === 'promo_destock'
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-slate-900 font-extrabold">方案 C：降价促销 + 适度削产</strong>
                        {macroScenario === 'promo_destock' && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">模拟中</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        开展终端2年免息/置换补贴，拉升销量 <b>+30%</b>，排产调减 <b>-20%</b>。快速吸纳陈旧库存，回笼资金。
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sliders for micro adjustments */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">前瞻 7-12月 双偏离手动微调</span>
                
                {/* Prod slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      排产调优偏离 (供)
                    </span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      macroProdAdj > 0 ? 'bg-emerald-50 text-emerald-700' : macroProdAdj < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50'
                    }`}>
                      {macroProdAdj > 0 ? `+${macroProdAdj}` : macroProdAdj}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="40"
                    value={macroProdAdj}
                    onChange={(e) => {
                      setMacroScenario('status_quo'); // go custom
                      setMacroProdAdj(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>大幅削产 -60%</span>
                    <span>基准 0%</span>
                    <span>超量增产 +40%</span>
                  </div>
                </div>

                {/* Sales slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      销量前瞻偏差 (需)
                    </span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      macroSalesAdj > 0 ? 'bg-indigo-50 text-indigo-700' : macroSalesAdj < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50'
                    }`}>
                      {macroSalesAdj > 0 ? `+${macroSalesAdj}` : macroSalesAdj}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="40"
                    value={macroSalesAdj}
                    onChange={(e) => {
                      setMacroScenario('status_quo'); // go custom
                      setMacroSalesAdj(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>需求遇冷 -20%</span>
                    <span>基准 0%</span>
                    <span>需求爆发 +40%</span>
                  </div>
                </div>
              </div>

              {/* Sandbox Financial projection card */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
                <span className="text-[9px] font-bold text-indigo-300 block tracking-wider uppercase">沙盘运行报告 (模拟至12月底)</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px]">期末在库存水位</span>
                    <strong className="text-sm font-extrabold font-mono block">
                      {macroStats.decEndingStock} 辆
                    </strong>
                    <span className={`text-[9px] block font-bold ${macroStats.decDoi < 20 ? 'text-red-400' : macroStats.decDoi > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      覆盖 {macroStats.decDoi} 天 ({macroStats.decDoi < 20 ? '断供风险' : macroStats.decDoi > 50 ? '大量呆滞' : '精益健康'})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px]">全年均资金占压</span>
                    <strong className="text-sm font-extrabold font-mono text-indigo-300 block">
                      {macroStats.fullYearAvgStockVal} 亿元
                    </strong>
                    {macroScenario !== 'status_quo' ? (
                      <span className="text-[9px] text-emerald-400 font-bold block">
                        预计释放资金约 {(macroStats.h1AvgStockVal - macroStats.fullYearAvgStockVal).toFixed(2)} 亿元
                      </span>
                    ) : (
                      <span className="text-[9px] text-rose-400 font-bold block">
                        资金链利息损失剧增
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Interactive Graph with Multi-curve Legend Toggle (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <LineChart className="w-4 h-4 text-indigo-600" />
                    多维协同拟合折线大图 (H1 真实数据 + H2 沙盘预测)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    支持点击下方图例，单独隐藏某些复杂曲线，使大图展示更加清晰。
                  </p>
                </div>
              </div>

              {/* Graph display controls / Legend Toggles */}
              <div className="flex flex-wrap gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-bold select-none">
                <button
                  onClick={() => setShowProduction(!showProduction)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                    showProduction ? 'bg-white border-emerald-200 text-emerald-800 shadow-sm' : 'border-transparent text-slate-400 bg-slate-100/40 line-through'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  生产 (入库) {showProduction ? <Eye className="w-3 h-3 ml-0.5 text-emerald-600" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
                </button>

                <button
                  onClick={() => setShowSales(!showSales)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                    showSales ? 'bg-white border-indigo-200 text-indigo-800 shadow-sm' : 'border-transparent text-slate-400 bg-slate-100/40 line-through'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  销售订单 (需求) {showSales ? <Eye className="w-3 h-3 ml-0.5 text-indigo-600" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
                </button>

                <button
                  onClick={() => setShowFactoryStock(!showFactoryStock)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                    showFactoryStock ? 'bg-white border-amber-200 text-amber-800 shadow-sm' : 'border-transparent text-slate-400 bg-slate-100/40 line-through'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  库存 (工厂) {showFactoryStock ? <Eye className="w-3 h-3 ml-0.5 text-amber-600" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
                </button>

                <button
                  onClick={() => setShowStoreStock(!showStoreStock)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                    showStoreStock ? 'bg-white border-teal-200 text-teal-800 shadow-sm' : 'border-transparent text-slate-400 bg-slate-100/40 line-through'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  库存 (门店) {showStoreStock ? <Eye className="w-3 h-3 ml-0.5 text-teal-600" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
                </button>

                <button
                  onClick={() => setShowDirectApply(!showDirectApply)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                    showDirectApply ? 'bg-white border-purple-200 text-purple-800 shadow-sm' : 'border-transparent text-slate-400 bg-slate-100/40 line-through'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  直营申请 {showDirectApply ? <Eye className="w-3 h-3 ml-0.5 text-purple-600" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
                </button>
              </div>

              {/* SVG Curve Container */}
              <div className="relative bg-slate-950 rounded-2xl p-3 border border-slate-900 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950 pointer-events-none"></div>

                <div className="relative">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                      const yVal = Math.round(maxMacroVal * p);
                      const y = paddingTop + chartHeight - p * chartHeight;
                      return (
                        <g key={i}>
                          <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                          <text x={paddingLeft - 8} y={y + 3} fill="#475569" fontSize="8" fontWeight="bold" textAnchor="end" className="font-mono">
                            {yVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Split line for actual vs forecast */}
                    <line x1={getX(5)} y1={paddingTop - 10} x2={getX(5)} y2={paddingTop + chartHeight + 10} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                    
                    {/* Background safety shadow if active highlight corresponds */}
                    {activeRiskHighlight === 'overproduction' && (
                      <g opacity="0.1">
                        <rect x={getX(2) - 10} y={paddingTop} width={getX(5) - getX(2) + 20} height={chartHeight} fill="#6366f1" />
                        <text x={getX(4)} y={paddingTop + 30} fill="#6366f1" fontSize="16" fontWeight="bold" textAnchor="middle">
                          产销缺口极度拉大区域
                        </text>
                      </g>
                    )}

                    {activeRiskHighlight === 'channel_mismatch' && (
                      <g opacity="0.15">
                        {/* Highlights Jan-Jun store-factory split */}
                        <rect x={paddingLeft} y={paddingTop} width={chartWidth} height={chartHeight} fill="#f59e0b" />
                        <circle cx={getX(1)} cy={getY(18)} r="40" fill="#f43f5e" />
                        <text x={getX(1) + 50} y={getY(18) - 10} fill="#f43f5e" fontSize="14" fontWeight="extrabold">
                          2月门店几近空档(18辆)！
                        </text>
                      </g>
                    )}

                    {activeRiskHighlight === 'bullwhip_effect' && (
                      <g opacity="0.15">
                        <path d={`M ${getX(0)} ${getY(817)} L ${getX(1)} ${getY(10)} L ${getX(2)} ${getY(678)}`} fill="none" stroke="#a855f7" strokeWidth="12" strokeLinecap="round" />
                        <text x={getX(1) + 40} y={getY(10) + 30} fill="#a855f7" fontSize="12" fontWeight="bold">
                          申请端大幅延迟且起伏剧烈
                        </text>
                      </g>
                    )}

                    {/* Timeline split texts */}
                    <rect x={getX(5) - 45} y={paddingTop - 15} width="41" height="15" rx="3" fill="#f43f5e" opacity="0.2" />
                    <text x={getX(5) - 25} y={paddingTop - 4} fill="#f43f5e" fontSize="8" fontWeight="extrabold" textAnchor="middle">
                      H1 实销
                    </text>
                    
                    <rect x={getX(5) + 4} y={paddingTop - 15} width="41" height="15" rx="3" fill="#818cf8" opacity="0.2" />
                    <text x={getX(5) + 24} y={paddingTop - 4} fill="#818cf8" fontSize="8" fontWeight="extrabold" textAnchor="middle">
                      H2 拟合
                    </text>

                    {/* CURVE PATHS */}
                    {/* 1. Production Line (Green) */}
                    {showProduction && (
                      <path 
                        d={computedMacroMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.production)}`).join(' ')} 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth={activeRiskHighlight === 'overproduction' ? "4" : "2.5"} 
                        strokeLinecap="round" 
                      />
                    )}

                    {/* 2. Sales Line (Indigo) */}
                    {showSales && (
                      <path 
                        d={computedMacroMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.sales)}`).join(' ')} 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth={activeRiskHighlight === 'overproduction' ? "4" : "2.5"} 
                        strokeLinecap="round" 
                      />
                    )}

                    {/* 3. Factory Inventory Line (Amber) */}
                    {showFactoryStock && (
                      <path 
                        d={computedMacroMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.factoryStock)}`).join(' ')} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth={activeRiskHighlight === 'channel_mismatch' ? "4" : "2.5"} 
                        strokeLinecap="round" 
                        strokeDasharray={activeRiskHighlight === 'channel_mismatch' ? "none" : "none"}
                      />
                    )}

                    {/* 4. Store Inventory Line (Teal/Cyan) */}
                    {showStoreStock && (
                      <path 
                        d={computedMacroMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.storeStock)}`).join(' ')} 
                        fill="none" 
                        stroke="#2dd4bf" 
                        strokeWidth={activeRiskHighlight === 'channel_mismatch' ? "4" : "2.5"} 
                        strokeLinecap="round" 
                      />
                    )}

                    {/* 5. Direct Sales Application (Purple) */}
                    {showDirectApply && (
                      <path 
                        d={computedMacroMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.directApply)}`).join(' ')} 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth={activeRiskHighlight === 'bullwhip_effect' ? "4.5" : "2"} 
                        strokeLinecap="round" 
                        strokeDasharray="4,2"
                      />
                    )}

                    {/* Vertical hover line overlay */}
                    {hoveredMonthIdx !== null && (
                      <line x1={getX(hoveredMonthIdx)} y1={paddingTop} x2={getX(hoveredMonthIdx)} y2={paddingTop + chartHeight} stroke="#ffffff" strokeWidth="1" opacity="0.3" />
                    )}

                    {/* Dots and Interactions */}
                    {computedMacroMonths.map((m, idx) => {
                      const x = getX(idx);
                      const isHovered = hoveredMonthIdx === idx;

                      return (
                        <g 
                          key={idx} 
                          onMouseEnter={() => setHoveredMonthIdx(idx)}
                          onMouseLeave={() => setHoveredMonthIdx(null)}
                          className="cursor-pointer"
                        >
                          <rect x={x - 20} y={paddingTop} width="40" height={chartHeight} fill="transparent" />

                          {/* Dots */}
                          {showProduction && <circle cx={x} cy={getY(m.production)} r={isHovered ? "5" : "3"} fill="#10b981" stroke="#020617" strokeWidth="1.5" />}
                          {showSales && <circle cx={x} cy={getY(m.sales)} r={isHovered ? "5" : "3"} fill="#6366f1" stroke="#020617" strokeWidth="1.5" />}
                          {showFactoryStock && <circle cx={x} cy={getY(m.factoryStock)} r={isHovered ? "6" : "4"} fill="#f59e0b" stroke="#020617" strokeWidth="1.5" />}
                          {showStoreStock && <circle cx={x} cy={getY(m.storeStock)} r={isHovered ? "5" : "3"} fill="#2dd4bf" stroke="#020617" strokeWidth="1.5" />}
                          {showDirectApply && <circle cx={x} cy={getY(m.directApply)} r={isHovered ? "4" : "2"} fill="#a855f7" stroke="#020617" strokeWidth="1" />}

                          {/* Custom visual warnings right inside the graph for history */}
                          {!m.isFuture && idx === 1 && showStoreStock && (
                            <g>
                              <circle cx={x} cy={getY(18)} r="10" fill="none" stroke="#f43f5e" strokeWidth="1.5" className="animate-ping" />
                              <text x={x} y={getY(18) - 15} fill="#f43f5e" fontSize="7" fontWeight="bold" textAnchor="middle">
                                仅剩18辆！
                              </text>
                            </g>
                          )}

                          {!m.isFuture && idx === 5 && showFactoryStock && (
                            <g>
                              <text x={x + 12} y={getY(4975) + 12} fill="#f59e0b" fontSize="8" fontWeight="black">
                                4975辆积压
                              </text>
                            </g>
                          )}

                          {/* Hover value tooltip */}
                          {isHovered && (
                            <g>
                              <rect x={x - 70} y={paddingTop} width="140" height="66" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" opacity="0.96" />
                              <text x={x} y={paddingTop + 14} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                                {m.month} 数据拟合
                              </text>
                              <text x={x} y={paddingTop + 27} fill="#10b981" fontSize="8" textAnchor="middle">
                                生产: {m.production} 辆 | 销: {m.sales} 辆
                              </text>
                              <text x={x} y={paddingTop + 39} fill="#f59e0b" fontSize="8" textAnchor="middle">
                                厂库: {m.factoryStock} 辆 | 门库: {m.storeStock} 辆
                              </text>
                              <text x={x} y={paddingTop + 51} fill="#cbd5e1" fontSize="8" textAnchor="middle">
                                直营申请: {m.directApply} | 存周转 {Math.round((m.factoryStock+m.storeStock)/(m.sales/30))}天
                              </text>
                            </g>
                          )}

                          <text x={x} y={paddingTop + chartHeight + 16} fill={isHovered ? '#ffffff' : idx === 5 ? '#f43f5e' : '#64748b'} fontSize="8.5" fontWeight={isHovered || idx === 5 ? 'bold' : 'normal'} textAnchor="middle">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Action Plan recommendations banner based on scenario selected */}
              <div className={`p-4 rounded-xl border transition-all duration-200 ${
                macroScenario === 'lean_sop'
                  ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950'
                  : macroScenario === 'promo_destock'
                  ? 'bg-indigo-50/40 border-indigo-100 text-indigo-950'
                  : 'bg-rose-50/40 border-rose-100 text-rose-950'
              }`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/40">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <strong className="text-xs font-extrabold text-slate-800">
                    S&OP 协同调控行动决策 ({macroScenario === 'lean_sop' ? '精益削产调拨方案' : macroScenario === 'promo_destock' ? '营销拉涨促销去库' : '现状暴仓警报'})
                  </strong>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-2">
                  {macroScenario === 'lean_sop' ? (
                    <span>
                      <b>核心决策动作</b>：1. 强制将三季度排产削减45%（下调至1600辆/月以内），避免工厂继续低效增库；2. 启动“厂-店”直通快运通道，跳过区域中转库，优先将高配置积压车型强制分拔至华中、华南订单等待严重的门店；3. 缩短门店直营申请审批流至24小时。
                    </span>
                  ) : macroScenario === 'promo_destock' ? (
                    <span>
                      <b>核心决策动作</b>：1. 针对长库龄工厂滞销车提供“8000元现金置换”及“18期免息”，刺激C端实际零售，将月均销量拉升至 2200 辆以上；2. 工厂按柔性比例（-20%）控制产线速度，腾出多余产能包干生产新能源大面，实现产能和资金的高速替换。
                    </span>
                  ) : (
                    <span>
                      <b>核心警报指出</b>：不对下半年排产做干预（维持目前盲目排产），年底工厂堆积将冲破 10,000 辆，库龄超过 90 天，产生严重的物理老化与改款贬值。<b>强烈建议一键启用“精益协同”或“降价促销”方案！</b>
                    </span>
                  )}
                </p>
              </div>

            </div>

          </div>

          {/* Table displaying the full monthly detail with customizable forecast inputs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  全渠道产销存拟合明细表（支持手动编辑 H2 数值微调）
                </h3>
                <p className="text-[11px] text-slate-400">
                  您可以直接修改表格中<b>7月-12月</b>的数值，精确模拟华东总厂与华北各大直营店的供需动态。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold font-mono">
                    <th className="py-3.5 px-4">月份</th>
                    <th className="py-3.5 px-4">状态属性</th>
                    <th className="py-3.5 px-4 text-emerald-800 bg-emerald-50/15">生产入库 (供给)</th>
                    <th className="py-3.5 px-4 text-indigo-800 bg-indigo-50/15">销售订单 (零售需求)</th>
                    <th className="py-3.5 px-4">库存-工厂 (积压水库)</th>
                    <th className="py-3.5 px-4 text-teal-800 bg-teal-50/15">库存-门店 (零售前线)</th>
                    <th className="py-3.5 px-4 text-purple-800 bg-purple-50/15">直营申请 (补货信号)</th>
                    <th className="py-3.5 px-4">在存可用天数 (DIO)</th>
                    <th className="py-3.5 px-4">健康状态评估</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {computedMacroMonths.map((m, idx) => {
                    const isFuture = m.isFuture;
                    const totalEndingStock = m.factoryStock + m.storeStock;
                    const dio = Math.round((totalEndingStock / Math.max(1, m.sales / 30)) * 10) / 10;
                    
                    const statusClass = dio < 20
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : dio > 50
                      ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100';

                    const statusText = dio < 20
                      ? '断供预警'
                      : dio > 50
                      ? '呆滞爆仓'
                      : '健康拟合';

                    return (
                      <tr 
                        key={idx} 
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                        className={`hover:bg-slate-50/80 transition-colors ${hoveredMonthIdx === idx ? 'bg-indigo-50/15' : ''}`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800">{m.month}</td>
                        <td className="py-3 px-4">
                          {!isFuture ? (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">历史真实</span>
                          ) : (
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-indigo-100">
                              <Sparkles className="w-2.5 h-2.5" />
                              前瞻沙盘
                            </span>
                          )}
                        </td>

                        {/* Production */}
                        <td className="py-1 px-4 bg-emerald-50/5">
                          {!isFuture ? (
                            <span className="font-mono font-bold text-emerald-950">{m.production}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={m.production}
                                onChange={(e) => {
                                  setMacroScenario('status_quo');
                                  const val = Math.max(0, Number(e.target.value));
                                  setMacroManualProd(prev => ({ ...prev, [idx]: val }));
                                }}
                                className="w-16 px-1.5 py-1 text-xs border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded font-mono font-bold text-emerald-950 bg-white"
                              />
                              <span className="text-[10px] text-slate-400">辆</span>
                            </div>
                          )}
                        </td>

                        {/* Sales */}
                        <td className="py-1 px-4 bg-indigo-50/5">
                          {!isFuture ? (
                            <span className="font-mono font-bold text-indigo-950">{m.sales}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={m.sales}
                                onChange={(e) => {
                                  setMacroScenario('status_quo');
                                  const val = Math.max(0, Number(e.target.value));
                                  setMacroManualSales(prev => ({ ...prev, [idx]: val }));
                                }}
                                className="w-16 px-1.5 py-1 text-xs border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded font-mono font-bold text-indigo-950 bg-white"
                              />
                              <span className="text-[10px] text-slate-400">辆</span>
                            </div>
                          )}
                        </td>

                        {/* Factory Inventory */}
                        <td className="py-3 px-4 font-mono font-bold text-amber-700 bg-amber-50/10">
                          {m.factoryStock} 辆
                        </td>

                        {/* Store Inventory */}
                        <td className={`py-3 px-4 font-mono font-bold text-teal-800 bg-teal-50/10 ${!isFuture && m.storeStock < 100 ? 'text-rose-600 font-extrabold bg-rose-50' : ''}`}>
                          {m.storeStock} 辆
                        </td>

                        {/* Direct Sales Application */}
                        <td className="py-3 px-4 font-mono text-purple-700 bg-purple-50/10">
                          {m.directApply}
                        </td>

                        {/* DIO */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {dio} 天
                        </td>

                        {/* Evaluation Badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          MODE 2: SINGLE VEHICLE SANDBOX SIMULATION (Original)
          ======================================================== */}
      {activeMode === 'single_sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Control Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  产销存拟合控制台
                </h3>
                <p className="text-[11px] text-slate-400">选择具体车型并调整未来销量与排产的偏离度</p>
              </div>
              
              <button 
                onClick={handleReset}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg text-xs flex items-center gap-1 hover:bg-slate-50 transition cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                恢复默认
              </button>
            </div>

            {/* Model Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">当前模拟分析车型</label>
              <div className="grid grid-cols-3 gap-2">
                {(['v1', 'v2', 'v3'] as const).map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedVehicle(id)}
                    className={`py-3 px-2.5 rounded-xl text-center border transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedVehicle === id
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-bold shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100/50'
                    }`}
                  >
                    <Car className={`w-4 h-4 ${selectedVehicle === id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div className="text-[11px] leading-tight font-extrabold">{baselineData[id].name.split(' ')[0]}</div>
                    <span className="text-[9px] text-slate-400 font-normal font-mono">{baselineData[id].price} 万元</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Container */}
            <div className="space-y-5 pt-2">
              
              {/* Global Future Production Adjuster */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    未来 6 个月排产调控偏离度
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                    prodAdj > 0 ? 'bg-emerald-50 text-emerald-700' : prodAdj < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {prodAdj > 0 ? `+${prodAdj}` : prodAdj}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  全局调整 7-12 月工厂月度生产计划。调高解决缺货订单，调低消化呆滞库存。
                </p>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={prodAdj}
                    onChange={(e) => setProdAdj(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                    <span>减产 -50%</span>
                    <span>基准 0%</span>
                    <span>增产 +50%</span>
                  </div>
                </div>
              </div>

              {/* Global Future Sales Adjuster */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    未来 6 个月销量预期修正值
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                    salesAdj > 0 ? 'bg-indigo-50 text-indigo-700' : salesAdj < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {salesAdj > 0 ? `+${salesAdj}` : salesAdj}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  调整 7-12 月市场端销售需求预期。模拟终端市场爆发或需求萎缩情景。
                </p>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={salesAdj}
                    onChange={(e) => setSalesAdj(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                    <span>萎缩 -30%</span>
                    <span>基准 0%</span>
                    <span>旺盛 +30%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Core Configuration Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">当前车型静态参数</span>
              <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                <div>
                  <span className="text-slate-400 block text-[10px]">车型单价</span>
                  <strong className="text-slate-800 font-mono">{vehicleInfo.price} 万元/辆</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">年初结转库存</span>
                  <strong className="text-slate-800 font-mono">{vehicleInfo.initialStock} 辆</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/50">
                  <span className="text-slate-400 block text-[10px]">安全库存天数目标</span>
                  <strong className="text-slate-800 font-mono">20 - 45 天 (平衡稳健期)</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Chart Display (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Layers2 className="w-4.5 h-4.5 text-indigo-500" />
                  产销存协同拟合折线大图 (车型级)
                </h3>
                <p className="text-[11px] text-slate-400">
                  蓝线（销售）、绿线（生产）、黄线（库存）。1-6月为真实销售，7-12月为拟合前瞻区。
                </p>
              </div>
              
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-indigo-500 inline-block"></span> 销量
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span> 生产计划
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-500 inline-block"></span> 滚存库存
                </span>
              </div>
            </div>

            {/* SVG Visualizer Container */}
            <div className="relative bg-slate-950 rounded-2xl p-3 border border-slate-900 shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950 pointer-events-none"></div>

              <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                    const yVal = Math.round(maxSandboxVal * p);
                    const y = paddingTop + chartHeight - p * chartHeight;
                    return (
                      <g key={i}>
                        <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                        <text x={paddingLeft - 8} y={y + 3} fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">
                          {yVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical split indicator */}
                  <line x1={getX(5)} y1={paddingTop - 10} x2={getX(5)} y2={paddingTop + chartHeight + 10} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                  
                  <rect x={getX(5) - 45} y={paddingTop - 15} width="41" height="15" rx="3" fill="#f43f5e" opacity="0.15" />
                  <text x={getX(5) - 25} y={paddingTop - 4} fill="#f43f5e" fontSize="8" fontWeight="extrabold" textAnchor="middle">
                    实销截止
                  </text>
                  
                  <rect x={getX(5) + 4} y={paddingTop - 15} width="41" height="15" rx="3" fill="#818cf8" opacity="0.15" />
                  <text x={getX(5) + 24} y={paddingTop - 4} fill="#818cf8" fontSize="8" fontWeight="extrabold" textAnchor="middle">
                    预测拟合
                  </text>

                  {/* Curves */}
                  <path d={computedSandboxMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.sales)}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                  <path d={computedSandboxMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.production)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d={computedSandboxMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.endingStock)}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

                  {hoveredMonthIdx !== null && (
                    <line x1={getX(hoveredMonthIdx)} y1={paddingTop} x2={getX(hoveredMonthIdx)} y2={paddingTop + chartHeight} stroke="#ffffff" strokeWidth="1" opacity="0.3" />
                  )}

                  {computedSandboxMonths.map((m, idx) => {
                    const x = getX(idx);
                    const isHovered = hoveredMonthIdx === idx;

                    return (
                      <g 
                        key={idx} 
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                        className="cursor-pointer"
                      >
                        <rect x={x - 25} y={paddingTop} width="50" height={chartHeight} fill="transparent" />

                        <circle cx={x} cy={getY(m.sales)} r={isHovered ? "6" : "3.5"} fill="#6366f1" stroke="#020617" strokeWidth="1.5" />
                        <circle cx={x} cy={getY(m.production)} r={isHovered ? "6" : "3.5"} fill="#10b981" stroke="#020617" strokeWidth="1.5" />
                        <circle cx={x} cy={getY(m.endingStock)} r={isHovered ? "7" : "4.5"} fill="#f59e0b" stroke="#020617" strokeWidth="2" />

                        {isHovered && (
                          <g>
                            <rect x={x - 65} y={getY(m.endingStock) - 45} width="130" height="36" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" opacity="0.95" />
                            <text x={x} y={getY(m.endingStock) - 32} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                              库存在存: {m.endingStock} 辆
                            </text>
                            <text x={x} y={getY(m.endingStock) - 20} fill="#cbd5e1" fontSize="8" textAnchor="middle">
                              产 {m.production} | 销 {m.sales} | 覆盖 {m.coverageDays}天
                            </text>
                          </g>
                        )}

                        <text x={x} y={paddingTop + chartHeight + 18} fill={isHovered ? '#ffffff' : idx === 5 ? '#f43f5e' : '#64748b'} fontSize="9" fontWeight={isHovered || idx === 5 ? 'bold' : 'normal'} textAnchor="middle">
                          {m.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Sandbox Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">前瞻周期产销拟合率</span>
                <div className="text-base font-extrabold font-mono text-slate-900 flex items-center justify-center gap-1">
                  {sandboxStats.balanceRate}%
                  {Math.abs(sandboxStats.balanceRate - 100) < 5 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <span className="text-[9px] text-slate-400 block">目标理想值：98% - 102%</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">年底结转库存水位</span>
                <div className="text-base font-extrabold font-mono text-slate-900">
                  {sandboxStats.finalStock} 辆
                </div>
                <span className={`text-[9px] block font-bold ${
                  sandboxStats.finalCoverage < 20 ? 'text-rose-500' : sandboxStats.finalCoverage > 50 ? 'text-amber-500' : 'text-emerald-600'
                }`}>
                  覆盖 {sandboxStats.finalCoverage} 天 ({sandboxStats.finalCoverage < 20 ? '缺货偏低' : sandboxStats.finalCoverage > 50 ? '积压高水' : '精益健康'})
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">月均在库呆滞资金</span>
                <div className="text-base font-extrabold font-mono text-slate-900 text-indigo-600">
                  {sandboxStats.avgTiedCapital} 亿元
                </div>
                <span className="text-[9px] text-slate-400 block">在库积压车折算资本总值</span>
              </div>
            </div>

          </div>

          {/* Sandbox AI Feedback Box */}
          <div className="col-span-12">
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              sandboxAiFeedback.status === 'success' 
                ? 'bg-emerald-50/40 border-emerald-100' 
                : sandboxAiFeedback.status === 'warning' 
                ? 'bg-amber-50/40 border-amber-100' 
                : 'bg-rose-50/40 border-rose-100'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/40">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    sandboxAiFeedback.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : sandboxAiFeedback.status === 'warning' ? 'bg-amber-500/10 text-amber-700' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-slate-900">{sandboxAiFeedback.title}</h4>
                    <p className="text-xs text-slate-500">基于车型排产偏差 {prodAdj}%、销量偏差 {salesAdj}% 进行的供需拟合推演</p>
                  </div>
                </div>
                <div className="inline-flex px-3 py-1 bg-white rounded-full text-xs font-bold font-mono text-slate-700 shadow-sm border border-slate-200/50">
                  平均拟合平衡度: <span className="text-indigo-600 ml-1.5">{sandboxStats.balanceRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                <div className="lg:col-span-7 space-y-2">
                  <h5 className="text-xs font-bold text-slate-700">拟合状态诊断报告：</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sandboxAiFeedback.desc}
                  </p>
                </div>
                <div className="lg:col-span-5 space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-700">推荐调控行动项 (Action Items)：</h5>
                  <div className="space-y-1.5">
                    {sandboxAiFeedback.actions.map((act, i) => (
                      <div key={i} className="flex gap-2 items-start text-[11px] text-slate-600">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-white text-slate-700 flex items-center justify-center border text-[9px] font-bold font-mono">
                          {i+1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox detail table */}
          <div className="col-span-12">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    单车型产销存明细（支持 7-12月 手动编辑数值）
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    直接编辑下半年生产与销量值，在库水位和周转天数将实时跑算。
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold font-mono">
                      <th className="py-3.5 px-4">月份</th>
                      <th className="py-3.5 px-4">状态属性</th>
                      <th className="py-3.5 px-4 text-indigo-700 bg-indigo-50/10">销量 (需求)</th>
                      <th className="py-3.5 px-4 text-emerald-700 bg-emerald-50/10">生产计划 (供给)</th>
                      <th className="py-3.5 px-4">产销净差值 (Delta)</th>
                      <th className="py-3.5 px-4">滚存库存 (存量)</th>
                      <th className="py-3.5 px-4">库存可用天数 (DIO)</th>
                      <th className="py-3.5 px-4">健康度状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computedSandboxMonths.map((m, idx) => {
                      const isPast = !m.isFuture;
                      const statusClass = m.coverageDays < 20 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : m.coverageDays > 50 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      
                      const statusText = m.coverageDays < 20 
                        ? '断供缺货' 
                        : m.coverageDays > 50 
                        ? '呆滞积压' 
                        : '健康精益';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{m.month}</td>
                          <td className="py-3 px-4">
                            {isPast ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">历史实销</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-bold flex items-center gap-1 w-fit">
                                <Sparkles className="w-2.5 h-2.5" />
                                预测微调
                              </span>
                            )}
                          </td>

                          {/* Sales */}
                          <td className="py-1 px-4 bg-indigo-50/5">
                            {isPast ? (
                              <span className="font-mono font-bold text-indigo-900">{m.sales}</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={m.sales}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    setManualSales(prev => ({
                                      ...prev,
                                      [selectedVehicle]: { ...prev[selectedVehicle], [idx]: val }
                                    }));
                                  }}
                                  className="w-16 px-1.5 py-1 text-xs border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded font-mono font-bold text-indigo-900 bg-white"
                                />
                                <span className="text-[10px] text-slate-400">辆</span>
                              </div>
                            )}
                          </td>

                          {/* Production */}
                          <td className="py-1 px-4 bg-emerald-50/5">
                            {isPast ? (
                              <span className="font-mono font-bold text-emerald-900">{m.production}</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={m.production}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    setManualProd(prev => ({
                                      ...prev,
                                      [selectedVehicle]: { ...prev[selectedVehicle], [idx]: val }
                                    }));
                                  }}
                                  className="w-16 px-1.5 py-1 text-xs border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded font-mono font-bold text-emerald-900 bg-white"
                                />
                                <span className="text-[10px] text-slate-400">辆</span>
                              </div>
                            )}
                          </td>

                          <td className={`py-3 px-4 font-mono font-bold ${m.netDelta > 0 ? 'text-emerald-600' : m.netDelta < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {m.netDelta > 0 ? `+${m.netDelta}` : m.netDelta}
                          </td>
                          <td className="py-3 px-4 font-mono font-extrabold text-slate-900 bg-slate-50/30">{m.endingStock} 辆</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.coverageDays} 天</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                              <span className="w-1 h-1 rounded-full bg-current"></span>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
