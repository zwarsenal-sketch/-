/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import PitchDeck from './components/PitchDeck';
import ScenarioSimulator from './components/ScenarioSimulator';
import ProcurementApprovalPlugin from './components/ProcurementApprovalPlugin';
import VehicleInventoryManager from './components/VehicleInventoryManager';
import PartsInventoryManager from './components/PartsInventoryManager';
import FittingAnalysis from './components/FittingAnalysis';
import VehicleFitting from './components/VehicleFitting';
import LifecycleInventoryDemo from './components/LifecycleInventoryDemo';
import { 
  PlayCircle, 
  Briefcase,
  Car,
  Package,
  LineChart,
  ShieldCheck,
  Presentation,
  Layers
} from 'lucide-react';

type TabType = 'pitchDeck' | 'procurementPlugin' | 'scenario' | 'vehicleStock' | 'partsStock' | 'fitting' | 'vehicleFitting' | 'lifecycleDemo';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('lifecycleDemo');

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
          <nav className="flex flex-wrap bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 gap-1">
            <button 
              onClick={() => setActiveTab('pitchDeck')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'pitchDeck' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              0. 立项汇报 (新)
            </button>
            <button 
              onClick={() => setActiveTab('procurementPlugin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'procurementPlugin' 
                  ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              1. 智能采购合理性审批插件
            </button>
            <button 
              onClick={() => setActiveTab('scenario')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'scenario' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              2. 业务场景仿真
            </button>
            <button 
              onClick={() => setActiveTab('vehicleStock')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'vehicleStock' 
                  ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-indigo-600" />
              3. 整车库存
            </button>
            <button 
              onClick={() => setActiveTab('partsStock')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'partsStock' 
                  ? 'bg-white text-emerald-600 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              4. 零部件库存
            </button>
            <button 
              onClick={() => setActiveTab('fitting')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'fitting' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-indigo-500" />
              5. 整体拟合大盘
            </button>
            <button 
              onClick={() => setActiveTab('vehicleFitting')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'vehicleFitting' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-emerald-500" />
              6. 车型拟合诊断
            </button>
            <button 
              onClick={() => setActiveTab('lifecycleDemo')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'lifecycleDemo' 
                  ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              7. 全生命周期进销存 (Demo)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-16 space-y-8">
        
        {/* Render Tab Contents */}
        {activeTab === 'pitchDeck' && <PitchDeck />}
        {activeTab === 'procurementPlugin' && <ProcurementApprovalPlugin />}
        {activeTab === 'scenario' && <ScenarioSimulator />}
        {activeTab === 'vehicleStock' && <VehicleInventoryManager />}
        {activeTab === 'partsStock' && <PartsInventoryManager />}
        {activeTab === 'fitting' && <FittingAnalysis />}
        {activeTab === 'vehicleFitting' && <VehicleFitting />}
        {activeTab === 'lifecycleDemo' && <LifecycleInventoryDemo />}

      </main>
    </div>
  );
}
