import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  ClipboardList, 
  Factory, 
  Cpu, 
  CheckCircle2, 
  Warehouse, 
  Truck, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  Sliders, 
  Database, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Search, 
  Info, 
  Zap, 
  Check, 
  ChevronRight,
  PackageCheck,
  Building2,
  Boxes,
  UserCheck,
  Users,
  ShieldAlert,
  FileCheck,
  PhoneCall,
  BadgeCheck,
  Activity,
  History,
  X,
  Lock,
  ArrowUpRight
} from 'lucide-react';

// Step definition interface with Responsible Owner (RACI) info
interface StepInfo {
  step: number;
  id: string;
  title: string;
  subTitle: string;
  tag1: string;
  tag2: string;
  icon: React.ElementType;
  // Responsible Owner Details
  ownerName: string;
  ownerTitle: string;
  ownerDept: string;
  ownerAvatar: string;
  ownerPhone: string;
  kpiMetrics: string;
  systemName: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  badgeBg: string;
}

// Simulated Order item for Step 01
interface TerminalOrder {
  id: string;
  channel: '直营门店' | '线上APP' | '大客户渠道';
  model: string;
  quantity: number;
  orderDate: string;
  status: '已提报' | '已锁单' | '交付中' | '已闭环';
  fittedDemand: number;
  ownerApproval: boolean;
}

// Simulated VIN Vehicle for Step 06
interface VehicleVIN {
  vin: string;
  model: string;
  color: string;
  offlineDate: string;
  location: '工厂中央仓' | '华东交付中心' | '华南体验店' | '在途运输';
  status: '待配车' | '已锁定' | '在途调拨' | '已提车';
  agingDays: number;
  inspectorName: string;
}

// Simulated Store Watermark Inventory for Step 07
interface StoreWatermark {
  storeName: string;
  region: string;
  currentStock: number;
  targetWatermark: number;
  safetyWatermark: number;
  inTransit: number;
  gap: number;
  storeManager: string;
}

// Simulated BOM Component item for Step 04
interface BOMComponent {
  partCode: string;
  partName: string;
  usagePerVehicle: number;
  requiredQty: number;
  availableStock: number;
  safetyThreshold: number;
  supplier: string;
  hardGateStatus: '安全允许' | '触发表后硬卡口' | '需紧急PO采购';
  ownerName: string;
}

export default function LifecycleInventoryDemo() {
  // Currently focused step in the 7-stage workflow (0 = All-in-one / Summary)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Modal states for Owner Details
  const [selectedOwnerStep, setSelectedOwnerStep] = useState<StepInfo | null>(null);

  // Simulation state variables
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStepProgress, setSimStepProgress] = useState<number>(0);

  // Filter & search states
  const [vinSearchQuery, setVinSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('多拉大面');

  // Interactive Live Quantities (Stateful for simulation)
  const [terminalOrders, setTerminalOrders] = useState<TerminalOrder[]>([
    { id: 'ORD-20260728-01', channel: '直营门店', model: '多拉大面', quantity: 120, orderDate: '2026-07-28', status: '已锁单', fittedDemand: 114, ownerApproval: true },
    { id: 'ORD-20260728-02', channel: '线上APP', model: '3米8微卡', quantity: 80, orderDate: '2026-07-28', status: '已锁单', fittedDemand: 76, ownerApproval: true },
    { id: 'ORD-20260727-03', channel: '大客户渠道', model: '多拉大面', quantity: 200, orderDate: '2026-07-27', status: '交付中', fittedDemand: 195, ownerApproval: true },
    { id: 'ORD-20260726-04', channel: '直营门店', model: '3米8微卡', quantity: 60, orderDate: '2026-07-26', status: '已闭环', fittedDemand: 60, ownerApproval: true },
  ]);

  // VIN vehicle inventory state
  const [vinInventory, setVinInventory] = useState<VehicleVIN[]>([
    { vin: 'LHG-DM20260728-001', model: '多拉大面', color: '极光白', offlineDate: '2026-07-28', location: '工厂中央仓', status: '待配车', agingDays: 2, inspectorName: '赵勇 (总装主管)' },
    { vin: 'LHG-DM20260728-002', model: '多拉大面', color: '星空灰', offlineDate: '2026-07-28', location: '工厂中央仓', status: '已锁定', agingDays: 1, inspectorName: '赵勇 (总装主管)' },
    { vin: 'LHG-DM20260725-018', model: '多拉大面', color: '曜石黑', offlineDate: '2026-07-25', location: '华东交付中心', status: '待配车', agingDays: 5, inspectorName: '周杰 (整车仓储)' },
    { vin: 'LHG-WK20260720-045', model: '3米8微卡', color: '工程黄', offlineDate: '2026-07-20', location: '华南体验店', status: '已锁定', agingDays: 10, inspectorName: '孙莉 (全国调度)' },
    { vin: 'LHG-DM20260610-099', model: '多拉大面', color: '极光白', offlineDate: '2026-06-10', location: '华东交付中心', status: '待配车', agingDays: 52, inspectorName: '周杰 (整车仓储)' }, // Overaged!
    { vin: 'LHG-WK20260727-003', model: '3米8微卡', color: '极光白', offlineDate: '2026-07-27', location: '在途运输', status: '在途调拨', agingDays: 3, inspectorName: '孙莉 (全国调度)' },
  ]);

  // Store Watermark State
  const [storeWatermarks, setStoreWatermarks] = useState<StoreWatermark[]>([
    { storeName: '华东中心交付店', region: '华东', currentStock: 140, targetWatermark: 90, safetyWatermark: 50, inTransit: 10, gap: -50, storeManager: '刘明 (华东店长)' }, // Overstocked
    { storeName: '华南旗舰体验店', region: '华南', currentStock: 25, targetWatermark: 80, safetyWatermark: 45, inTransit: 15, gap: 40, storeManager: '陈强 (华南店长)' },  // Understocked
    { storeName: '华北枢纽仓', region: '华北', currentStock: 70, targetWatermark: 70, safetyWatermark: 40, inTransit: 0, gap: 0, storeManager: '王芳 (华北店长)' },    // Balanced
    { storeName: '西南交付中心', region: '西南', currentStock: 30, targetWatermark: 65, safetyWatermark: 35, inTransit: 20, gap: 15, storeManager: '张伟 (西南店长)' },  // Slight shortage
  ]);

  // BOM Components State for Step 04
  const [bomComponents, setBomComponents] = useState<BOMComponent[]>([
    { partCode: 'BAT-80KWH-01', partName: '磷酸铁锂电池包 (80kWh)', usagePerVehicle: 1, requiredQty: 100, availableStock: 320, safetyThreshold: 200, supplier: '宁德时代 (CATL)', hardGateStatus: '安全允许', ownerName: '陈晨 (采购总监)' },
    { partCode: 'MTR-150KW-02', partName: '永磁同步驱动电机 (150kW)', usagePerVehicle: 1, requiredQty: 100, availableStock: 280, safetyThreshold: 180, supplier: '精进电动', hardGateStatus: '安全允许', ownerName: '陈晨 (采购总监)' },
    { partCode: 'MCU-CHIP-03', partName: '智驾域控制器 MCU 芯片', usagePerVehicle: 2, requiredQty: 200, availableStock: 210, safetyThreshold: 200, supplier: '恩智浦 (NXP)', hardGateStatus: '触发表后硬卡口', ownerName: '陈晨 (采购总监)' },
    { partCode: 'SENS-RADAR-04', partName: '毫米波角雷达组件', usagePerVehicle: 4, requiredQty: 400, availableStock: 1200, safetyThreshold: 600, supplier: '德赛西威', hardGateStatus: '安全允许', ownerName: '陈晨 (采购总监)' },
  ]);

  // Feedback closed loop counter & audit trail
  const [closedLoopFeedbackCount, setClosedLoopFeedbackCount] = useState<number>(148);

  // 7-step definition with EXPLICIT RESPONSIBLE OWNERS (RACI)
  const steps: StepInfo[] = [
    {
      step: 1,
      id: 'step1',
      title: '终端销售',
      subTitle: '真实订单 / 预测拟合',
      tag1: '真实订单',
      tag2: '预测拟合',
      icon: ShoppingCart,
      ownerName: '张敏',
      ownerTitle: '销售运营总监',
      ownerDept: '终端销售运营部',
      ownerAvatar: '张',
      ownerPhone: '138-0011-8891',
      kpiMetrics: '锁单转化率 ≥ 92%, 预测准确率 ≥ 88%',
      systemName: 'POS 零售管理系统 & 客户订车 APP',
      colorBg: 'from-indigo-600 to-indigo-700',
      colorBorder: 'border-indigo-500',
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-100 text-indigo-800'
    },
    {
      step: 2,
      id: 'step2',
      title: '需求上报',
      subTitle: '实时汇总 / 缺口公式',
      tag1: '实时汇总',
      tag2: '缺口公式',
      icon: ClipboardList,
      ownerName: '李强',
      ownerTitle: 'S&OP需求计划总监',
      ownerDept: 'S&OP 供应链计划部',
      ownerAvatar: '李',
      ownerPhone: '139-0022-7762',
      kpiMetrics: '缺口计算准确率 100%, 存货周转率拉升 +15%',
      systemName: 'S&OP 需求平衡与缺口算法引擎',
      colorBg: 'from-violet-600 to-indigo-800',
      colorBorder: 'border-violet-500',
      colorText: 'text-violet-600',
      badgeBg: 'bg-violet-100 text-violet-800'
    },
    {
      step: 3,
      id: 'step3',
      title: '生产排产',
      subTitle: '产销平控 / 排产卡口',
      tag1: '产销平控',
      tag2: '排产卡口',
      icon: Factory,
      ownerName: '王伟',
      ownerTitle: '主生产计划经理 (MPS)',
      ownerDept: '制造计划部 & 生管科',
      ownerAvatar: '王',
      ownerPhone: '137-0033-6653',
      kpiMetrics: '产能平滑指数 ≤ 1.15, 排产卡口零违规',
      systemName: 'APS 主生产排产 & MES 工厂调度系统',
      colorBg: 'from-pink-600 to-rose-600',
      colorBorder: 'border-pink-500',
      colorText: 'text-pink-600',
      badgeBg: 'bg-pink-100 text-pink-800'
    },
    {
      step: 4,
      id: 'step4',
      title: '零部件采购',
      subTitle: 'BOM需求算式 / 硬卡口',
      tag1: 'BOM需求算式',
      tag2: '硬卡口',
      icon: Cpu,
      ownerName: '陈晨',
      ownerTitle: '零部件采购总监',
      ownerDept: '供应链采购部',
      ownerAvatar: '陈',
      ownerPhone: '136-0044-5544',
      kpiMetrics: 'BOM欠料率 0%, 采购硬卡口拦截率 100%',
      systemName: 'SRM 采购系统 & 零部件硬卡口插件',
      colorBg: 'from-amber-500 to-orange-600',
      colorBorder: 'border-amber-500',
      colorText: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    {
      step: 5,
      id: 'step5',
      title: '生产下线',
      subTitle: 'BOM欠料预警 / 按需制造',
      tag1: 'BOM欠料预警',
      tag2: '按需制造',
      icon: CheckCircle2,
      ownerName: '赵勇',
      ownerTitle: '总装车间主任',
      ownerDept: '整车制造部 & 质检科',
      ownerAvatar: '赵',
      ownerPhone: '135-0055-4433',
      kpiMetrics: '下线一次合格率 (FTT) ≥ 98 shadow, ANDON零异常',
      systemName: 'MES ANDON 停线系统 & VIN 码铸造服务',
      colorBg: 'from-emerald-600 to-teal-700',
      colorBorder: 'border-emerald-500',
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      step: 6,
      id: 'step6',
      title: '整车入库',
      subTitle: 'VIN码在库 / 全景透视',
      tag1: 'VIN码在库',
      tag2: '全景透视',
      icon: Warehouse,
      ownerName: '周杰',
      ownerTitle: '整车仓储主管',
      ownerDept: '物流仓储部',
      ownerAvatar: '周',
      ownerPhone: '134-0066-3322',
      kpiMetrics: '账实相符率 100%, 库龄>30天车比例 ≤ 3%',
      systemName: 'WMS 整车仓储系统 & RFID 全景孪生',
      colorBg: 'from-teal-600 to-cyan-700',
      colorBorder: 'border-teal-500',
      colorText: 'text-teal-600',
      badgeBg: 'bg-teal-100 text-teal-800'
    },
    {
      step: 7,
      id: 'step7',
      title: '库存调拨',
      subTitle: '目标水位拉齐 / 跨店调拨',
      tag1: '目标水位拉齐',
      tag2: '跨店调拨',
      icon: Truck,
      ownerName: '孙莉',
      ownerTitle: '全国车辆调度主管',
      ownerDept: '全国物流调度中心',
      ownerAvatar: '孙',
      ownerPhone: '133-0077-2211',
      kpiMetrics: '水位均衡度 ≥ 95%, 调拨履约及时率 99%',
      systemName: 'TMS 运输管理系统 & 智能调拨平衡引擎',
      colorBg: 'from-blue-600 to-sky-700',
      colorBorder: 'border-blue-500',
      colorText: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-800'
    }
  ];

  // Calculate live aggregated totals
  const totalDemandQty = useMemo(() => {
    return terminalOrders.reduce((sum, o) => sum + o.quantity, 0);
  }, [terminalOrders]);

  const totalFactoryVinCount = useMemo(() => {
    return vinInventory.filter(v => v.location === '工厂中央仓').length * 20; // Scaled up for demo
  }, [vinInventory]);

  const totalStoreVinCount = useMemo(() => {
    return storeWatermarks.reduce((sum, s) => sum + s.currentStock, 0);
  }, [storeWatermarks]);

  const totalInTransitCount = useMemo(() => {
    return storeWatermarks.reduce((sum, s) => sum + s.inTransit, 0);
  }, [storeWatermarks]);

  // Net Shortage Gap Formula: Gap = Total Demand - (Factory Stock + Store Stock + InTransit)
  const netShortageGap = useMemo(() => {
    const totalAvail = totalFactoryVinCount + totalStoreVinCount + totalInTransitCount;
    return Math.max(0, totalDemandQty - totalAvail);
  }, [totalDemandQty, totalFactoryVinCount, totalStoreVinCount, totalInTransitCount]);

  // Trigger interactive order addition (Terminal Sales Simulator)
  const handleAddNewOrder = () => {
    const newQty = 50;
    const newOrd: TerminalOrder = {
      id: `ORD-20260728-${String(terminalOrders.length + 1).padStart(2, '0')}`,
      channel: '直营门店',
      model: selectedModel,
      quantity: newQty,
      orderDate: new Date().toISOString().split('T')[0],
      status: '已锁单',
      fittedDemand: Math.round(newQty * 0.92),
      ownerApproval: true
    };
    setTerminalOrders([newOrd, ...terminalOrders]);
    setClosedLoopFeedbackCount(prev => prev + 1);
  };

  // Re-order or Trigger Urgent PO
  const handleTriggerUrgentPO = (partCode: string) => {
    setBomComponents(prev => prev.map(p => {
      if (p.partCode === partCode) {
        return {
          ...p,
          availableStock: p.availableStock + 200,
          hardGateStatus: '安全允许'
        };
      }
      return p;
    }));
  };

  // One-click Rebalancing action (Inter-store transfer trigger)
  const handleExecuteRebalance = (fromStore: string, toStore: string, qty: number) => {
    setStoreWatermarks(prev => prev.map(s => {
      if (s.storeName === fromStore) {
        return { ...s, currentStock: s.currentStock - qty, gap: s.gap + qty };
      }
      if (s.storeName === toStore) {
        return { ...s, currentStock: s.currentStock + qty, gap: Math.max(0, s.gap - qty) };
      }
      return s;
    }));

    // Add a new VIN transfer item
    const newVin: VehicleVIN = {
      vin: `LHG-${selectedModel === '多拉大面' ? 'DM' : 'WK'}20260728-${String(Math.floor(Math.random() * 900) + 100)}`,
      model: selectedModel,
      color: '极光白',
      offlineDate: new Date().toISOString().split('T')[0],
      location: '在途运输',
      status: '在途调拨',
      agingDays: 1,
      inspectorName: '孙莉 (全国调度)'
    };
    setVinInventory([newVin, ...vinInventory]);
    setClosedLoopFeedbackCount(prev => prev + 1);
  };

  // Run full 7-step automated simulation with explicit owner audit logs
  const runFullLifecycleSimulation = () => {
    setSimulating(true);
    setSimStepProgress(1);
    setSimLogs(['[STEP 01 终端销售] 责任人：张敏 (销售运营总监) 提报新锁单 100 辆...']);

    let current = 1;
    const timer = setInterval(() => {
      current += 1;
      setSimStepProgress(current);

      if (current === 2) {
        setSimLogs(prev => [...prev, '[STEP 02 需求上报] 责任人：李强 (S&OP计划总监) 执行缺口算式：100辆需求 - 20辆可用 = 净缺口80辆']);
      } else if (current === 3) {
        setSimLogs(prev => [...prev, '[STEP 03 生产排产] 责任人：王伟 (MPS计划经理) 产销平控卡口校验通过，核准下发 80 辆排产工单']);
      } else if (current === 4) {
        setSimLogs(prev => [...prev, '[STEP 04 零部件采购] 责任人：陈晨 (采购总监) 触发 BOM 算式：校验 80 套电池与 160 颗芯片，硬卡口放行']);
      } else if (current === 5) {
        setSimLogs(prev => [...prev, '[STEP 05 生产下线] 责任人：赵勇 (总装主任) 监控 ANDON 无欠料停线，80辆整车顺利下线并铸造 VIN 码']);
      } else if (current === 6) {
        setSimLogs(prev => [...prev, '[STEP 06 整车入库] 责任人：周杰 (整车仓储主管) 扫码入库中央仓，RFID 全景定位上链，库龄监控正常']);
      } else if (current === 7) {
        setSimLogs(prev => [...prev, '[STEP 07 库存调拨] 责任人：孙莉 (全国调度主管) 启动跨店水位算法：从中央仓调拨 40 辆至华南体验店拉齐水位']);
      } else if (current === 8) {
        setSimLogs(prev => [...prev, '🔄 [闭环反馈] 责任人：刘洋 (数字办官) 确认 POS 到店实销回传！同步纠偏 STEP 01~03 预测曲线！']);
        setClosedLoopFeedbackCount(prev => prev + 100);
        clearInterval(timer);
        setTimeout(() => {
          setSimulating(false);
        }, 1000);
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* ========================================================
          ENTERPRISE PAGE HEADER WITH SYSTEM CAPABILITIES
          ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                企业级进销存 (PSI) 架构
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                7大节点 RACI 责任人明晰 & 闭环反哺
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              汽车全生命周期进销存 (PSI) 管理系统
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              全面打通「01 终端销售 → 02 需求上报 → 03 生产排产 → 04 零部件采购 → 05 生产下线 → 06 整车入库 → 07 库存调拨」全流程。
              <strong>对每一个环节明确岗位责任人 (RACI)、关联系统、考核 KPI 与硬卡口控制机制。</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={runFullLifecycleSimulation}
              disabled={simulating}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer ${
                simulating
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              <Play className={`w-4 h-4 ${simulating ? 'animate-spin' : 'fill-slate-950'}`} />
              {simulating ? '责任人联合闭环演练中...' : '一键运行 7节点责任人闭环演练'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          VISUAL PIPELINE BANNER (7 STEPS WITH EXPLICIT OWNERS)
          Reference matching user's image exactly with RACI badges
          ======================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              汽车全生命周期 7步进销存 责任人全景流程图
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              每个环节均配备专职责任人 (Owner)、关联系统与岗位 KPI，点击卡口可查看责任人履职与细分工作台
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(0)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeStep === 0 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全景模式
            </button>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-100 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
              累计闭环反哺: {closedLoopFeedbackCount} 次
            </span>
          </div>
        </div>

        {/* 7 Horizontal Step Cards Grid with Responsible Owner Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative">
          {steps.map((st) => {
            const StepIcon = st.icon;
            const isSelected = activeStep === st.step;
            const isSimulatingThisStep = simulating && simStepProgress === st.step;

            return (
              <div
                key={st.id}
                onClick={() => setActiveStep(st.step)}
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden p-3.5 flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-800 text-white shadow-xl scale-[1.02] ring-2 ring-indigo-500' 
                    : isSimulatingThisStep
                    ? 'bg-indigo-900 border-emerald-400 text-white shadow-lg animate-pulse ring-2 ring-emerald-400'
                    : 'bg-slate-50/90 hover:bg-white border-slate-200 text-slate-800 hover:shadow-md'
                }`}
              >
                {/* Header Step & Icon */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    STEP 0{st.step}
                  </span>
                  <div className={`p-1.5 rounded-xl ${
                    isSelected ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-600 shadow-xs'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1 my-1">
                  <h3 className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {st.title}
                  </h3>
                  <p className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {st.subTitle}
                  </p>
                </div>

                {/* RESPONSIBLE OWNER (RACI) BADGE - Explicitly Highlighted */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOwnerStep(st);
                  }}
                  className={`mt-2 p-1.5 rounded-xl border flex items-center justify-between transition ${
                    isSelected 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/80' 
                      : 'bg-white border-indigo-100 hover:bg-indigo-50/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-[9px]">
                      {st.ownerAvatar}
                    </div>
                    <div className="space-y-0 text-left">
                      <span className={`block font-extrabold leading-none ${isSelected ? 'text-indigo-300' : 'text-indigo-900'}`}>
                        {st.ownerName}
                      </span>
                      <span className={`text-[9px] block scale-90 origin-left ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {st.ownerTitle}
                      </span>
                    </div>
                  </div>
                  <UserCheck className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>

                {/* Bottom System & Tag */}
                <div className="pt-2 mt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[9px] font-bold text-slate-500">
                  <span className="truncate max-w-[100px]">{st.tag1}</span>
                  <span className="text-indigo-600 font-extrabold flex items-center gap-0.5">
                    详情 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Closed Loop Feedback Visualization Banner matching original design */}
        <div className="bg-indigo-950 text-indigo-100 p-4 rounded-2xl border border-indigo-800/60 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-md">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="font-extrabold text-white text-xs sm:text-sm block">
                闭环反馈机制：07 库存调拨送到店 → 真实数据反哺 01~03 预测与排产
              </span>
              <p className="text-[11px] text-indigo-300 mt-0.5">
                责任人：<strong>刘洋 (数字化流程官)</strong> 负责监督扫码实销回传，实时纠偏 01 终端销售预测、02 需求缺口与 03 生产排产。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-indigo-900/90 px-3.5 py-2 rounded-xl border border-indigo-700/60 font-mono text-[11px] font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            实销反哺 01 终端销售 → 纠偏 02 需求上报 → 优化 03 生产排产
          </div>
        </div>

        {/* Live Simulation Progress Log Modal (if active) */}
        {simulating && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-emerald-500/50 space-y-3 animate-fade-in shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  跨部门责任人联合闭环演练中 (STEP 0{simStepProgress} / 7)
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                {Math.round((simStepProgress / 8) * 100)}% 完成
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-32 overflow-y-auto">
              {simLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-500 font-bold">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          7 NODES RESPONSIBILITY & RACI OVERVIEW MATRIX
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              全生命周期进销存 7大节点责任人 (RACI) 与关联系统控制矩阵
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            责任到位 · 系统互通 · 考核透明
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {steps.map((st) => (
            <div 
              key={st.step}
              onClick={() => setSelectedOwnerStep(st)}
              className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition cursor-pointer space-y-2.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                  STEP 0{st.step}
                </span>
                <span className="text-[10px] text-indigo-600 font-extrabold group-hover:underline flex items-center gap-0.5">
                  履职详情 &gt;
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {st.ownerAvatar}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{st.title}</h3>
                  <div className="text-[11px] text-indigo-900 font-bold">
                    {st.ownerName} <span className="text-slate-500 font-normal">({st.ownerTitle})</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">责任部门:</span>
                  <span className="font-bold text-slate-800">{st.ownerDept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">核心系统:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[120px]">{st.systemName}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Special Closed-Loop Feedback Officer */}
          <div className="p-4 bg-indigo-900 text-indigo-100 rounded-2xl border border-indigo-700 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded">
                核心闭环
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">全程监控</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0">
                刘
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">实销闭环反哺控制</h3>
                <div className="text-[11px] text-emerald-300 font-bold">
                  刘洋 <span className="text-indigo-300 font-normal">(数字化流程官)</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-indigo-200 leading-tight">
              负责监控 07 调拨实销数据，实时驱动 01~03 算法自动纠偏，消除虚假排产与存货积压。
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          DETAILED STAGE-BY-STAGE WORKING CONSOLES
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        
        {/* Stage Selector Sub-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              {activeStep === 0 ? '7大节点进销存 (PSI) 业务控制台 (全景模式)' : `STEP 0${activeStep} : ${steps[activeStep - 1].title} 责任人工作台`}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveStep(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStep === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部7节点全景
            </button>
            {steps.map(s => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeStep === s.step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                0{s.step} {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------
            STAGE 1: 终端销售 (Terminal Sales)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 1) && (
          <div className="space-y-4 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 01
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    终端销售 (Terminal Sales) : 真实订单抓取与预测拟合
                  </h3>
                  <div className="text-[11px] text-indigo-800 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>张敏 (销售运营总监)</strong></span>
                    <span>• 责任部门：终端销售运营部</span>
                    <span>• 关联系统：POS & 订车APP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                >
                  <option value="多拉大面">车型: 多拉大面</option>
                  <option value="3米8微卡">车型: 3米8微卡</option>
                </select>

                <button
                  onClick={handleAddNewOrder}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  + 责任人核准新建锁单 (50辆)
                </button>
              </div>
            </div>

            {/* Live Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3">订单编号</th>
                    <th className="p-3">销售渠道</th>
                    <th className="p-3">订购车型</th>
                    <th className="p-3">真实订单量</th>
                    <th className="p-3">拟合需求修正值</th>
                    <th className="p-3">责任人审批状态</th>
                    <th className="p-3">订单状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {terminalOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{ord.id}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                          {ord.channel}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-indigo-900">{ord.model}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.quantity} 辆</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{ord.fittedDemand} 辆 (×0.92)</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          张敏 已签批
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === '已锁单' ? 'bg-indigo-100 text-indigo-700' :
                          ord.status === '交付中' ? 'bg-amber-100 text-amber-700' :
                          ord.status === '已闭环' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 2: 需求上报 (Demand Aggregation & Gap Formula)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 2) && (
          <div className="space-y-4 bg-violet-50/40 p-5 rounded-2xl border border-violet-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-violet-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 02
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    需求上报 (Demand Reporting) : 实时汇总与缺口推演算式
                  </h3>
                  <div className="text-[11px] text-violet-800 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>李强 (S&OP需求计划总监)</strong></span>
                    <span>• 责任部门：S&OP 供应链计划部</span>
                    <span>• 算式引擎：S&OP Gap Engine</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-violet-100 text-violet-800 font-bold px-2.5 py-1 rounded-full border border-violet-200">
                缺口算式: 终端需求 - (中央仓+门店现车+在途)
              </span>
            </div>

            {/* Gap Equation Visualization Box */}
            <div className="bg-white p-4 rounded-xl border border-violet-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-violet-600" />
                  【S&OP 进销存净需求缺口算式】李强 (计划总监) 实时推演逻辑：
                </span>
                <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  运算完成 · 零卡滞
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono font-bold">
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-500 block">终端预测与锁单总量</span>
                  <span className="text-base text-indigo-700 font-extrabold">{totalDemandQty} 辆</span>
                </div>
                <div className="self-center text-slate-400 text-lg font-bold">-</div>
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-slate-500 block">全网有效在库/在途整车</span>
                  <span className="text-base text-teal-700 font-extrabold">
                    {totalFactoryVinCount + totalStoreVinCount + totalInTransitCount} 辆
                  </span>
                </div>
                <div className="self-center text-slate-400 text-lg font-bold">=</div>
                <div className="bg-pink-50 p-3 rounded-xl border border-pink-200">
                  <span className="text-[10px] text-slate-500 block">建议 MPS 净排产缺口</span>
                  <span className="text-base text-pink-600 font-extrabold">{netShortageGap} 辆</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 3: 生产排产 (Production MPS & Gatekeeper)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 3) && (
          <div className="space-y-4 bg-pink-50/40 p-5 rounded-2xl border border-pink-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-pink-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 03
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    生产排产 (Production Scheduling) : 产销平控与排产卡口
                  </h3>
                  <div className="text-[11px] text-pink-800 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>王伟 (主生产计划经理 MPS)</strong></span>
                    <span>• 责任部门：制造计划部</span>
                    <span>• 系统：APS/MES</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                王伟 已审核: 排产平滑卡口放行
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>1. 产销平滑卡口 Check</span>
                  <span className="text-indigo-600">王伟 核准</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">周度排产上限: 600 辆</div>
                <p className="text-[11px] text-slate-500">计算净缺口 {netShortageGap} 辆未超线体产能上限。</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>2. 齐套性与BOM约束 Check</span>
                  <span className="text-emerald-600">陈晨 联合核准</span>
                </div>
                <div className="text-sm font-extrabold text-emerald-600">齐套率 100%</div>
                <p className="text-[11px] text-slate-500">关键大件（电池包、电机、控制芯片）无缺料。</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>3. 动态工单发布</span>
                  <span className="text-pink-600 font-mono font-bold">MES 工单已下发</span>
                </div>
                <div className="text-sm font-extrabold text-pink-600">核准下发: {netShortageGap} 辆工单</div>
                <p className="text-[11px] text-slate-500">工单指令已自动推送到 MES 工厂生产调度系统。</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 4: 零部件采购 (BOM Procurement & Hard Gate)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 4) && (
          <div className="space-y-4 bg-amber-50/40 p-5 rounded-2xl border border-amber-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-amber-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 04
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    零部件采购 (Parts Procurement) : BOM需求算式与硬卡口
                  </h3>
                  <div className="text-[11px] text-amber-900 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>陈晨 (零部件采购总监)</strong></span>
                    <span>• 责任部门：供应链采购部</span>
                    <span>• 系统：SRM 采购系统</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                SRM 采购硬卡口防御保护中
              </span>
            </div>

            {/* BOM Parts Stock Table with Hard Gate Action */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3">零部件名称 / 编码</th>
                    <th className="p-3">BOM单车用量</th>
                    <th className="p-3">排产用料需求</th>
                    <th className="p-3">当前可用库存</th>
                    <th className="p-3">安全库存阈值</th>
                    <th className="p-3">硬卡口状态</th>
                    <th className="p-3">责任人操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bomComponents.map((p) => (
                    <tr key={p.partCode} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{p.partName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.partCode} • {p.supplier}</div>
                      </td>
                      <td className="p-3 font-mono">{p.usagePerVehicle} /辆</td>
                      <td className="p-3 font-mono font-bold text-pink-600">{p.requiredQty}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{p.availableStock}</td>
                      <td className="p-3 font-mono text-slate-500">{p.safetyThreshold}</td>
                      <td className="p-3">
                        {p.hardGateStatus === '安全允许' ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            库存充足 (放行)
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            触发表后硬卡口
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {p.hardGateStatus !== '安全允许' ? (
                          <button
                            onClick={() => handleTriggerUrgentPO(p.partCode)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer"
                          >
                            陈晨 审批紧急 PO 补货 (+200)
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">无需操作</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 5: 生产下线 (Assembly Line & VIN Minting)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 5) && (
          <div className="space-y-4 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 05
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    生产下线 (Manufacturing Offline) : BOM欠料预警与按需制造
                  </h3>
                  <div className="text-[11px] text-emerald-900 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>赵勇 (总装车间主任)</strong></span>
                    <span>• 责任部门：整车制造部 & 质检科</span>
                    <span>• 系统：MES ANDON 停线系统</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                赵勇 现场监控：ANDON 零停线预警
              </span>
            </div>

            {/* Assembly Station Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              {[
                { station: '冲压车间', status: '完成', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { station: '焊装车间', status: '完成', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { station: '涂装车间', status: '完成', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { station: '总装车间', status: '进行中', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { station: '终检下线', status: '铸造VIN', color: 'bg-teal-50 text-teal-700 border-teal-200' }
              ].map((st, i) => (
                <div key={i} className={`p-3 rounded-xl border ${st.color} font-bold space-y-1`}>
                  <span className="text-[10px] text-slate-400 block font-normal">工位 0{i+1}</span>
                  <span className="block text-slate-900 font-extrabold">{st.station}</span>
                  <span className="text-[10px] underline">{st.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 6: 整车入库 (VIN Warehouse & Full Transparency)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 6) && (
          <div className="space-y-4 bg-teal-50/40 p-5 rounded-2xl border border-teal-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-teal-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 06
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    整车入库 (Vehicle Warehouse) : VIN码单车在库全景透视
                  </h3>
                  <div className="text-[11px] text-teal-900 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>周杰 (整车仓储主管)</strong></span>
                    <span>• 责任部门：物流仓储部</span>
                    <span>• 系统：WMS 整车仓储系统</span>
                  </div>
                </div>
              </div>

              {/* VIN Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="搜索 VIN 码 / 责任人..."
                  value={vinSearchQuery}
                  onChange={(e) => setVinSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl w-52 font-mono text-slate-800"
                />
              </div>
            </div>

            {/* VIN In-Stock Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3">整车 VIN 码</th>
                    <th className="p-3">车型/颜色</th>
                    <th className="p-3">下线日期</th>
                    <th className="p-3">当前实际在库位置</th>
                    <th className="p-3">库龄 (天)</th>
                    <th className="p-3">管辖责任人</th>
                    <th className="p-3">车辆状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vinInventory
                    .filter(v => v.vin.toLowerCase().includes(vinSearchQuery.toLowerCase()) || v.location.includes(vinSearchQuery) || v.inspectorName.includes(vinSearchQuery))
                    .map((v) => (
                    <tr key={v.vin} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{v.vin}</td>
                      <td className="p-3 font-bold text-slate-800">{v.model} ({v.color})</td>
                      <td className="p-3 font-mono text-slate-500">{v.offlineDate}</td>
                      <td className="p-3">
                        <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {v.location}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        {v.agingDays > 30 ? (
                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {v.agingDays} 天 (长库龄警示)
                          </span>
                        ) : (
                          <span className="text-slate-700 font-bold">{v.agingDays} 天</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-700">{v.inspectorName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === '待配车' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === '已锁定' ? 'bg-indigo-100 text-indigo-800' :
                          v.status === '在途调拨' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STAGE 7: 库存调拨 (Inventory Rebalancing & Watermark)
            ---------------------------------------------------- */}
        {(activeStep === 0 || activeStep === 7) && (
          <div className="space-y-4 bg-blue-50/40 p-5 rounded-2xl border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  STEP 07
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    库存调拨 (Inventory Transfer) : 目标水位拉齐与跨店调拨
                  </h3>
                  <div className="text-[11px] text-blue-900 font-bold flex items-center gap-2 mt-0.5">
                    <span>责任人：<strong>孙莉 (全国车辆调度主管)</strong></span>
                    <span>• 责任部门：全国物流调度中心</span>
                    <span>• 系统：TMS 调拨平衡引擎</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full border border-blue-200">
                水位平衡算法：自动建议调拨路线
              </span>
            </div>

            {/* Watermark Table & One-click Dispatch */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3">交付中心 / 门店名称</th>
                    <th className="p-3">区域</th>
                    <th className="p-3">当前实际在库</th>
                    <th className="p-3">目标水位 (Target)</th>
                    <th className="p-3">安全水位 (Safety)</th>
                    <th className="p-3">在途调拨车辆</th>
                    <th className="p-3">水位缺口/冗余</th>
                    <th className="p-3">门店责任人</th>
                    <th className="p-3">调拨建议</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {storeWatermarks.map((sw) => (
                    <tr key={sw.storeName} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{sw.storeName}</td>
                      <td className="p-3 font-mono">{sw.region}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{sw.currentStock} 辆</td>
                      <td className="p-3 font-mono text-slate-500">{sw.targetWatermark} 辆</td>
                      <td className="p-3 font-mono text-slate-400">{sw.safetyWatermark} 辆</td>
                      <td className="p-3 font-mono text-indigo-600 font-bold">{sw.inTransit} 辆</td>
                      <td className="p-3 font-mono">
                        {sw.gap > 0 ? (
                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded">
                            缺口 +{sw.gap} 辆
                          </span>
                        ) : sw.gap < 0 ? (
                          <span className="text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded">
                            冗余 {sw.gap} 辆
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            水位完美平衡
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-700">{sw.storeManager}</td>
                      <td className="p-3">
                        {sw.gap > 0 ? (
                          <button
                            onClick={() => handleExecuteRebalance('华东中心交付店', sw.storeName, sw.gap)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer"
                          >
                            孙莉 下达跨店调拨 ({sw.gap}辆)
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">无需调拨</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          RESPONSIBLE OWNER (RACI) DETAIL MODAL
          ======================================================== */}
      {selectedOwnerStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-lg">
                  {selectedOwnerStep.ownerAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-500/30">
                      STEP 0{selectedOwnerStep.step} 责任人
                    </span>
                    <span className="text-xs text-slate-400 font-mono">工号: EMP-20260{selectedOwnerStep.step}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-0.5">
                    {selectedOwnerStep.ownerName} <span className="text-xs text-slate-300 font-normal">({selectedOwnerStep.ownerTitle})</span>
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOwnerStep(null)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RACI Responsibility Body */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-extrabold block uppercase tracking-wider text-[10px]">
                  一、管辖环节与责任部门
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-medium">
                  <div>
                    <span className="text-slate-500 block">节点名称:</span>
                    <strong className="text-white text-sm">{selectedOwnerStep.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">管辖部门:</span>
                    <strong className="text-white text-sm">{selectedOwnerStep.ownerDept}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-extrabold block uppercase tracking-wider text-[10px]">
                  二、岗位考核 KPI 与质量红线
                </span>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-300 font-bold">
                  {selectedOwnerStep.kpiMetrics}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-extrabold block uppercase tracking-wider text-[10px]">
                  三、关联核心系统与硬卡口权限
                </span>
                <div className="text-slate-300 font-medium">
                  <span className="text-slate-500 block">系统名称:</span>
                  <div className="font-bold text-white text-xs mt-0.5">{selectedOwnerStep.systemName}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => {
                  setActiveStep(selectedOwnerStep.step);
                  setSelectedOwnerStep(null);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-lg shadow-indigo-600/20 cursor-pointer text-center"
              >
                前往【STEP 0{selectedOwnerStep.step} {selectedOwnerStep.title}】责任人工作台
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
