import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Film, FileText, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Edit2 } from 'lucide-react';
import { SCENARIOS } from '../constants';
import { AudienceType, BusinessScenario, VideoItem } from '../types';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData, onProgress: (percent: number) => void) => Promise<void>;
  onUpdate?: (id: string, formData: FormData, onProgress: (percent: number) => void) => Promise<void>;
  videoToEdit?: VideoItem | null;
}

const DEFAULT_COVERS: Record<string, string> = {
  '指标管理': "https://i.postimg.cc/McsHpyHv/image.png",
  '工资发放': "https://i.postimg.cc/McsHpyHv/image.png",
  '集中支付': "https://i.postimg.cc/gwcrpMzW/image.png",
  '用户登录': "https://i.postimg.cc/34gqZZGx/image.png"
};

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
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(''); 
  const [fileSize, setFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!videoToEdit;

  useEffect(() => {
    if (isOpen) {
      if (videoToEdit) {
        // Edit Mode: Populate Fields
        setTitle(videoToEdit.title);
        setScenario(videoToEdit.scenario);
        setAudience(videoToEdit.audience);
        setDuration(videoToEdit.duration);
        setDescription(videoToEdit.description || '');
        setFileName(''); // No new file selected yet
        setFile(null);
        setCoverPreview(videoToEdit.thumbnailUrl || '');
        setCoverFile(null);
      } else {
        // Create Mode: Reset Fields
        setTitle('');
        setScenario(SCENARIOS[0]);
        setAudience('');
        setDuration('');
        setDescription('');
        setFileName('');
        setFile(null);
        setCoverPreview('');
        setCoverFile(null);
      }
      setError('');
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [isOpen, videoToEdit]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes('mp4')) {
        setError('仅支持上传 .mp4 格式的视频文件');
        return;
      }
      setError('');
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize((selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return setError('请输入视频标题');
    if (!audience) return setError('请选择适用对象');
    
    // In edit mode, file is optional. In create mode, file is mandatory.
    if (!isEditMode && !file) return setError('请上传视频源文件');
    
    if (isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', scenario);
    formData.append('audience', audience);
    formData.append('duration', duration || '3:00');
    formData.append('description', description);
    
    if (file) {
      formData.append('video', file);
    }
    
    if (coverFile) {
        formData.append('cover', coverFile);
    } else if (isEditMode && videoToEdit?.thumbnailUrl) {
         // If editing and no new cover file, send existing URL as text fallback
         formData.append('coverUrlText', videoToEdit.thumbnailUrl);
    } else {
        const defaultCover = DEFAULT_COVERS[scenario];
        if (defaultCover) {
            formData.append('coverUrlText', defaultCover);
        }
    }

    try {
        if (isEditMode && videoToEdit && onUpdate) {
            await onUpdate(videoToEdit.id, formData, (percent) => setUploadProgress(percent));
        } else {
            await onUpload(formData, (percent) => setUploadProgress(percent));
        }
        onClose();
    } catch (err: any) {
        console.error("Operation failed in modal:", err);
        setError(err.message || '操作失败，请重试');
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEditMode ? <Edit2 className="w-5 h-5 text-blue-600" /> : <UploadCloud className="w-5 h-5 text-blue-600" />}
            {isEditMode ? '编辑视频教程' : '上传新视频教程'}
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述/备注</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="添加操作说明、注意事项或相关链接..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar resize-none"
              />
            </div>

            {/* Media Upload Section */}
            <div className="space-y-4">
              {/* Video File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  视频源文件 (MP4) {isEditMode ? <span className="text-gray-400 font-normal">(可选，不传则不修改)</span> : <span className="text-red-500">*</span>}
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
                         <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700 truncate max-w-[200px]">{fileName}</span>
                      </div>
                      <span className="text-xs text-emerald-600 mb-2">{fileSize}</span>
                    </div>
                  ) : (
                    <>
                      <Film className="w-8 h-8 mb-2" />
                      <span className="text-sm text-center">
                         {isEditMode ? '点击替换视频文件' : '点击上传 MP4 视频文件'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  封面图片 (可选，默认使用业务分类图)
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
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs text-center">点击上传自定义封面</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
               <div className="pt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{isEditMode ? '更新中...' : '上传中 (带宽限制优化中)...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
               </div>
            )}

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
              >
                取消
              </button>
              <button 
                type="submit" 
                disabled={isUploading}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm transition-colors flex justify-center items-center ${
                  isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEditMode ? '确认更新' : '确认上传')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadModal;