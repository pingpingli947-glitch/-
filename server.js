const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'system-help-secure-key-2024';

// --- 1. 全局中间件配置 ---

// 1.1 跨域配置
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1.2 调试日志 (关键：放在所有路由之前)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[Request] ${timestamp} | ${req.method} ${req.url}`);
    next();
});

// 1.3 静态资源托管
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保存储目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- 2. 配置 Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalName) || path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// --- 3. 数据库连接 ---
const pool = mysql.createPool({
    host: '7498qp2oa722.vicp.fun', 
    port: 26183,                   
    user: 'root',
    password: 'JNcz@051',          
    database: 'systemhelp_db',     
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
});

// --- 4. 辅助中间件 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: '未授权' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token 无效' });
        req.user = user; 
        next();
    });
};

// --- 5. 路由定义 (Router) ---
// 策略：使用全路径数组，同时捕获带 /api 和不带 /api 的请求
const apiRouter = express.Router();

// 5.1 健康检查
apiRouter.get(['/', '/api'], (req, res) => {
    res.json({ status: 'API Online', timestamp: new Date() });
});

// 5.2 登录接口
apiRouter.post(['/login', '/api/login'], async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );
        if (rows.length === 0) return res.status(401).json({ success: false, message: '账号或密码错误' });

        const user = rows[0];
        const token = jwt.sign({ 
            id: user.id, 
            role: user.role, 
            displayName: user.display_name 
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token: token,
            user: { id: user.id, role: user.role, displayName: user.display_name }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// 5.3 获取视频列表
apiRouter.get(['/videos', '/api/videos'], async (req, res) => {
    console.log(`[Route Match] GET videos endpoint hit: ${req.url}`);
    try {
        const userId = 0; 
        let query = `
            SELECT v.*, 
            (SELECT COUNT(*) FROM favorites f WHERE f.video_id = v.id AND f.user_id = ?) as is_favorite,
            COALESCE((SELECT view_count FROM learning_progress lp WHERE lp.video_id = v.id AND lp.user_id = ?), 0) as user_views
            FROM videos v
            ORDER BY v.id DESC
        `;
        const [rows] = await pool.query(query, [userId, userId]);
        
        const videos = rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            // [CRITICAL] 直接映射数据库字段，不进行任何 URL 拼接或替换
            // 确保数据库中存储的第三方直链（如 i.postimg.cc）能直接返回
            thumbnailUrl: row.cover_url, 
            videoUrl: row.video_url,
            duration: row.duration,
            scenario: row.category,
            audience: row.audience,
            description: row.description,
            uploadDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2023-11-20',
            isFavorite: !!row.is_favorite,
            isUnwatched: row.user_views === 0,
            views: row.user_views || 0
        }));
        res.json(videos);
    } catch (err) {
        console.error('Fetch Videos Error:', err);
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

// 5.4 上传视频
apiRouter.post(['/videos', '/api/videos'], upload.fields([{ name: 'video' }, { name: 'cover' }]), async (req, res) => {
    console.log(`[Route Match] POST upload endpoint hit: ${req.url}`);
    const DOMAIN_URL = 'https://7498qp2oa722.vicp.fun';

    if (!req.files || !req.files['video']) {
        return res.status(400).json({ success: false, message: '未找到视频文件' });
    }

    const { title, category, audience, duration, description, coverUrlText } = req.body;
    
    const videoUrl = `${DOMAIN_URL}/uploads/${req.files['video'][0].filename}`;
    let coverUrl = coverUrlText || '';
    if (req.files['cover']) {
        coverUrl = `${DOMAIN_URL}/uploads/${req.files['cover'][0].filename}`;
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO videos (title, category, audience, video_url, cover_url, description, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, category, audience, videoUrl, coverUrl, description, duration]
        );
        res.status(200).json({ success: true, message: '上传成功', id: result.insertId });
    } catch (err) {
        console.error('[Upload DB Error]', err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// 5.5 更新视频
apiRouter.put(['/videos/:id', '/api/videos/:id'], upload.fields([{ name: 'video' }, { name: 'cover' }]), async (req, res) => {
    console.log(`[Route Match] PUT update endpoint hit: ${req.url}`);
    const videoId = req.params.id;
    const { title, category, audience, duration, description, coverUrlText } = req.body;
    const DOMAIN_URL = 'https://7498qp2oa722.vicp.fun';

    let updates = [];
    let values = [];

    // 动态构建 SQL
    if (title) { updates.push('title = ?'); values.push(title); }
    if (category) { updates.push('category = ?'); values.push(category); }
    if (audience) { updates.push('audience = ?'); values.push(audience); }
    if (duration) { updates.push('duration = ?'); values.push(duration); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    // 处理文件上传
    if (req.files && req.files['video']) {
        const videoUrl = `${DOMAIN_URL}/uploads/${req.files['video'][0].filename}`;
        updates.push('video_url = ?');
        values.push(videoUrl);
    }
    
    if (req.files && req.files['cover']) {
        const coverUrl = `${DOMAIN_URL}/uploads/${req.files['cover'][0].filename}`;
        updates.push('cover_url = ?');
        values.push(coverUrl);
    } else if (coverUrlText) {
        updates.push('cover_url = ?');
        values.push(coverUrlText);
    }

    if (updates.length === 0) {
        return res.json({ success: true, message: '无内容变更' });
    }

    values.push(videoId);
    const sql = `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`;

    try {
        await pool.query(sql, values);
        res.json({ success: true, message: '更新成功' });
    } catch (err) {
        console.error('Update DB Error:', err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// 5.6 删除视频 (修复：完全手动级联删除 + 移除鉴权)
apiRouter.delete(['/videos/:id', '/api/videos/:id'], async (req, res) => {
    const videoId = req.params.id;
    console.log(`[Route Match] DELETE endpoint hit for ID: ${videoId}`);
    
    try {
        // --- 1. 级联删除保护 ---
        // 删除前先清理关联表 (收藏记录)
        await pool.query('DELETE FROM favorites WHERE video_id = ?', [videoId]);
        // 删除前先清理关联表 (学习进度/观看记录)
        await pool.query('DELETE FROM learning_progress WHERE video_id = ?', [videoId]);
        
        // --- 2. 删除主表数据 ---
        const [result] = await pool.query('DELETE FROM videos WHERE id = ?', [videoId]);
        
        if (result.affectedRows === 0) {
            // 返回 404 但带上 success: false 标志
            return res.status(404).json({ success: false, message: '视频不存在或已被删除' });
        }

        console.log(`[Delete Success] Video ${videoId} deleted completely.`);
        res.json({ success: true, message: '删除成功' });
    } catch (err) { 
        console.error('[Delete Error] DB Operation Failed:', err);
        res.status(500).json({ success: false, message: 'Delete failed: ' + err.message }); 
    }
});

// 5.7 交互操作
apiRouter.post(['/videos/:id/favorite', '/api/videos/:id/favorite'], authenticateToken, async (req, res) => {
    res.json({ isFavorite: true });
});

apiRouter.post(['/videos/:id/view', '/api/videos/:id/view'], authenticateToken, async (req, res) => {
    res.json({ message: 'Viewed' });
});

// --- 6. 注册路由器 ---
app.use('/', apiRouter);

// --- 7. 启动服务 ---
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Universal Route Matching Active: handles both /api/videos and /videos`);
});

// 超时设置 (10分钟)
server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 601000;