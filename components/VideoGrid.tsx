import React, { useMemo } from 'react';
import VideoCard from './VideoCard';
import { VideoItem, FilterState, ViewMode } from '../types';
import { SearchX } from 'lucide-react';

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
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // 1. Search Query
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        
        const matchesSearch = video.title.toLowerCase().includes(query) || 
                              video.scenario.toLowerCase().includes(query);
        
        let matchesAudience = true;
        if (filterState.audience === '科室用户' && video.audience === '单位用户') matchesAudience = false;
        if (filterState.audience === '单位用户' && video.audience === '科室用户') matchesAudience = false;
        if (filterState.audience === '通用' && video.audience !== '通用') matchesAudience = false;

        return matchesSearch && matchesAudience;
      }

      // 2. Category Filter (Scenario)
      const matchesScenario = filterState.scenario === 'all' || video.scenario === filterState.scenario;

      // 3. Audience Filter
      let matchesAudience = true;
      if (filterState.audience === '科室用户') {
        if (video.audience === '单位用户') matchesAudience = false;
      } else if (filterState.audience === '单位用户') {
        if (video.audience === '科室用户') matchesAudience = false;
      } else if (filterState.audience === '通用') {
        if (video.audience !== '通用') matchesAudience = false;
      }

      // 4. Status Filter
      let matchesStatus = true;
      if (filterState.status === 'favorites' && !video.isFavorite) matchesStatus = false;
      if (filterState.status === 'unwatched' && !video.isUnwatched) matchesStatus = false;

      return matchesScenario && matchesAudience && matchesStatus;
    });
  }, [videos, filterState]);

  if (filteredVideos.length === 0) {
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
          清除所有筛选
        </button>
      </div>
    );
  }

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