import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User, Lock, Key, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication Logic
    if (activeTab === 'admin') {
      if (username === 'admin' && password === 'admin888') {
        onLogin('admin');
      } else {
        setError('管理员账号或密码错误 (默认: admin / admin888)');
      }
    } else {
      // Allow 'user001' / '123456'
      if (username === 'user001' && password === '123456') {
        onLogin('user');
      } else {
        setError('工号或密码错误 (默认: user001 / 123456)');
      }
    }
  };

  const handleTabChange = (tab: 'user' | 'admin') => {
    setActiveTab(tab);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">系统操作视频知识库</h1>
          <p className="text-blue-100 text-sm">SystemHelp Video Hub Enterprise</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('user')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            普通用户门户
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'admin'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            管理员控制台
          </button>
        </div>

        {/* Form */}
        <div className="p-8 flex-1">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === 'user' ? '用户名 / 工号' : '管理员账号'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={activeTab === 'user' ? "请输入工号 (例: user001)" : "请输入管理账号 (例: admin)"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Mock Captcha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <div className="flex gap-3">
                 <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="输入右侧字符"
                      defaultValue="8Xk2" // Pre-fill for convenience
                    />
                 </div>
                 <div className="w-24 bg-gray-200 rounded-lg flex items-center justify-center font-mono text-lg font-bold text-slate-500 tracking-widest italic select-none">
                    8Xk2
                 </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] mt-2"
            >
              {activeTab === 'user' ? '登录用户门户' : '进入管理控制台'}
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              如忘记密码，请联系信息中心 (Ext. 8802)
            </p>
            <div className="mt-2 text-[10px] text-center text-gray-300">
               测试账号: user001 / 123456 &nbsp;|&nbsp; admin / admin888
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
