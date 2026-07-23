/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import OmsDashboard from './OmsDashboard';
import ApprovalRules from './ApprovalRules';
import { SlidersHorizontal, AlertTriangle, ClipboardList, Package } from 'lucide-react';

export default function PartsInventoryManager() {
  const [subTab, setSubTab] = useState<'partsBoard' | 'warningBoard' | 'rules'>('partsBoard');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Sub-navigation bar for 零部件库存 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              零部件库存与采购预警
            </h2>
            <p className="text-xs text-slate-400">
              包含三电系统/智能底盘物料库存台账与供应链采购卡点预警
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('partsBoard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              subTab === 'partsBoard'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            零部件库存看板
          </button>
          
          <button
            onClick={() => setSubTab('warningBoard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              subTab === 'warningBoard'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            采购预警看板
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              subTab === 'rules'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-300" />
            采购审批与预警规则
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {subTab === 'partsBoard' ? (
        <OmsDashboard key="partsBoard" initialTab="oms62" hideTabHeader={true} />
      ) : subTab === 'warningBoard' ? (
        <OmsDashboard key="warningBoard" initialTab="oms63" hideTabHeader={true} />
      ) : (
        <ApprovalRules />
      )}

    </div>
  );
}
