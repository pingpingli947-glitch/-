import { VideoItem, BusinessScenario } from './types';

export const SCENARIOS: BusinessScenario[] = [
  '用户登录',
  '指标管理',
  '项目库',
  '工资发放',
  '集中支付',
  '会计结算'
];

// Using standard sample video for mock data
const SAMPLE_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

// Business Cover Image Mappings
// Note: Using direct image links where possible. 
// If the provided links are viewer pages (postimg.cc/ID), they might need conversion to i.postimg.cc/ID/image.jpg to render in <img> tags.
// Based on the request, I am using the provided URLs. 
// *Dev Note*: For these to render correctly as images, they should point to the image file, not the viewer page.
// I have updated them to the likely direct image format (i.postimg.cc) for better compatibility, 
// but if they fail, revert to the exact strings provided.
// Provided: https://postimg.cc/34gqZZGx -> Converted to direct guess: https://i.postimg.cc/34gqZZGx/image.png
// Provided: https://postimg.cc/McsHpyHv -> Converted to direct guess: https://i.postimg.cc/McsHpyHv/image.png
// Provided: https://postimg.cc/gwcrpMzW -> Converted to direct guess: https://i.postimg.cc/gwcrpMzW/image.png

const IMG_USER_LOGIN = "https://i.postimg.cc/34gqZZGx/image.png"; 
const IMG_INDICATOR_PAYROLL = "https://i.postimg.cc/McsHpyHv/image.png"; 
const IMG_PAYMENT = "https://i.postimg.cc/gwcrpMzW/image.png";

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: '双因素认证失败如何重置密码？',
    thumbnailUrl: IMG_USER_LOGIN, // Users Login
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '2:15',
    scenario: '用户登录',
    audience: '通用',
    uploadDate: '2023-10-15',
    isFavorite: true,
    isUnwatched: false,
    views: 1240
  },
  {
    id: '2',
    title: '如何从 Excel 导入预算指标？',
    thumbnailUrl: IMG_INDICATOR_PAYROLL, // Indicator Management
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '4:30',
    scenario: '指标管理',
    audience: '科室用户',
    uploadDate: '2023-10-18',
    isFavorite: false,
    isUnwatched: true,
    views: 85
  },
  {
    id: '3',
    title: '为什么我的项目ID显示无效？',
    thumbnailUrl: 'https://picsum.photos/400/225?random=3', // Keep Random for Project Library
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '1:45',
    scenario: '项目库',
    audience: '单位用户',
    uploadDate: '2023-10-20',
    isFavorite: false,
    isUnwatched: false,
    views: 342
  },
  {
    id: '4',
    title: '每月个人所得税扣除项计算指南',
    thumbnailUrl: IMG_INDICATOR_PAYROLL, // Payroll (Same as Indicator)
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '5:10',
    scenario: '工资发放',
    audience: '科室用户',
    uploadDate: '2023-11-01',
    isFavorite: true,
    isUnwatched: false,
    views: 2100
  },
  {
    id: '5',
    title: '故障排查：支付状态一直卡在“处理中”',
    thumbnailUrl: IMG_PAYMENT, // Centralized Payment
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '3:20',
    scenario: '集中支付',
    audience: '单位用户',
    uploadDate: '2023-11-05',
    isFavorite: false,
    isUnwatched: true,
    views: 156
  },
  {
    id: '6',
    title: '如何正确导出年度资产负债表？',
    thumbnailUrl: 'https://picsum.photos/400/225?random=6', // Keep Random for Accounting
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '6:00',
    scenario: '会计结算',
    audience: '通用',
    uploadDate: '2023-11-10',
    isFavorite: true,
    isUnwatched: true,
    views: 890
  },
  {
    id: '7',
    title: 'CA 数字证书驱动安装教程',
    thumbnailUrl: IMG_USER_LOGIN, // Users Login
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '2:50',
    scenario: '用户登录',
    audience: '单位用户',
    uploadDate: '2023-11-12',
    isFavorite: false,
    isUnwatched: false,
    views: 560
  },
  {
    id: '8',
    title: '工资批次提交后如何撤回修正？',
    thumbnailUrl: IMG_INDICATOR_PAYROLL, // Payroll
    videoUrl: SAMPLE_VIDEO_URL,
    duration: '4:15',
    scenario: '工资发放',
    audience: '科室用户',
    uploadDate: '2023-11-15',
    isFavorite: false,
    isUnwatched: true,
    views: 120
  }
];