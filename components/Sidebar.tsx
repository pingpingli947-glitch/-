import React from 'react';
import { 
  LayoutGrid, 
  List, 
  Users, 
  Clock, 
  Star, 
  PlayCircle,
  Layers,
  Briefcase
} from 'lucide-react';
import { BusinessScenario, AudienceType, FilterStatus, ViewMode } from '../types';
import { SCENARIOS } from '../constants';

interface SidebarProps {
  selectedScenario: BusinessScenario | 'all';
  onSelectScenario: (scenario: BusinessScenario | 'all') => void;
  selectedAudience: AudienceType | 'all';
  onSelectAudience: (audience: AudienceType | 'all') => void;
  filterStatus: FilterStatus;
  onSelectStatus: (status: FilterStatus) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
}

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}

const NavItem: React.FC<NavItemProps> = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  count 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 mb-1 text-sm font-medium rounded-lg transition-all duration-200 group ${
      active
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span>{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  selectedScenario,
  onSelectScenario,
  selectedAudience,
  onSelectAudience,
  filterStatus,
  onSelectStatus,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed top-16 bottom-0 left-0 z-10 overflow-y-auto custom-scrollbar">
      
      {/* Section 1: Business Scenarios */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
          <Briefcase className="w-3 h-3" />
          业务场景
        </h3>
        <NavItem 
          active={selectedScenario === 'all'} 
          onClick={() => onSelectScenario('all')} 
          icon={Layers} 
          label="全部场景" 
        />
        {SCENARIOS.map((scenario) => (
          <NavItem
            key={scenario}
            active={selectedScenario === scenario}
            onClick={() => onSelectScenario(scenario)}
            icon={Briefcase}
            label={scenario}
          />
        ))}
      </div>

      {/* Section 2: Audience Filter */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
          <Users className="w-3 h-3" />
          适用对象
        </h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onSelectAudience('科室用户')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              selectedAudience === '科室用户' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            科室用户
          </button>
          <button
            onClick={() => onSelectAudience('单位用户')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              selectedAudience === '单位用户' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            单位用户
          </button>
        </div>
        {selectedAudience !== 'all' && (
           <button 
             onClick={() => onSelectAudience('all')}
             className="w-full text-xs text-center text-slate-400 hover:text-blue-600 mt-2 hover:underline"
           >
             清除筛选
           </button>
        )}
      </div>

      {/* Section 3: Status */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          学习状态
        </h3>
        <NavItem 
          active={filterStatus === 'all'} 
          onClick={() => onSelectStatus('all')} 
          icon={Layers} 
          label="全部视频" 
        />
        <NavItem 
          active={filterStatus === 'recent'} 
          onClick={() => onSelectStatus('recent')} 
          icon={Clock} 
          label="最近更新" 
        />
        <NavItem 
          active={filterStatus === 'unwatched'} 
          onClick={() => onSelectStatus('unwatched')} 
          icon={PlayCircle} 
          label="未学习" 
        />
        <NavItem 
          active={filterStatus === 'favorites'} 
          onClick={() => onSelectStatus('favorites')} 
          icon={Star} 
          label="我的收藏" 
        />
      </div>

      {/* View Toggle */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => onToggleViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors flex-1 flex justify-center ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-gray-50'
            }`}
            title="网格视图"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleViewMode('list')}
            className={`p-1.5 rounded-md transition-colors flex-1 flex justify-center ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-gray-50'
            }`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">V2.1.0 企业版</p>
      </div>
    </aside>
  );
};

export default Sidebar;
