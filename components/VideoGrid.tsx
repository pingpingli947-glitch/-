import React, { useMemo } from 'react';
import VideoCard from './VideoCard';
import { VideoItem, FilterState, ViewMode } from '../types';
import { SearchX, Loader } from 'lucide-react';

interface VideoGridProps {
  videos: VideoItem[];
  filterState: FilterState;
  viewMode: ViewMode;
  isAdmin: boolean;
  onDeleteVideo: (id: string) => void;
  onPlayVideo: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, filterState, viewMode, isAdmin, onDeleteVideo, onPlayVideo, onToggleFavorite }) => {
  
  // 核心渲染逻辑：根据筛选条件处理视频列表
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    
    return videos.filter((video) => {
      // 1. 搜索过滤 (匹配标题或场景)
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesSearch = video.title.toLowerCase().includes(query) || 
                              video.scenario.toLowerCase().includes(query);
        
        // 搜索时仍需遵守用户对象权限 (虽然后端已过滤，前端做二次保障)
        let matchesAudience = true;
        if (filterState.audience === '科室用户' && video.audience === '单位用户') matchesAudience = false;
        if (filterState.audience === '单位用户' && video.audience === '科室用户') matchesAudience = false;
        if (filterState.audience === '通用' && video.audience !== '通用') matchesAudience = false;

        return matchesSearch && matchesAudience;
      }

      // 2. 场景(Category)过滤
      const matchesScenario = filterState.scenario === 'all' || video.scenario === filterState.scenario;

      // 3. 适用对象过滤
      let matchesAudience = true;
      if (filterState.audience === '科室用户') {
        if (video.audience === '单位用户') matchesAudience = false;
      } else if (filterState.audience === '单位用户') {
        if (video.audience === '科室用户') matchesAudience = false;
      } else if (filterState.audience === '通用') {
        if (video.audience !== '通用') matchesAudience = false;
      }

      // 4. 状态过滤 (收藏/未看)
      let matchesStatus = true;
      if (filterState.status === 'favorites' && !video.isFavorite) matchesStatus = false;
      if (filterState.status === 'unwatched' && !video.isUnwatched) matchesStatus = false;
      if (filterState.status === 'recent') {
         // 简单逻辑：这里假设所有视频都显示，如需严格“最近”，可比对 uploadDate
         matchesStatus = true; 
      }

      return matchesScenario && matchesAudience && matchesStatus;
    });
  }, [videos, filterState]);

  // 空状态处理
  if (filteredVideos.length === 0) {
    // 如果是刚加载且 videos 本身为空（可能还在请求中），可以显示加载状态，
    // 但 App.tsx 负责 loading，这里主要处理筛选无结果
    if (videos.length === 0 && !filterState.searchQuery) {
       // 初始无数据
       return (
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-400">暂无视频数据，请联系管理员上传。</p>
         </div>
       )
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <SearchX className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">未找到相关教程</h3>
        <p className="text-slate-500 max-w-md mt-2">
          没有找到匹配当前筛选条件的视频。请尝试调整搜索关键词或用户对象。
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
        >
          刷新列表
        </button>
      </div>
    );
  }

  // 列表渲染
  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'flex flex-col gap-4'
      }
    `}>
      {filteredVideos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          viewMode={viewMode} 
          isAdmin={isAdmin}
          onDelete={onDeleteVideo}
          onClick={onPlayVideo}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default VideoGrid;