import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import Login from './components/Login';
import AdminUploadModal from './components/AdminUploadModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import Toast from './components/Toast';
import { BusinessScenario, AudienceType, FilterStatus, ViewMode, UserRole, VideoItem } from './types';
import { api } from './api';

const App: React.FC = () => {
  // 1. Initialize State (Sync with LocalStorage)
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem('userRole') as UserRole) || 'guest'
  );
  const [displayName, setDisplayName] = useState(
    localStorage.getItem('displayName') || ''
  );

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  // State for Edit Mode
  const [videoToEdit, setVideoToEdit] = useState<VideoItem | null>(null);
  
  // Toast & Loading
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // 2. Load Videos (Auth Protected)
  useEffect(() => {
    if (userRole !== 'guest') {
      fetchVideos();
    }
  }, [userRole]);

  const fetchVideos = async () => {
    try {
      const data = await api.getVideos();
      setVideos(data);
    } catch (e: any) {
      console.error(e);
      // 如果 404 或 token 失效，可能需要登出
      if (e.message.includes('未登录')) {
          handleLogout();
      }
      showToast(e.message || '获取视频列表失败');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  };

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setDisplayName(name);
  };

  const handleLogout = () => {
    api.logout();
    setUserRole('guest');
    setDisplayName('');
    setVideos([]);
  };

  // Upload Logic
  const handleUploadVideo = async (formData: FormData, onProgress: (percent: number) => void) => {
    try {
        await api.uploadVideo(formData, onProgress);
        showToast('视频发布成功！');
        fetchVideos(); // Reload list
    } catch (e: any) {
        showToast(e.message || '发布失败');
        throw e; 
    }
  };

  // Update/Edit Logic
  const handleUpdateVideo = async (id: string, formData: FormData, onProgress: (percent: number) => void) => {
      try {
          await api.updateVideo(id, formData, onProgress);
          showToast('视频更新成功！');
          fetchVideos(); // Reload list
          setVideoToEdit(null); // Clear edit state
      } catch (e: any) {
          showToast(e.message || '更新失败');
          throw e;
      }
  };

  // Open Edit Modal from Player
  const handleOpenEditModal = () => {
      if (selectedVideo) {
          setVideoToEdit(selectedVideo);
          setSelectedVideo(null); // Close player
          setIsUploadModalOpen(true);
      }
  };

  // 核心修正：无条件删除逻辑
  const handleDeleteVideo = async (id: string) => {
    try {
      console.log('Initiating delete for ID:', id);
      // 直接调用 API，不进行额外的权限判断（后端已处理或无需处理）
      await api.deleteVideo(id);
      
      // 更新前端状态
      setVideos(prev => prev.filter(v => v.id !== id));
      if (selectedVideo?.id === id) setSelectedVideo(null);
      showToast('视频已删除');
    } catch (e: any) {
      console.error('Delete error in App.tsx:', e);
      showToast('删除失败: ' + e.message);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.toggleFavorite(id);
      setVideos(prev => prev.map(v => 
        v.id === id ? { ...v, isFavorite: res.isFavorite } : v
      ));
      if (selectedVideo && selectedVideo.id === id) {
        setSelectedVideo(prev => prev ? { ...prev, isFavorite: res.isFavorite } : null);
      }
    } catch (e) {
      showToast('操作失败');
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    api.recordView(video.id).then(() => {
        setVideos(prev => prev.map(v => 
            v.id === video.id ? { ...v, isUnwatched: false } : v
        ));
    });
  };

  const handleCloseUploadModal = () => {
      setIsUploadModalOpen(false);
      setVideoToEdit(null); // Clear edit state on close
  };

  const handleOpenUpload = () => {
      setVideoToEdit(null); // Ensure no residual edit state
      setIsUploadModalOpen(true);
  }

  // 3. Render Login if not authenticated
  if (userRole === 'guest') {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = userRole === '管理员';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />

      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        userRole={userRole}
        displayName={displayName}
        onLogout={handleLogout}
        onOpenUpload={handleOpenUpload}
      />

      <div className="flex flex-1 pt-0">
        <Sidebar
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedScenario}
          selectedAudience={selectedAudience}
          onSelectAudience={setSelectedAudience}
          filterStatus={filterStatus}
          onSelectStatus={setFilterStatus}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
               {isAdmin && (
                 <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-200 font-bold">
                   管理员视图
                 </span>
               )}
               <h1 className="text-2xl font-bold text-slate-800">
                {searchQuery ? `"${searchQuery}" 的搜索结果` : selectedScenario === 'all' ? '系统操作视频预览' : selectedScenario}
              </h1>
            </div>
          </div>

          <VideoGrid
            videos={videos}
            viewMode={viewMode}
            isAdmin={isAdmin}
            onDeleteVideo={handleDeleteVideo}
            onToggleFavorite={handleToggleFavorite}
            onPlayVideo={handlePlayVideo}
            filterState={{
              scenario: selectedScenario,
              audience: selectedAudience,
              status: filterStatus,
              searchQuery: searchQuery,
            }}
          />
        </main>
      </div>

      <AdminUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={handleCloseUploadModal} 
        onUpload={handleUploadVideo} 
        onUpdate={handleUpdateVideo}
        videoToEdit={videoToEdit}
      />

      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          isAdmin={isAdmin}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteVideo}
        />
      )}
    </div>
  );
};

export default App;