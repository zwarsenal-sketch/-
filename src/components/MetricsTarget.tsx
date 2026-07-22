/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  TrendingDown, 
  Database
} from 'lucide-react';

export default function MetricsTarget() {
  // Target metrics arrays from Section 7
  const dataQualityKpis = [
    { name: '核心车型库存数据完整率', target: '≥ 95%', desc: '保证VIN车辆档案与OMS数据高一致性' },
    { name: '核心物料 BOM 映射覆盖率', target: '≥ 90%', desc: '打通整车配置到零部件单车用量的自动换算' },
    { name: '核心物料库存数据完整率', target: '≥ 95%', desc: '锁定及在途数据全量同步，减少盲区' },
    { name: '采购审批单覆盖率', target: '≥ 80%', desc: '首期将高价值、高比例采购物料全部纳入插件卡点' },
    { name: '数据同步成功率', target: '≥ 95%', desc: '中台数据定时数仓增量同步稳定性' },
  ];

  const alertAccuracyKpis = [
    { name: '整车库存积压预警准确率', target: '≥ 80%', desc: '避免过度警报，保障促融、促销策略的高针对性' },
    { name: '热销缺货预警准确率', target: '≥ 80%', desc: '精准预测补库，降低交付缺款带来的延期风险' },
    { name: '零部件采购过量预警准确率', target: '≥ 80%', desc: '减少过量下单造成的仓库库容及资金沉淀' },
    { name: '零部件采购不足预警准确率', target: '≥ 80%', desc: '避免断料停产，前置7天预警到货缺口' },
    { name: '缺料风险提前发现时间', target: '≥ 7 天', desc: '给采购部和供应商争取充足的加急补货/追料窗口' },
  ];

  const businessValueKpis = [
    { name: '长库龄整车/零部件库存金额', direction: '显著下降', desc: '释放压减的财务现金沉淀，提升速动比率' },
    { name: '呆滞物料及作废呆料数量', direction: '显著下降', desc: '结合工程变更(工改)切换节点，精准切替控死料' },
    { name: '缺料导致的停产/减产次数', direction: '降至极低', desc: '保证生产线平稳爬坡与节拍化均衡排产' },
    { name: '交付延期订单占比', direction: '显著下降', desc: '提升最终C端消费者的按时交付履约满意度' },
    { name: '超阈值（不合理）采购金额', direction: '拦截下降', desc: '前置采购审批卡点，实现有据可查、科学算账' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Metrics Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">6.0 经营指标判断标准与达成目标</h2>
        <p className="text-xs text-slate-500">
          制定清晰的考核指标（KPI），确保项目交付不仅是系统的上线，更是业务指标的实质改善
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Data Quality & Alert Accuracy Targets (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section A: Data Foundation KPIs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Database className="w-4.5 h-4.5 text-blue-500" />
              6.1 数据基础指标 (确保输入可信)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataQualityKpis.map((kpi, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-start transition-all">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-slate-700">{kpi.name}</div>
                    <div className="text-[10px] text-slate-400">{kpi.desc}</div>
                  </div>
                  <div className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    {kpi.target}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Alert Accuracy */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <BarChart className="w-4.5 h-4.5 text-indigo-500" />
              6.2 预警效果指标 (确保算得准确)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertAccuracyKpis.map((kpi, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-start transition-all">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-slate-700">{kpi.name}</div>
                    <div className="text-[10px] text-slate-400">{kpi.desc}</div>
                  </div>
                  <div className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                    {kpi.target}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: Business Benefit targets & Boss Click (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section C: Business Outcomes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <TrendingDown className="w-4.5 h-4.5 text-emerald-500" />
              6.3 业务收益终极目标
            </h3>

            <div className="space-y-3">
              {businessValueKpis.map((kpi, idx) => (
                <div key={idx} className="p-3 border border-slate-50 bg-slate-50/20 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{kpi.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {kpi.direction}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{kpi.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
