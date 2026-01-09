import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import Login from './components/Login';
import AdminUploadModal from './components/AdminUploadModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import Toast from './components/Toast';
import { MOCK_VIDEOS } from './constants';
import { BusinessScenario, AudienceType, FilterStatus, ViewMode, UserRole, VideoItem } from './types';

const App: React.FC = () => {
  // State
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  // Edit State
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole('guest');
    // Reset filters
    setSearchQuery('');
    setSelectedScenario('all');
  };

  // UPLOAD NEW
  const handleUploadVideo = (newVideoData: Omit<VideoItem, 'id' | 'views' | 'isFavorite' | 'isUnwatched'>) => {
    const newVideo: VideoItem = {
      ...newVideoData,
      id: Date.now().toString(),
      views: 0,
      isFavorite: false,
      isUnwatched: true
    };
    // Prepend to show first
    setVideos([newVideo, ...videos]);
    showToast('视频发布成功！');
  };

  // UPDATE EXISTING
  const handleUpdateVideo = (updatedVideo: VideoItem) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
    
    // If the video currently playing is the one being edited, update the player data immediately
    if (selectedVideo && selectedVideo.id === updatedVideo.id) {
      setSelectedVideo(updatedVideo);
    }

    setEditingVideo(null);
    showToast('修改成功');
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('确定要删除这个视频教程吗？')) {
      setVideos(videos.filter(v => v.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
      showToast('视频已删除');
    }
  };

  const handleToggleFavorite = (id: string) => {
    const targetVideo = videos.find(v => v.id === id);
    if (targetVideo) {
      const isNowFavorite = !targetVideo.isFavorite;
      
      setVideos(prev => prev.map(v => 
        v.id === id ? { ...v, isFavorite: isNowFavorite } : v
      ));

      if (selectedVideo && selectedVideo.id === id) {
        setSelectedVideo(prev => prev ? { ...prev, isFavorite: isNowFavorite } : null);
      }

      showToast(isNowFavorite ? '已添加到我的收藏' : '已从收藏中移除');
    }
  };

  const handleStartEdit = () => {
    if (selectedVideo) {
      setEditingVideo(selectedVideo);
      // We can either close the player or keep it open. 
      // To ensure smooth UX and avoid z-index stacking issues if not managed carefully, 
      // let's keep the player open but open the edit modal on top (it has higher z-index).
      // Or we can close the player modal to simulate "Switch to Edit Mode".
      // Let's close player modal for a cleaner focus on editing.
      // setSelectedVideo(null); // Optional: close player
      setIsUploadModalOpen(true);
    }
  };

  // If not logged in, show Login Portal
  if (userRole === 'guest') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />

      {/* 1. Header (Fixed Top) */}
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        userRole={userRole}
        onLogout={handleLogout}
        onOpenUpload={() => {
          setEditingVideo(null); // Ensure we are in create mode
          setIsUploadModalOpen(true);
        }}
      />

      <div className="flex flex-1 pt-0">
        {/* 2. Sidebar (Fixed Left) */}
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

        {/* 3. Main Content Area (Scrollable Right) */}
        <main className="flex-1 ml-64 p-8">
          {/* Breadcrumbs / Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
               {userRole === 'admin' && (
                 <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-200 font-bold">
                   管理员视图
                 </span>
               )}
               <h1 className="text-2xl font-bold text-slate-800">
                {searchQuery 
                  ? `"${searchQuery}" 的搜索结果` 
                  : selectedScenario === 'all' 
                    ? '系统操作视频预览' 
                    : selectedScenario}
              </h1>
            </div>
            
            <p className="text-slate-500 text-sm">
              {searchQuery 
                 ? '全站匹配的解决方案如下。'
                 : '选择下方的视频教程，快速解决您的系统操作问题。'}
            </p>
          </div>

          {/* Grid */}
          <VideoGrid
            videos={videos}
            viewMode={viewMode}
            isAdmin={userRole === 'admin'}
            onDeleteVideo={handleDeleteVideo}
            onToggleFavorite={handleToggleFavorite}
            onPlayVideo={(video) => setSelectedVideo(video)}
            filterState={{
              scenario: selectedScenario,
              audience: selectedAudience,
              status: filterStatus,
              searchQuery: searchQuery,
            }}
          />
        </main>
      </div>

      {/* Admin Upload/Edit Modal */}
      <AdminUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingVideo(null);
        }} 
        onUpload={handleUploadVideo} 
        onUpdate={handleUpdateVideo}
        videoToEdit={editingVideo}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          isAdmin={userRole === 'admin'}
          onEdit={handleStartEdit}
        />
      )}
    </div>
  );
};

export default App;