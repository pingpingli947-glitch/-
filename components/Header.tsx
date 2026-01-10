import React from 'react';
import { Search, Bell, User, HelpCircle, LogOut, Upload } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userRole: UserRole;
  displayName?: string;
  onLogout: () => void;
  onOpenUpload: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  onSearchChange, 
  userRole, 
  displayName,
  onLogout,
  onOpenUpload
}) => {
  // Determine if admin based on Chinese role string
  const isAdmin = userRole === '管理员';
  
  // 处理显示名称：防止显示 "undefined" 字符串或空值
  const displayLabel = (displayName && displayName !== 'undefined') ? displayName : '用户';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Logo Area */}
      <div className="flex items-center gap-3 w-72">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
          S
        </div>
        <div>
           <span className="font-bold text-slate-800 text-lg tracking-tight block leading-none">系统操作指导知识库</span>
           <span className="text-[10px] text-slate-400 tracking-wider">SystemHelp Hub</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
            placeholder="搜索系统问题 (如 '工资发放', '证书安装')..."
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Permission Switch: Only show if role is exactly '管理员' */}
        {isAdmin && (
          <button 
            onClick={onOpenUpload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
          >
            <Upload className="w-3 h-3" />
            上传视频
          </button>
        )}

        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100" title="帮助中心">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100" title="消息通知">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isAdmin ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-right">
               {/* UI Binding: Display Name and Specific Role */}
               <p className="text-xs font-bold text-slate-700">
                 {displayLabel}
               </p>
               <p className="text-[10px] text-slate-400">
                 {userRole !== 'guest' ? userRole : '未登录'}
               </p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;