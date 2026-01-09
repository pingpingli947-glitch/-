import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Film, FileText, CheckCircle, AlertCircle, Loader2, Edit3, Image as ImageIcon } from 'lucide-react';
import { SCENARIOS } from '../constants';
import { AudienceType, BusinessScenario, VideoItem } from '../types';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (video: Omit<VideoItem, 'id' | 'views' | 'isFavorite' | 'isUnwatched'>) => void;
  onUpdate?: (video: VideoItem) => void;
  videoToEdit?: VideoItem | null;
}

const AdminUploadModal: React.FC<AdminUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  onUpdate,
  videoToEdit 
}) => {
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState<BusinessScenario>(SCENARIOS[0]);
  const [audience, setAudience] = useState<AudienceType | ''>(''); 
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  
  // File Upload States (Video)
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(''); 
  const [fileSize, setFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cover Image States
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill data when videoToEdit changes
  useEffect(() => {
    if (isOpen && videoToEdit) {
      setTitle(videoToEdit.title);
      setScenario(videoToEdit.scenario);
      setAudience(videoToEdit.audience);
      setDuration(videoToEdit.duration);
      setDescription(videoToEdit.description || '');
      setCoverPreview(videoToEdit.thumbnailUrl);
      
      // Reset new file states but keep preview
      setFileName(''); 
      setFile(null);
      setCoverFile(null);
      setError('');
    } else if (isOpen && !videoToEdit) {
      // Reset for new upload
      setTitle('');
      setScenario(SCENARIOS[0]);
      setAudience('');
      setDuration('');
      setDescription('');
      setFileName('');
      setFile(null);
      setCoverPreview('');
      setCoverFile(null);
      setError('');
    }
  }, [isOpen, videoToEdit]);

  if (!isOpen) return null;

  const isEditMode = !!videoToEdit;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes('mp4')) {
        setError('仅支持上传 .mp4 格式的视频文件');
        return;
      }

      // Reset states
      setError('');
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize((selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB');
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 200);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('仅支持上传图片文件 (JPG/PNG)');
        return;
      }
      setCoverFile(selectedFile);
      setCoverPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Logic
    if (!title.trim()) {
      setError('请输入视频标题');
      return;
    }
    if (!audience) {
      setError('请选择适用对象');
      return;
    }
    // File is required only for new uploads
    if (!isEditMode && !file) {
      setError('请上传视频源文件');
      return;
    }
    if (isUploading) {
      setError('请等待视频上传完成');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Determine Thumbnail URL: New upload > Existing (Edit) > Random
    const finalThumbnailUrl = coverFile 
      ? URL.createObjectURL(coverFile) 
      : (isEditMode && videoToEdit ? videoToEdit.thumbnailUrl : `https://picsum.photos/400/225?random=${Date.now()}`);

    if (isEditMode && onUpdate && videoToEdit) {
      // UPDATE Logic
      const updatedVideo: VideoItem = {
        ...videoToEdit,
        title,
        scenario,
        audience: audience as AudienceType,
        description,
        duration: duration || videoToEdit.duration,
        videoUrl: file ? URL.createObjectURL(file) : videoToEdit.videoUrl,
        thumbnailUrl: finalThumbnailUrl,
      };
      onUpdate(updatedVideo);
    } else {
      // UPLOAD Logic
      const videoUrl = file ? URL.createObjectURL(file) : ''; 
      
      onUpload({
        title,
        thumbnailUrl: finalThumbnailUrl,
        videoUrl,
        duration: duration || '3:00',
        scenario,
        audience: audience as AudienceType,
        uploadDate: today,
        description
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit3 className="w-5 h-5 text-blue-600" />
                修改视频教程
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5 text-blue-600" />
                上传新视频教程
              </>
            )}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">视频标题 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：如何处理退回的支付申请？"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">业务板块 <span className="text-red-500">*</span></label>
                <select 
                  value={scenario}
                  onChange={e => setScenario(e.target.value as BusinessScenario)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SCENARIOS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Duration Mock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时长预估</label>
                <input 
                  type="text" 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="例如: 4:30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">适用对象 <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="audience" 
                    value="科室用户"
                    checked={audience === '科室用户'}
                    onChange={() => setAudience('科室用户')}
                    className="text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm text-gray-700">科室用户</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="audience" 
                    value="单位用户"
                    checked={audience === '单位用户'}
                    onChange={() => setAudience('单位用户')}
                    className="text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm text-gray-700">单位用户</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="audience" 
                    value="通用"
                    checked={audience === '通用'}
                    onChange={() => setAudience('通用')}
                    className="text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm text-gray-700">通用</span>
                </label>
              </div>
            </div>

            {/* Media Upload Section: Video & Cover */}
            <div className="space-y-4">
              {/* Video File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditMode ? '更换视频源文件 (MP4)' : '视频源文件 (MP4)'} 
                  {!isEditMode && <span className="text-red-500"> *</span>}
                </label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".mp4,video/mp4"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
                    fileName ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {fileName ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-2 mb-2">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        ) : (
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                        )}
                        <span className="text-sm font-medium text-emerald-700 truncate max-w-[200px]">{fileName}</span>
                      </div>
                      <span className="text-xs text-emerald-600 mb-2">{fileSize}</span>
                      <div className="w-full max-w-xs h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Film className="w-8 h-8 mb-2" />
                      {isEditMode ? (
                        <span className="text-sm text-center">当前使用原视频<br/><span className="text-xs text-blue-500 underline mt-1 block">点击此处以上传新文件覆盖</span></span>
                      ) : (
                        <span className="text-sm text-center">点击上传 MP4 视频文件<br/><span className="text-xs text-gray-400 font-normal">支持拖拽上传</span></span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  封面图片 (可选)
                </label>
                <input 
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverSelect}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                />
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer relative h-32 ${
                    coverPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {coverPreview ? (
                    <div className="relative w-full h-full group">
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover rounded-md" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> 点击更换
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs text-center">点击上传封面图片 (JPG/PNG)<br/><span className="text-[10px] text-gray-400">建议比例 16:9</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">操作说明 / 备注 (可选)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="支持输入URL链接，例如: http://example.com/policy.pdf"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                取消
              </button>
              <button 
                type="submit" 
                disabled={isUploading}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm transition-colors ${
                  isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? '上传中...' : (isEditMode ? '确认修改' : '确认上传')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadModal;