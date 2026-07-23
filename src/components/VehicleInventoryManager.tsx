/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import OmsDashboard from './OmsDashboard';
import FactoryVehicleDashboard from './FactoryVehicleDashboard';
import { Layers, Factory, Car } from 'lucide-react';

export default function VehicleInventoryManager() {
  const [subTab, setSubTab] = useState<'salesView' | 'factoryView'>('salesView');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Sub-navigation bar for 整车库存 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              整车库存决策看板
            </h2>
            <p className="text-xs text-slate-400">
              区分销售视角终端库存与主机厂端生产下线在途库存
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('salesView')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              subTab === 'salesView'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            销售视角下的整车库存
          </button>
          
          <button
            onClick={() => setSubTab('factoryView')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
              subTab === 'factoryView'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            车厂库存看板 (下线/在途/快照)
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {subTab === 'salesView' ? (
        <OmsDashboard initialTab="oms61" hideTabHeader={true} />
      ) : (
        <FactoryVehicleDashboard />
      )}

    </div>
  );
}
