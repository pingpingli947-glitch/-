import React from 'react';
import { X, Calendar, Eye, FileText, Download, Edit2 } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, isAdmin, onEdit }) => {
  if (!video) return null;

  // Helper to convert URLs in text to <a> tags
  const renderDescriptionWithLinks = (text: string) => {
    if (!text) return null;
    
    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleDownload = () => {
    alert("下载功能已触发：正在下载附件...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Player Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-lg font-bold leading-tight">{video.title}</h2>
               {isAdmin && onEdit && (
                 <button 
                   onClick={onEdit}
                   className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded transition-colors text-blue-200"
                   title="编辑此教程"
                 >
                   <Edit2 className="w-3 h-3" />
                   编辑
                 </button>
               )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span className="bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded">{video.scenario}</span>
              <span>{video.audience}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="w-full aspect-video bg-black flex items-center justify-center relative group">
          {video.videoUrl ? (
             <video 
               src={video.videoUrl} 
               controls 
               autoPlay 
               className="w-full h-full object-contain"
               controlsList="nodownload"
             >
               您的浏览器不支持 HTML5 视频播放。
             </video>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
              </div>
              <p className="text-gray-400 text-sm">视频资源不存在</p>
            </div>
          )}
        </div>

        {/* Info & Description */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
             <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   发布于 {video.uploadDate}
                </div>
                <div className="flex items-center gap-2">
                   <Eye className="w-4 h-4" />
                   {video.views.toLocaleString()} 次观看
                </div>
             </div>
             <button 
              onClick={handleDownload}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
             >
                <Download className="w-4 h-4" />
                下载附件/素材
             </button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
             {isAdmin && onEdit && (
               <button 
                 onClick={onEdit}
                 className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                 title="编辑说明"
               >
                 <Edit2 className="w-4 h-4" />
               </button>
             )}
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
               <FileText className="w-4 h-4 text-slate-400" />
               操作说明 / 备注
             </h3>
             <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
               {video.description ? renderDescriptionWithLinks(video.description) : (
                 <span className="text-gray-400 italic">暂无相关操作说明。</span>
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayerModal;
