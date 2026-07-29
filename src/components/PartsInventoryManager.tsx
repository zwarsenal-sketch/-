/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import OmsDashboard from './OmsDashboard';
import ApprovalRules from './ApprovalRules';
import { SlidersHorizontal, AlertTriangle, ClipboardList, Package, LayoutGrid } from 'lucide-react';

export default function PartsInventoryManager() {
  const [subTab, setSubTab] = useState<'combined' | 'partsBoard' | 'warningBoard' | 'rules'>('combined');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Sub-navigation bar for 零部件库存 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              零部件库存与采购预警 (整合大盘)
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-extrabold">
                OMS 6.2 + 6.3 联动
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              三电系统/智能底盘物料实物台账与供应链采购卡点预警一站式统一页面
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('combined')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              subTab === 'combined'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            融合一体大盘
          </button>

          <button
            onClick={() => setSubTab('partsBoard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              subTab === 'partsBoard'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            仅零部件台账
          </button>
          
          <button
            onClick={() => setSubTab('warningBoard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              subTab === 'warningBoard'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            仅采购预警
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
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
      {subTab === 'combined' ? (
        <OmsDashboard key="combined" initialTab="oms62_63" hideTabHeader={true} />
      ) : subTab === 'partsBoard' ? (
        <OmsDashboard key="partsBoard" initialTab="oms62" hideTabHeader={true} />
      ) : subTab === 'warningBoard' ? (
        <OmsDashboard key="warningBoard" initialTab="oms63" hideTabHeader={true} />
      ) : (
        <ApprovalRules />
      )}

    </div>
  );
}
