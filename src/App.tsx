/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import PitchDeck from './components/PitchDeck';
import MethodologySandbox from './components/MethodologySandbox';
import ScenarioSimulator from './components/ScenarioSimulator';
import MetricsTarget from './components/MetricsTarget';
import OmsDashboard from './components/OmsDashboard';
import ApprovalRules from './components/ApprovalRules';
import FittingAnalysis from './components/FittingAnalysis';
import VehicleFitting from './components/VehicleFitting';
import { 
  Presentation, 
  SlidersHorizontal, 
  PlayCircle, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  Briefcase,
  HelpCircle,
  FileCheck2,
  Clock,
  Heart,
  Database,
  ClipboardList,
  LineChart
} from 'lucide-react';

type TabType = 'pitch' | 'sandbox' | 'scenario' | 'metrics' | 'oms' | 'approvalRules' | 'fitting' | 'vehicleFitting';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pitch');

  // Simulated metrics across the entire session to show high-level executive dashboard numbers
  const sessionSavedCapital = 1540; // 1540万元
  const pendingPartsAlertsCount = 2;
  const currentLocalTime = "2026-07-09";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">

      {/* Primary Brand Header & Main Tab Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                造车库存经营决策系统
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                  V0.2 Internal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                整车与零部件精细化阈值预警立项方案
              </p>
            </div>
          </div>

          {/* Navigation tab bar */}
          <nav className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'pitch' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              1. 立项核心价值
            </button>
            <button 
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'sandbox' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              2. 核心方法沙盘
            </button>
            <button 
              onClick={() => setActiveTab('scenario')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'scenario' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              3. 业务场景仿真
            </button>
            <button 
              onClick={() => setActiveTab('oms')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'oms' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              4. 整车库存看板
            </button>
            <button 
              onClick={() => setActiveTab('approvalRules')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'approvalRules' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              5. 采购审批与预警规则
            </button>
            <button 
              onClick={() => setActiveTab('fitting')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'fitting' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-indigo-500" />
              6. 整体拟合大盘
            </button>
            <button 
              onClick={() => setActiveTab('vehicleFitting')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'vehicleFitting' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-emerald-500" />
              7. 车型拟合诊断 (新)
            </button>
            <button 
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'metrics' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              8. 项目达成指标
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-16 space-y-8">
        
        {/* Render Tab Contents */}
        {activeTab === 'pitch' && <PitchDeck />}
        {activeTab === 'sandbox' && <MethodologySandbox />}
        {activeTab === 'scenario' && <ScenarioSimulator />}
        {activeTab === 'approvalRules' && <ApprovalRules />}
        {activeTab === 'fitting' && <FittingAnalysis />}
        {activeTab === 'vehicleFitting' && <VehicleFitting />}
        {activeTab === 'metrics' && <MetricsTarget />}
        {activeTab === 'oms' && <OmsDashboard />}

      </main>
    </div>
  );
}
