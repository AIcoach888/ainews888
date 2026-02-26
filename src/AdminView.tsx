import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    TrendingUp,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ChevronRight,
    ArrowLeft,
    X,
    Upload,
    Zap,
    CheckCircle2,
    BarChart3,
    Smartphone,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import imageCompression from 'browser-image-compression';
import { supabase } from './supabaseClient';
import { Article, User as UserType } from './types';

/**
 * 注意：使用后台发布功能前，请确保在 Supabase 控制台：
 * 1. 创建名为 'article-images' 的 Storage Bucket。
 * 2. 将其设置为 Public。
 * 3. 确保您已经运行了最新的 supabase_init.sql 脚本。
 */

// --- Sub-components ---

const StatsCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon size={24} />
        </div>
    </div>
);

// --- Main Admin View ---

interface AdminViewProps {
    onBack: () => void;
    currentUser: UserType;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'preview'>('dashboard');
    const [stats, setStats] = useState({ users: 0, articles: 0, interactions: 0 });
    const [articles, setArticles] = useState<Article[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: '大模型资讯',
        author: currentUser.name,
        imageUrl: ''
    });

    useEffect(() => {
        fetchStats();
        fetchArticles();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, searchTerm]);

    const fetchStats = async () => {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: articleCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
        const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
        setStats({
            users: userCount || 0,
            articles: articleCount || 0,
            interactions: (favCount || 0)
        });
    };

    const fetchArticles = async () => {
        let query = supabase.from('articles').select('*').order('created_at', { ascending: false });

        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        const { data } = await query;
        if (data) {
            setArticles(data.map((a: any) => ({
                id: a.id,
                title: a.title,
                excerpt: a.excerpt,
                category: a.category,
                author: a.author,
                date: a.date,
                readTime: a.read_time,
                imageUrl: a.image_url,
                likes: a.likes_count,
                content: a.content
            })));
            console.log('AdminView: Articles fetched:', data.length);
        }
    };

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*, favorites(count)').order('created_at', { ascending: false });
        if (data) setUsers(data);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            // 1. WebP Compression
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/webp'
            };
            const compressedFile = await imageCompression(file, options);

            // 2. Upload to Supabase Storage
            const fileName = `${Date.now()}-${file.name.split('.')[0]}.webp`;
            const { data: uploadData, error } = await supabase.storage
                .from('article-images')
                .upload(fileName, compressedFile as File, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('article-images')
                .getPublicUrl(uploadData.path);

            setForm(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (err) {
            console.error('Upload error:', err);
            alert('图片上传失败: ' + (err as any).message);
        } finally {
            setLoading(false);
        }
    };

    const generateAISummary = async () => {
        if (!form.content) return alert('请先输入正文内容');
        setLoading(true);
        try {
            // 模拟 AI 处理延迟
            await new Promise(resolve => setTimeout(resolve, 1200));

            // 提取前 200 字并简单清洗
            const summary = form.content
                .replace(/#|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '') // 移除 Markdown 标记
                .slice(0, 150)
                .trim() + '...';

            setForm(prev => ({ ...prev, excerpt: summary }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确认要删除这篇文章吗？操作不可撤销。')) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('articles').delete().eq('id', id);
            if (error) throw error;
            fetchArticles();
            fetchStats();
        } catch (err) {
            alert('删除失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.content) return alert('请填写标题和正文');

        setLoading(true);
        try {
            const articleData = {
                title: form.title,
                content: form.content,
                excerpt: form.excerpt || form.content.slice(0, 100),
                category: form.category,
                author: form.author,
                image_url: form.imageUrl, // Use image_url for Supabase column
                date: new Date().toISOString().split('T')[0], // Set current date
                read_time: Math.ceil(form.content.length / 500) + '分钟' // Use read_time for Supabase column
            };

            if (editingArticle) {
                console.log('Updating article:', editingArticle.id, articleData);
                const { data, error } = await supabase.from('articles').update(articleData).eq('id', editingArticle.id).select();
                if (error) throw error;
                console.log('Update response:', data);
            } else {
                console.log('Inserting article:', articleData);
                const { data, error } = await supabase.from('articles').insert(articleData).select();
                if (error) throw error;
                console.log('Insert response:', data);
            }

            setIsEditorOpen(false);
            setEditingArticle(null);
            setForm({ title: '', content: '', excerpt: '', category: '大模型资讯', author: currentUser.name, imageUrl: '' });
            setSearchTerm('');
            await fetchArticles();
            alert('保存成功！');
        } catch (err) {
            console.error('Save error:', err);
            alert('保存失败: ' + (err as any).message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">AI</div>
                    <span className="text-white font-bold text-xl tracking-tight">管理后台</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: '系统概览' },
                        { id: 'content', icon: FileText, label: '内容管理' },
                        { id: 'preview', icon: Smartphone, label: 'App 预览' },
                        { id: 'users', icon: Users, label: '用户运营' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id
                                ? 'bg-primary text-white'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={onBack}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        返回应用
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-bold text-slate-800">
                        {activeTab === 'dashboard' && '控制面板'}
                        {activeTab === 'content' && '文章管理'}
                        {activeTab === 'preview' && '移动端预览'}
                        {activeTab === 'users' && '用户大盘'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {activeTab === 'content' && (
                            <button
                                onClick={() => {
                                    setEditingArticle(null);
                                    setForm({ title: '', content: '', category: '大模型资讯', author: currentUser.name, imageUrl: '', excerpt: '' });
                                    setIsEditorOpen(true);
                                }}
                                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                <Plus size={18} />
                                发布文章
                            </button>
                        )}
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                            <img src={currentUser.avatar} alt="Admin" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard title="累计用户" value={stats.users} icon={Users} color="bg-blue-500" />
                                <StatsCard title="文章总数" value={stats.articles} icon={FileText} color="bg-primary" />
                                <StatsCard title="累计收藏" value={stats.interactions} icon={CheckCircle2} color="bg-green-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h4 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-primary" />
                                        新增用户趋势
                                    </h4>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Mon', value: 4 },
                                                { name: 'Tue', value: 7 },
                                                { name: 'Wed', value: 5 },
                                                { name: 'Thu', value: 12 },
                                                { name: 'Fri', value: 8 },
                                                { name: 'Sat', value: 15 },
                                                { name: 'Sun', value: stats.users },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    cursor={{ fill: '#f8fafc' }}
                                                />
                                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h4 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                                        <BarChart3 size={18} className="text-primary" />
                                        点赞最高 Top 文章
                                    </h4>
                                    <div className="space-y-4">
                                        {articles.slice(0, 5).map((art, i) => (
                                            <div key={art.id} className="flex items-center gap-4">
                                                <span className="text-slate-400 font-bold w-4">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{art.title}</p>
                                                    <p className="text-xs text-slate-500">{art.category}</p>
                                                </div>
                                                <span className="text-sm font-bold text-primary">{art.likes} 赞</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="搜索文章标题..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">文章标题</th>
                                        <th className="px-6 py-4">分类</th>
                                        <th className="px-6 py-4">作者</th>
                                        <th className="px-6 py-4">发布时间</th>
                                        <th className="px-6 py-4">热度</th>
                                        <th className="px-6 py-4 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {articles.map((art) => (
                                        <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{art.title}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{art.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{art.author}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">{art.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-xs text-primary font-bold">
                                                    <TrendingUp size={12} />
                                                    {art.likes}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingArticle(art);
                                                            setForm({
                                                                title: art.title,
                                                                content: (art as any).content || '',
                                                                category: art.category,
                                                                author: art.author,
                                                                imageUrl: art.imageUrl,
                                                                excerpt: art.excerpt || ''
                                                            });
                                                            setIsEditorOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(art.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar_url || MOCK_USER.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{u.full_name || '未名用户'}</h4>
                                            <p className="text-xs text-slate-400">{u.id.slice(0, 8)}...</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {u.role === 'admin' ? '管理员' : '普通用户'}
                                        </span>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">收藏文章</p>
                                            <p className="text-lg font-bold text-slate-800">{u.favorites?.[0]?.count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">注册时间</p>
                                            <p className="text-sm font-bold text-slate-800">{new Date(u.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="flex justify-center items-start pt-4 pb-12">
                            <div className="w-[390px] h-[844px] bg-white rounded-[50px] shadow-2xl border-[12px] border-slate-900 overflow-hidden relative">
                                {/* 模拟手机状态栏 */}
                                <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900 flex items-center justify-center z-[100]">
                                    <div className="w-32 h-6 bg-black rounded-full" />
                                </div>
                                <iframe
                                    src="/"
                                    className="w-full h-full border-none pt-10"
                                    title="Mobile App Preview"
                                />
                            </div>
                            <div className="ml-8 max-w-sm space-y-4 pt-12">
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                    <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
                                        <Zap size={18} />
                                        实时预览模式
                                    </h4>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        当前为您展示的是 1:1 的手机端真实效果。您可以直接在左侧模拟操作 APP 的交互流程，所有间距与手机端完全一致。
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar_url || MOCK_USER.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{u.full_name || '未名用户'}</h4>
                                            <p className="text-xs text-slate-400">{u.id.slice(0, 8)}...</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {u.role === 'admin' ? '管理员' : '普通用户'}
                                        </span>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">收藏文章</p>
                                            <p className="text-lg font-bold text-slate-800">{u.favorites?.[0]?.count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">注册时间</p>
                                            <p className="text-sm font-bold text-slate-800">{new Date(u.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Article Editor Drawer */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">{editingArticle ? '编辑文章' : '发布新文章'}</h3>
                            <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">文章标题</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="输入一个吸睛的标题..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary transition-colors outline-none text-lg font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">分类</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary transition-colors outline-none"
                                    >
                                        <option>大模型资讯</option>
                                        <option>AI绘画</option>
                                        <option>AI编程</option>
                                        <option>深度研究</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">发布者</label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        readOnly
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">封面图 (自动压缩为 WebP)</label>
                                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors group cursor-pointer overflow-hidden">
                                    {form.imageUrl ? (
                                        <>
                                            <img src={form.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="text-white" size={32} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">点击或拖拽上传图片</p>
                                        </>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                                </div>
                            </div>

                            <div className="space-y-2 text-right">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700">正文内容</label>
                                    <button
                                        onClick={generateAISummary}
                                        disabled={loading}
                                        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover disabled:opacity-50"
                                    >
                                        <Zap size={14} />
                                        AI 生成摘要
                                    </button>
                                </div>
                                <textarea
                                    rows={12}
                                    value={form.content}
                                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="开始编写您的文章内容..."
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary transition-colors outline-none resize-none font-sans leading-relaxed"
                                />
                            </div>

                            {(form as any).excerpt && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI 生成摘要</label>
                                    <p className="text-sm text-slate-600 mt-1">{(form as any).excerpt}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                            <button
                                onClick={() => setIsEditorOpen(false)}
                                className="flex-1 px-6 py-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-3 bg-primary hover:bg-primary-hover text-white font-bold px-12 py-4 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {editingArticle ? '保存修改' : '立即发布'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MOCK_USER = {
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCok2toa2m2CNIc-AH4IK_hrDbzF1yfr9EJc_Ksk9sPWKZz8sKXzcNZJ_TZcx6Jx0Na0aTodzZJDATBnNsUDcEI80sV61rlLq5mS1aGkM4d4zt1sDgIEPOUlDMqwfzKeJwF7t9i3dnlYdD8_o1rL9jO6c-hXAsAs6yCs62VF29dwHoKENU0iii6-agoC5BIYBp7oI1103HuXLaobOxTR9sbPnuVKTPMPwDjC4_V0m9nA3XmPHVV66gxxsWt2pX2RZhvQmQKhYxCacEK",
};
