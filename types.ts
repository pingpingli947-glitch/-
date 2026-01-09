export type AudienceType = '科室用户' | '单位用户' | '通用';

export type BusinessScenario = 
  | '用户登录'
  | '指标管理'
  | '项目库'
  | '工资发放'
  | '集中支付'
  | '会计结算';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string; // URL for the actual video file
  duration: string;
  scenario: BusinessScenario;
  audience: AudienceType;
  uploadDate: string;
  isFavorite: boolean;
  isUnwatched: boolean;
  views: number;
  description?: string; // Optional description for new uploads
}

export type ViewMode = 'grid' | 'list';
export type FilterStatus = 'all' | 'recent' | 'unwatched' | 'favorites';

export type UserRole = 'guest' | 'user' | 'admin';

export interface FilterState {
  scenario: BusinessScenario | 'all';
  audience: AudienceType | 'all';
  status: FilterStatus;
  searchQuery: string;
}
