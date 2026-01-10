import React from 'react';
import { Play, Clock, Heart, Trash2 } from 'lucide-react';
import { VideoItem, ViewMode } from '../types';

interface VideoCardProps {
  video: VideoItem;
  viewMode: ViewMode;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onClick: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, viewMode, isAdmin, onDelete, onClick, onToggleFavorite }) => {
  const isList = viewMode === 'list';
  // Helper to safely format views
  const displayViews = (video.views || 0).toLocaleString();

  // Badge Color Mapping
  const getBadgeColor = (scenario: string) => {
    switch (scenario) {
      case '工资发放': return 'bg-emerald-100 text-emerald-700';
      case '用户登录': return 'bg-blue-100 text-blue-700';
      case '会计核算': return 'bg-purple-100 text-purple-700';
      case '集中支付': return 'bg-orange-100 text-orange-700';
      case '项目库': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // 核心修复：独立的删除点击处理函数
  const handleDeleteClick = (e: React.MouseEvent) => {
    // 1. 绝对阻止事件冒泡：防止触发外层 div 的 handleCardClick (打开播放器)
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // 加强版阻止冒泡
    e.preventDefault();
    
    console.log('[Debug] Delete button clicked for video:', video.id);

    // 2. 直接在组件内弹窗确认，确保交互反馈
    // 如果这里能弹窗，说明点击事件没问题
    if (window.confirm(`确定要删除视频 "${video.title}" 吗？此操作不可恢复。`)) {
       onDelete(video.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
    onToggleFavorite(video.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
      onClick(video);
  };

  if (isList) {
    return (
      <div 
        onClick={handleCardClick}
        className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex overflow-hidden cursor-pointer relative"
      >
        {/* Field Binding: thumbnailUrl */}
        <div className="relative w-48 h-28 flex-shrink-0 bg-gray-100">
          <img 
            src={video.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Cover'} 
            alt={video.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error';
            }}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            {video.duration}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Play className="w-3 h-3 text-blue-600 fill-blue-600 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getBadgeColor(video.scenario)}`}>
                  {video.scenario}
                </span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.uploadDate}
                </span>
                 {video.audience !== '通用' && (
                  <span className="text-[10px] border border-gray-200 text-gray-500 px-1.5 rounded bg-gray-50">
                    {video.audience}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {video.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {displayViews} 次观看 • 解决 {video.scenario} 相关问题
              </p>
            </div>
            
            {/* Buttons Area - z-index ensures clickable */}
            <div className="flex items-center gap-1 relative z-20">
               <button 
                type="button"
                onClick={handleFavoriteClick}
                className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${video.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
               >
                <Heart className={`w-4 h-4 ${video.isFavorite ? 'fill-yellow-500' : ''}`} />
              </button>
              {isAdmin && (
                <button 
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="删除视频"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden relative cursor-pointer"
    >
      {/* Field Binding: thumbnailUrl */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img 
          src={video.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Cover'} 
          alt={video.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md ${getBadgeColor(video.scenario)} bg-opacity-90`}>
            {video.scenario}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {video.duration}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-blue-600 fill-blue-600 ml-1" />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {video.title}
          </h3>
          {/* Action Buttons: increased z-index to 20 to be extremely safe */}
          <div className="flex flex-col gap-1 relative z-20">
            <button 
              type="button"
              onClick={handleFavoriteClick}
              className={`flex-shrink-0 mt-0.5 p-1 rounded hover:bg-gray-100 ${video.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${video.isFavorite ? 'fill-yellow-500' : ''}`} />
            </button>
            {isAdmin && (
                <button 
                  type="button"
                  onClick={handleDeleteClick}
                  className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="删除视频"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <div className="flex items-center gap-2">
             {video.audience !== '通用' && (
              <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                {video.audience}
              </span>
            )}
            <span className="text-[10px] text-gray-400">
              {video.uploadDate}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {displayViews} 次观看
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;