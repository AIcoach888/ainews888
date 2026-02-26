/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Compass,
  Bookmark,
  User as UserIcon,
  Search,
  Bell,
  ChevronRight,
  Heart,
  History,
  Settings,
  LogOut,
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  ArrowRight,
  BadgeCheck,
  Smartphone,
  UserCircle,
  CreditCard, // Added for ProfileView
  ShieldCheck // Added for ProfileView
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Changed from motion/react to framer-motion
import { View, Article, User } from './types';
import { MOCK_USER } from './constants';
import { supabase } from './supabaseClient';
import { AdminView } from './AdminView'; // Added AdminView import

// --- Components ---

const Navbar = ({ activeView, onViewChange }: { activeView: View, onViewChange: (view: View) => void }) => {
  const navItems = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'favorites', icon: Bookmark, label: '收藏' },
    { id: 'profile', icon: UserIcon, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 backdrop-blur-lg pb-safe pt-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <div className="max-w-md mx-auto flex justify-around items-end px-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-1 flex-col items-center gap-1 transition-colors ${activeView === item.id ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`}
          >
            <item.icon size={24} fill={activeView === item.id ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const ArticleCard = ({ article, onClick }: { article: Article, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="py-4 border-b border-slate-100 last:border-0 cursor-pointer group active:bg-slate-50 transition-colors"
  >
    <div className="flex flex-row items-start gap-3 h-20">
      <div className="flex flex-col flex-1 justify-between h-full min-w-0">
        <h4 className="text-slate-900 text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-primary font-medium">{article.category}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Heart size={14} />
            <span className="text-[10px]">{article.likes}</span>
          </div>
        </div>
      </div>
      <div className="w-28 h-20 shrink-0 rounded-lg overflow-hidden relative border border-slate-100">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  </div>
);

// --- Views ---

const LoginView = ({ onLogin, onGoToRegister }: { onLogin: (user: User) => void, onGoToRegister: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      alert('请输入邮箱和密码');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        onLogin({
          id: data.user.id,
          name: profile?.full_name || data.user.email?.split('@')[0] || "用户",
          email: data.user.email || "",
          avatar: profile?.avatar_url || MOCK_USER.avatar,
          role: profile?.role || 'user', // Added role
          isPro: profile?.is_pro || false
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <div className="flex items-center p-6 pb-2 justify-center pt-8">
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-center text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">AI</div>
          AI快报
        </h2>
      </div>

      <div className="flex-1 flex flex-col w-full overflow-y-auto pb-6">
        <div className="px-6 py-6">
          <div className="w-full relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-[180px] shadow-sm group">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY6w3VhRfzZMnAQtSOmtZp-4v_4Bbt8LUp-31Nhr8A4RGArMttNa88k_xQq2Hteb41vMJxQHs3LjolJbBfuUZgAS61hWhX6kOCsAkGmPKnfZ8OtAjQ7k46uIfl2GOnCiWDSheL8dhJ7z9PCgwO-94CI4OXxEkgUJ70Fs4PSF6hQYOTRdueCyn8Slra24zm-mS5ylJxN6kEu79zqdvtcL4iEuUr9mnTsX1QRdiiKfImEHwOAyQoz49GpTp56wzE4JsBu8LRq0cx5Ix5"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Banner"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
            <div className="relative p-6 z-10">
              <h3 className="text-white text-xl font-bold tracking-wide">洞察未来科技</h3>
              <p className="text-white/80 text-sm mt-1">每日更新最前沿的 AI 资讯</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900">欢迎登录</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">输入您的账号信息以继续阅读</p>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <div className="flex flex-col gap-2 group">
            <span className="text-sm font-medium text-slate-700 group-focus-within:text-primary transition-colors">邮箱</span>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail size={20} />
              </span>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 group">
            <span className="text-sm font-medium text-slate-700 group-focus-within:text-primary transition-colors">密码</span>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-[-4px]">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 text-primary bg-slate-100 border-gray-300 rounded focus:ring-primary" />
              <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer">记住我</label>
            </div>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">忘记密码？</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className={`w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span>{isSubmitting ? '登录中...' : '登录'}</span>
            {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
          </button>
        </div>

        <div className="mt-auto px-6 pb-10 pt-4 text-center">
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-300 text-xs uppercase font-medium">或者</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>
          <p className="text-slate-500 text-sm">
            还没有账号？
            <button onClick={onGoToRegister} className="text-primary font-bold hover:underline ml-1">立即注册</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterView = ({ onBack, onRegister }: { onBack: () => void, onRegister: (user: User) => void }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !nickname || !password) {
      alert('请完整填写邮箱、昵称和密码');
      return;
    }

    // 简单的邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert('请输入有效的邮箱地址');
      return;
    }

    if (password.length < 6) {
      alert('密码长度至少需要 6 位');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            full_name: nickname,
            avatar_url: avatarPreview || MOCK_USER.avatar,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        alert(`注册失败: ${error.message}`);
        return;
      }

      if (data.user) {
        // If Supabase is configured for email confirmation, session might be null
        if (!data.session) {
          alert('注册成功！请查收邮件以确认您的账号（如果已开启邮件确认）。');
          onBack(); // Return to login page
        } else {
          onRegister({
            id: data.user.id,
            name: nickname,
            email: trimmedEmail,
            avatar: avatarPreview || MOCK_USER.avatar,
            role: 'user', // Default role for new registrations
            isPro: false
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <div className="flex items-center p-4 justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-md">
        <button onClick={onBack} className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 text-center pr-10">AI快报</h2>
      </div>

      <div className="px-6 pt-2 pb-4 text-center">
        <h1 className="text-slate-900 tracking-tight text-[28px] font-bold leading-tight mb-2">欢迎加入</h1>
        <p className="text-slate-500 text-sm font-normal">注册账号，即刻掌握前沿 AI 资讯</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 pb-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera size={36} className="text-slate-400 group-hover:text-primary transition-colors" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md transform translate-x-1 translate-y-1">
            <Camera size={14} />
          </div>
        </div>
        <span className="text-sm font-medium text-slate-600">上传头像</span>
      </div>

      <div className="flex flex-col gap-5 px-6 py-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-900 text-sm font-semibold">邮箱/手机号</span>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Smartphone size={20} />
            </div>
            <input
              type="email"
              placeholder="请输入邮箱或手机号码"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-10 pr-4 placeholder:text-slate-400 text-base transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-slate-900 text-sm font-semibold">昵称</span>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <UserCircle size={20} />
            </div>
            <input
              type="text"
              placeholder="您的显示名称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-10 pr-4 placeholder:text-slate-400 text-base transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-slate-900 text-sm font-semibold">设置密码</span>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="8 位以上字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-10 pr-10 placeholder:text-slate-400 text-base transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-2">
          <input type="checkbox" id="terms" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
          <label htmlFor="terms" className="text-xs text-slate-500 leading-tight cursor-pointer">
            我已阅读并同意 <button className="text-primary hover:underline font-medium">AI快报服务条款</button> 和 <button className="text-primary hover:underline font-medium">隐私政策</button>
          </label>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <button
          onClick={handleRegister}
          disabled={isSubmitting}
          className={`w-full bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span>{isSubmitting ? '正在创建账号...' : '立即注册'}</span>
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
        <p className="text-center mt-6 text-sm text-slate-500">
          已有账号？ <button onClick={onBack} className="text-primary font-bold hover:underline ml-1">立即登录</button>
        </p>
      </div>
    </div>
  );
};

const HomeView = ({ onArticleClick, articles }: { onArticleClick: (article: Article) => void, articles: Article[] }) => {
  const categories = ['全部', 'AI编程', 'AI绘画', '大模型资讯'];
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === '全部' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const listArticles = filteredArticles.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto pb-24">
      <header className="pt-6 pb-2 px-4 bg-white z-20 sticky top-0 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">AI</div>
            <h1 className="text-slate-900 text-2xl font-bold tracking-tight">AI快报</h1>
          </div>
        </div>
        <div className="flex w-full items-stretch rounded-xl h-11 shadow-sm border border-slate-200 bg-slate-50">
          <div className="text-slate-400 flex items-center justify-center pl-3">
            <Search size={20} />
          </div>
          <input
            className="flex w-full border-none bg-transparent focus:ring-0 px-3 text-sm placeholder:text-slate-400"
            placeholder="搜索新闻、工具和模型"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar flex-shrink-0 bg-white border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-all ${activeCategory === cat
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {featuredArticle && (
          <>
            <div className="px-4 pb-2 pt-4 flex items-center justify-between">
              <h2 className="text-slate-900 text-lg font-bold">热门推荐</h2>
              <button className="text-primary text-xs font-medium hover:opacity-80">查看全部</button>
            </div>

            <div className="px-4 pb-6 pt-2">
              <div
                onClick={() => onArticleClick(featuredArticle)}
                className="flex flex-col items-stretch justify-start rounded-xl shadow-sm overflow-hidden bg-white border border-slate-200 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-full relative aspect-[2/1] overflow-hidden">
                  <img
                    src={featuredArticle.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Featured"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-slate-900 shadow-sm">
                    头条
                  </div>
                </div>
                <div className="flex w-full grow flex-col items-stretch justify-center gap-2 p-3">
                  <h3 className="text-slate-900 text-base font-bold leading-snug tracking-tight line-clamp-2">
                    {featuredArticle.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">{featuredArticle.category}</span>
                      <span className="text-slate-500 text-xs">{featuredArticle.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Heart size={16} />
                      <span className="text-xs">{featuredArticle.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-slate-50 mx-0 mb-4 border-y border-slate-100"></div>
          </>
        )}

        {listArticles.length > 0 && (
          <>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h2 className="text-slate-900 text-lg font-bold">最新动态</h2>
            </div>

            <div className="flex flex-col px-4">
              {listArticles.map((article) => (
                <div key={article.id}>
                  <ArticleCard
                    article={article}
                    onClick={() => onArticleClick(article)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {filteredArticles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <Search size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">未找到相关文章</p>
            <p className="text-slate-400 text-sm mt-1">尝试更换搜索词或分类</p>
          </div>
        )}
      </main>
    </div>
  );
};

const ArticleDetailView = ({
  article,
  onBack,
  isLiked,
  isBookmarked,
  onToggleLike,
  onToggleBookmark
}: {
  article: Article,
  onBack: () => void,
  isLiked: boolean,
  isBookmarked: boolean,
  onToggleLike: () => void,
  onToggleBookmark: () => void
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-32 max-w-md mx-auto border-x border-slate-100 shadow-sm">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="w-full">
        <div className="w-full aspect-[16/9] bg-center bg-no-repeat bg-cover relative">
          <img
            src={article.imageUrl}
            className="w-full h-full object-cover"
            alt="Article Header"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between py-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                <img src={MOCK_USER.avatar} className="w-full h-full object-cover" alt="Author" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{article.author}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded">认证作者</span>
                </div>
                <span className="text-xs text-slate-500">{article.date} · 阅读时间 {article.readTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500">#人工智能</span>
            <span className="text-xs font-medium text-slate-500">#设计趋势</span>
          </div>
        </div>

        <article className="px-4 font-sans text-[17px] leading-8 text-slate-700 space-y-6">
          <p>
            生成式人工智能正在迅速改变我们处理创造力的方式。从 <span className="text-blue-600 font-medium bg-blue-50 px-1 rounded">Midjourney</span> 到 GPT-4，技术格局正在发生巨变，挑战着传统的工作流程，并为数字艺术家开辟了新的视野。
          </p>
          <p>
            问题不在于人工智能是否会取代艺术家，而在于艺术家如何利用这些强大的新副驾驶来放大他们的创作意图。我们正在见证一种混合创造力的复兴，人类的直觉指引着机器的精确度。
          </p>
          <blockquote className="pl-4 my-8 border-l-[3px] border-black italic text-lg text-slate-800 font-serif">
            "我们正在从一个创造的世界走向一个策展和指导的世界。提示词就是新的画笔。"
          </blockquote>
          <h2 className="text-xl font-bold text-black mt-8 mb-4">代码作为一种创意媒介</h2>
          <p>
            开发者正在成为艺术家，而艺术家正在成为开发者。Python 脚本就是新的素描本。
          </p>
          <div className="my-6 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
              <span className="text-xs font-mono text-slate-500">diffusion_setup.py</span>
              <button className="text-xs text-slate-400 hover:text-slate-600">复制</button>
            </div>
            <div className="p-4 overflow-x-auto bg-slate-50">
              <pre className="font-mono text-xs leading-5 text-slate-800">
                <code>{`import torch
from diffusers import StableDiffusionPipeline
# 初始化管道
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", 
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")`}</code>
              </pre>
            </div>
          </div>
        </article>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-center gap-16 py-4 max-w-md mx-auto pb-8">
          <button
            onClick={onToggleLike}
            className={`group flex flex-col items-center justify-center transition-colors gap-1 ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
          >
            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
              <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} className="group-active:scale-90 transition-transform" />
            </div>
            <span className="text-xs font-medium">{isLiked ? '2.1k' : '2k'}</span>
          </button>
          <button
            onClick={onToggleBookmark}
            className={`group flex flex-col items-center justify-center transition-colors gap-1 ${isBookmarked ? 'text-yellow-500' : 'text-slate-500 hover:text-yellow-500'}`}
          >
            <div className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-yellow-50' : 'group-hover:bg-yellow-50'}`}>
              <Bookmark size={28} fill={isBookmarked ? 'currentColor' : 'none'} className="group-active:scale-90 transition-transform" />
            </div>
            <span className="text-xs font-medium">{isBookmarked ? '已收藏' : '收藏'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, onLogout, onGoToFavorites, onGoToHistory, onNavigateToAdmin }: { user: User, onLogout: () => void, onGoToFavorites: () => void, onGoToHistory: () => void, onNavigateToAdmin?: () => void }) => {
  const stats = [
    { label: '阅读总数', value: '1,280' },
    { label: '连续登录', value: '12天' },
    { label: '等级', value: 'Lv.4' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] max-w-md mx-auto">
      <div className="bg-primary pt-14 pb-12 px-6 rounded-b-[40px] shadow-lg shadow-primary/20 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 p-1 group-hover:border-white/50 transition-all">
              <img src={user.avatar} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {user.isPro && (
              <div className="absolute bottom-1 right-1 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-primary">
                PRO
              </div>
            )}
          </div>
          <h2 className="text-white text-2xl font-bold mt-4 tracking-tight">{user.name}</h2>
          <p className="text-white/70 text-sm mt-1 mb-6 font-medium">{user.email}</p>

          <div className="flex items-center gap-8 w-full justify-center">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-white text-lg font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 flex-1 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 space-y-2 border border-slate-100/50">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                <CreditCard size={20} />
              </div>
              <span className="text-slate-700 font-bold">我的订阅</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Settings size={20} />
              </div>
              <span className="text-slate-700 font-bold">设置</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>

          {user.role === 'admin' && (
            <button
              onClick={onNavigateToAdmin}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-slate-700 font-bold">后台管理系统</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          )}

          <div className="h-4"></div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={20} />
              </div>
              <span className="text-slate-700 font-bold">退出登录</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const FavoritesView = ({
  onArticleClick,
  onBack,
  showBack,
  articles,
  favoriteIds
}: {
  onArticleClick: (article: Article) => void,
  onBack: () => void,
  showBack: boolean,
  articles: Article[],
  favoriteIds: Set<string>
}) => {
  const categories = ['全部', 'AI编程', 'AI绘画', '大模型资讯'];
  const [activeCategory, setActiveCategory] = useState('全部');

  const favoriteArticles = articles.filter(a => favoriteIds.has(a.id));
  const filteredFavorites = favoriteArticles.filter(a => activeCategory === '全部' || a.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto pb-24 border-x border-slate-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-slate-50">
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">我的收藏</h1>
        </div>
      </header>

      <div className="sticky top-[61px] z-20 flex w-full gap-2 overflow-x-auto bg-white px-4 py-3 border-b border-slate-100 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium transition-colors ${activeCategory === cat
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-2">
        {filteredFavorites.length > 0 ? (
          <div className="flex flex-col">
            {filteredFavorites.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group flex gap-4 py-4 border-b border-slate-100 last:border-0 active:bg-slate-50 -mx-4 px-4 transition-colors cursor-pointer"
              >
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{article.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{article.category}</span>
                      <span>{article.readTime}阅读</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">刚刚保存</span>
                    <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover">
                      <Bookmark size={16} fill="currentColor" />
                      <span>移除</span>
                    </button>
                  </div>
                </div>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                  <img
                    src={article.imageUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Bookmark size={48} className="text-slate-100 mb-4" />
            <p className="text-slate-400 font-medium">暂无收藏内容</p>
          </div>
        )}
        {filteredFavorites.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3 text-slate-200">
            <div className="h-px w-12 bg-current"></div>
            <span className="text-xs font-medium text-slate-400">已显示全部内容</span>
            <div className="h-px w-12 bg-current"></div>
          </div>
        )}
      </main>
    </div>
  );
};

const HistoryView = ({ onArticleClick, onBack, historyIds, articles }: { onArticleClick: (article: Article) => void, onBack: () => void, historyIds: string[], articles: Article[] }) => {
  const historyArticles = historyIds.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto pb-24 border-x border-slate-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-slate-50">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">阅读历史</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-2">
        {historyArticles.length > 0 ? (
          <div className="flex flex-col">
            {historyArticles.map((article, index) => (
              <div key={`${article.id}-${index}`}>
                <ArticleCard article={article} onClick={() => onArticleClick(article)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <History size={48} className="text-slate-100 mb-4" />
            <p className="text-slate-400 font-medium">暂无阅读历史</p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('login');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backView, setBackView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);

  // App state
  const [articles, setArticles] = useState<Article[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchArticles();

    // 路径监听逻辑
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setView('admin');
      } else if (view === 'admin') {
        setView('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // 初始化检测
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // 辅助跳转函数
  const navigateTo = (newView: View) => {
    if (newView === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    setView(newView);
  };

  useEffect(() => {
    if (currentUser?.id && isLoggedIn) { // Only fetch user data if logged in
      fetchUserData(currentUser.id);
    }
  }, [currentUser, isLoggedIn]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false }); // Added order by created_at

    if (!error && data) {
      setArticles(data.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt || '',
        category: item.category || '全部',
        author: item.author || '匿名',
        date: item.date || '刚刚',
        readTime: item.read_time || '1分钟',
        imageUrl: item.image_url || '',
        likes: item.likes_count?.toString() || '0',
        content: item.content || '' // Added content
      })));
    }
  };

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      handleAuthSuccess({
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || "用户",
        email: authUser.email || "",
        avatar: profile?.avatar_url || MOCK_USER.avatar,
        role: profile?.role || 'user', // Ensure role is set
        isPro: profile?.is_pro || false
      });
    }
    setLoading(false);
  };

  const fetchUserData = async (userId: string) => {
    const [favs, hist] = await Promise.all([
      supabase.from('favorites').select('article_id').eq('user_id', userId),
      supabase.from('reading_history').select('article_id').eq('user_id', userId).order('last_read_at', { ascending: false })
    ]);

    if (favs.data) setFavorites(new Set(favs.data.map(f => f.article_id)));
    if (hist.data) setHistory(hist.data.map(h => h.article_id));
  };

  const toggleLike = (id: string) => {
    setLikes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBookmark = async (id: string) => {
    if (!currentUser?.id) return;

    const isBookmarked = favorites.has(id);
    if (isBookmarked) {
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('article_id', id);
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({ user_id: currentUser.id, article_id: id });
      setFavorites(prev => new Set(prev).add(id));
    }
  };

  const handleArticleClick = async (article: Article, fromView: View = view) => {
    setSelectedArticle(article);
    setBackView(fromView);
    setView('detail');

    if (currentUser?.id) {
      await supabase.from('reading_history').upsert({
        user_id: currentUser.id,
        article_id: article.id,
        last_read_at: new Date().toISOString()
      });
      setHistory(prev => [article.id, ...prev.filter(id => id !== article.id)].slice(0, 50));
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (window.location.pathname === '/admin' && user.role === 'admin') {
      setView('admin');
    } else {
      navigateTo('home');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(MOCK_USER);
    setFavorites(new Set());
    setLikes(new Set());
    setHistory([]);
    navigateTo('login');
  };

  // Simple routing logic
  const renderView = () => {
    // 强制鉴权拦截
    if (view === 'admin' && currentUser?.role !== 'admin' && !loading) {
      return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">无权访问后台</div>;
    }

    switch (view) {
      case 'login':
        return <LoginView onLogin={handleAuthSuccess} onGoToRegister={() => setView('register')} />;
      case 'register':
        return <RegisterView onBack={() => setView('login')} onRegister={handleAuthSuccess} />;
      case 'home':
        return <HomeView articles={articles} onArticleClick={(article) => handleArticleClick(article, 'home')} />;
      case 'detail':
        return selectedArticle ? (
          <ArticleDetailView
            article={selectedArticle}
            onBack={() => setView(backView)}
            isLiked={likes.has(selectedArticle.id)}
            isBookmarked={favorites.has(selectedArticle.id)}
            onToggleLike={() => toggleLike(selectedArticle.id)}
            onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
          />
        ) : null;
      case 'profile':
        return (
          <ProfileView
            user={currentUser}
            onLogout={handleLogout}
            onGoToFavorites={() => setFavoritesViewFromProfile(true)}
            onGoToHistory={() => setView('history')}
            onNavigateToAdmin={() => navigateTo('admin')}
          />
        );
      case 'favorites':
        return (
          <FavoritesView
            onArticleClick={(article) => handleArticleClick(article, 'favorites')}
            onBack={() => setView('profile')}
            showBack={false}
            articles={articles}
            favoriteIds={favorites}
          />
        );
      case 'history':
        return <HistoryView articles={articles} onArticleClick={(article) => handleArticleClick(article, 'history')} onBack={() => setView('profile')} historyIds={history} />;
      case 'admin':
        return currentUser ? (
          <AdminView
            currentUser={currentUser}
            onBack={() => {
              navigateTo('profile');
              fetchArticles();
            }}
          />
        ) : null;
      default:
        return <HomeView articles={articles} onArticleClick={(article) => handleArticleClick(article, 'home')} />;
    }
  };

  // Helper to handle favorites view entry point
  const [favFromProfile, setFavFromProfile] = useState(false);
  const setFavoritesViewFromProfile = (val: boolean) => {
    setFavFromProfile(val);
    setView('favorites');
  };

  // Override FavoritesView for profile entry
  const finalRenderView = () => {
    if (view === 'favorites' && favFromProfile) {
      return (
        <FavoritesView
          onArticleClick={(article) => handleArticleClick(article, 'favorites')}
          onBack={() => { setFavFromProfile(false); setView('profile'); }}
          showBack={true}
          articles={articles}
          favoriteIds={favorites}
        />
      );
    }
    return renderView();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={view + (selectedArticle?.id || '')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {finalRenderView()}
        </motion.div>
      </AnimatePresence>

      {isLoggedIn && !['detail', 'history'].includes(view) && !(view === 'favorites' && favFromProfile) && (
        <Navbar activeView={view} onViewChange={(v) => { setFavFromProfile(false); setView(v); }} />
      )}
    </div>
  );
}
