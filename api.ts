import { VideoItem, UserRole } from './types';

// 1. 强制锁定后端地址
const API_BASE = 'https://7498qp2oa722.vicp.fun/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return {};
    }
    return { 'Authorization': `Bearer ${token}` };
};

export const api = {
    // 登录
    login: async (username: string, password: string): Promise<{userRole: UserRole, displayName: string}> => {
        try {
            console.log(`[API] Logging in user: ${username}`);
            
            let res;
            try {
                res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
            } catch (networkErr) {
                console.error("Network Error:", networkErr);
                throw new Error("无法连接到服务器，请检查网络或联系管理员");
            }
            
            if (res.status === 401) {
                throw new Error("账号或密码错误");
            }

            const data = await res.json();
            
            if (data.success === true) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                } else {
                    localStorage.setItem('token', 'temp-debug-token'); 
                }

                const safeRole = (data.user && data.user.role) ? data.user.role : 'guest';
                const safeName = (data.user && (data.user.displayName || data.user.username)) ? (data.user.displayName || data.user.username) : '用户';

                localStorage.setItem('userRole', safeRole); 
                localStorage.setItem('displayName', safeName);
                
                return {
                    userRole: safeRole,
                    displayName: safeName
                };

            } else {
                throw new Error(data.message || `登录失败 (Server success: false)`);
            }

        } catch (error: any) {
            console.error("[API] Login Error:", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('displayName');
    },

    // 获取视频列表
    getVideos: async (): Promise<VideoItem[]> => {
        const headers = getAuthHeaders();
        
        try {
            console.log(`[API] Fetching videos from ${API_BASE}/videos`);
            const res = await fetch(`${API_BASE}/videos`, {
                method: 'GET',
                mode: 'cors',
                headers: headers 
            });

            if (res.status === 401 || res.status === 403) {
                 console.warn("Server returned 401/403 for videos.");
                 throw new Error("服务器鉴权失败，请确认后端代码已更新");
            }

            if (res.status === 404) {
                 throw new Error("接口未找到 (404)，请检查 server.js 路由配置");
            }
            
            if (!res.ok) {
                throw new Error('获取视频列表失败');
            }
            return res.json();
        } catch (error: any) {
             if (error.message === "Failed to fetch") {
                 throw new Error("无法连接到服务器");
             }
             throw error;
        }
    },

    // 上传视频 (XMLHttpRequest + 10分钟超时)
    uploadVideo: (formData: FormData, onProgress?: (percent: number) => void): Promise<any> => {
        return new Promise((resolve, reject) => {
            const url = `${API_BASE}/videos`;
            console.log(`[API] Uploading video to ${url} via XHR`);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            
            // 关键：前端超时时间设置为 10 分钟 (600,000 ms)，防止大文件提前断开
            xhr.timeout = 600000; 

            // 上传接口已移除鉴权，但保留 Header 传递逻辑以防未来恢复
            const auth = getAuthHeaders();
            if (auth['Authorization']) {
                xhr.setRequestHeader('Authorization', auth['Authorization']);
            }

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.response);
                        resolve(response);
                    } catch (e) {
                        resolve(xhr.response);
                    }
                } else if (xhr.status === 403) {
                    reject(new Error("权限不足：仅管理员可上传"));
                } else if (xhr.status === 404) {
                    reject(new Error("上传接口 404：路由未找到"));
                } else {
                    reject(new Error(`上传失败 (${xhr.status}): ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("网络错误，无法连接到服务器"));
            };

            xhr.ontimeout = () => {
                reject(new Error("上传超时 (超过10分钟)，请检查网络带宽或压缩视频后重试"));
            };

            xhr.send(formData);
        });
    },

    // 更新视频 (PUT via XHR)
    updateVideo: (id: string, formData: FormData, onProgress?: (percent: number) => void): Promise<any> => {
        return new Promise((resolve, reject) => {
            const url = `${API_BASE}/videos/${id}`;
            console.log(`[API] Updating video ${id} at ${url} via XHR`);
            
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url); 
            xhr.timeout = 600000; 

            const auth = getAuthHeaders();
            if (auth['Authorization']) {
                xhr.setRequestHeader('Authorization', auth['Authorization']);
            }

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.response)); } catch { resolve(xhr.response); }
                } else {
                    reject(new Error(`更新失败 (${xhr.status}): ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error("网络错误"));
            xhr.ontimeout = () => reject(new Error("请求超时"));

            xhr.send(formData);
        });
    },

    deleteVideo: async (id: string) => {
        const url = `${API_BASE}/videos/${id}`;
        console.log(`[API] Sending DELETE request to: ${url}`);
        
        const res = await fetch(url, {
            method: 'DELETE',
            mode: 'cors',
            headers: { ...getAuthHeaders() }
        });
        
        if (!res.ok) {
             const text = await res.text();
             console.error(`[API] Delete failed: ${res.status} ${text}`);
             throw new Error('Delete failed: ' + res.statusText);
        }
        console.log('[API] Delete successful');
    },

    toggleFavorite: async (id: string) => {
        const res = await fetch(`${API_BASE}/videos/${id}/favorite`, {
            method: 'POST',
            mode: 'cors',
            headers: { ...getAuthHeaders() }
        });
        if (!res.ok) throw new Error('Action failed');
        return res.json();
    },

    recordView: async (id: string) => {
        await fetch(`${API_BASE}/videos/${id}/view`, {
            method: 'POST',
            mode: 'cors',
            headers: { ...getAuthHeaders() }
        });
    }
};