
import React, { useState, useEffect, useMemo } from 'react';
import { Notice, AppView, User } from './types';
import { INITIAL_NOTICES, STORAGE_KEY, CATEGORY_KEY, AUTH_KEY, DEFAULT_CATEGORIES } from './constants';
import { NoticeCard } from './NoticeCard';

const App: React.FC = () => {
  // 核心状态
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  // 表单状态
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: '' });
  const [newCategory, setNewCategory] = useState('');

  // 初始化数据加载
  useEffect(() => {
    const savedNotices = localStorage.getItem(STORAGE_KEY);
    const savedCats = localStorage.getItem(CATEGORY_KEY);
    const savedAuth = localStorage.getItem(AUTH_KEY);

    const loadedNotices = savedNotices ? JSON.parse(savedNotices) : INITIAL_NOTICES;
    const loadedCats = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;
    
    setNotices(loadedNotices);
    setCategories(loadedCats);
    if (savedAuth) setUser(JSON.parse(savedAuth));
    
    // 设置默认分类
    setNoticeForm(prev => ({ ...prev, category: loadedCats[0] }));
  }, []);

  // 数据持久化到浏览器本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  }, [categories]);

  // 搜索与过滤逻辑
  const filteredNotices = useMemo(() => {
    return notices
      .filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === '全部' || n.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [notices, searchQuery, activeCategory]);

  // 管理员登录处理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单硬编码登录逻辑
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      const u = { username: '系统管理员', isAdmin: true };
      setUser(u);
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      setCurrentView('admin');
    } else {
      alert('账号或密码错误 (提示: admin/admin123)');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setCurrentView('home');
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      alert('请填写完整信息');
      return;
    }
    const newNotice: Notice = {
      id: Date.now().toString(),
      ...noticeForm,
      createdAt: Date.now(),
      author: user?.username || '管理中心'
    };
    setNotices([newNotice, ...notices]);
    setNoticeForm({ title: '', content: '', category: categories[0] });
    setCurrentView('admin');
    alert('发布成功');
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('确认删除此通知吗？')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col relative overflow-hidden">
        
        {/* 顶部导航栏 */}
        <header className="bg-blue-800 text-white p-4 sticky top-0 z-30 shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setCurrentView('home'); setActiveCategory('全部'); setSearchQuery('');}}>
              <div className="bg-white p-1 rounded-lg text-blue-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 2.318a1 1 0 01-.8 1.601H3.852a1 1 0 01-.8-1.601l1.738-2.318-1.233-.616a1 1 0 01.894-1.79l1.599.8L10 4.323V3a1 1 0 011-1zm-7 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
              </div>
              <h1 className="text-lg font-bold">惠警暖警</h1>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentView('admin')} className="text-xs bg-blue-700 px-3 py-1.5 rounded-lg">管理</button>
                <button onClick={handleLogout} className="text-xs bg-red-500 px-3 py-1.5 rounded-lg">退出</button>
              </div>
            ) : (
              <button onClick={() => setCurrentView('login')} className="text-xs bg-white text-blue-800 px-4 py-1.5 rounded-full font-bold">管理员登录</button>
            )}
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          
          {/* 首页视图 */}
          {currentView === 'home' && (
            <div className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索通知标题或内容..." 
                  className="w-full p-3 pl-10 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              
              {/* 分类筛选器 */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['全部', ...categories].map(c => (
                  <button 
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === c ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* 通知列表 */}
              <div className="space-y-3">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map(n => (
                    <NoticeCard key={n.id} notice={n} onClick={(notice) => { setSelectedNotice(notice); setCurrentView('detail'); }} />
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 text-sm">暂无相关通知</div>
                )}
              </div>
            </div>
          )}

          {/* 详情页视图 */}
          {currentView === 'detail' && selectedNotice && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <button onClick={() => setCurrentView('home')} className="flex items-center gap-1 text-blue-800 font-bold mb-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                返回列表
              </button>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded font-bold">{selectedNotice.category}</span>
                  <span className="text-xs text-slate-400">{new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedNotice.title}</h2>
                <div className="text-xs text-slate-500 border-b border-slate-100 pb-3 mb-3">
                   发布人：<span className="font-semibold text-slate-700">{selectedNotice.author}</span>
                </div>
                <div className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
              </div>
            </div>
          )}

          {/* 管理页面 */}
          {currentView === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">通知管理后台</h2>
                <button onClick={() => setCurrentView('create')} className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold">发布新通知</button>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-50 text-xs font-bold text-slate-500 flex justify-between">
                   <span>通知标题</span>
                   <span>操作</span>
                </div>
                {notices.length > 0 ? notices.map((n, i) => (
                  <div key={n.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0">
                    <div className="flex-1 truncate pr-4">
                      <p className="font-bold text-slate-800 truncate text-sm">{n.title}</p>
                      <p className="text-[10px] text-slate-400">{n.category} · {new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteNotice(n.id)} className="text-red-500 p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 text-sm">空空如也</div>
                )}
              </div>

              {/* 分类维护 */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">分类设置</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="输入新分类名称" 
                    className="flex-1 p-2 bg-slate-100 rounded-lg outline-none text-sm"
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                  />
                  <button onClick={handleAddCategory} className="bg-blue-800 text-white px-4 rounded-lg text-sm">添加</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map(c => (
                    <span key={c} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                      {c}
                      <button onClick={() => setCategories(categories.filter(x => x !== c))} className="text-red-400 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 发布页面 */}
          {currentView === 'create' && (
            <form onSubmit={handleCreateNotice} className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => setCurrentView('admin')} className="text-slate-400 text-sm">取消</button>
                <h2 className="text-lg font-bold">发布新通知</h2>
                <button type="submit" className="text-blue-800 font-bold">发布</button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 px-1">通知标题</label>
                <input 
                  type="text" 
                  placeholder="请输入标题..." 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={noticeForm.title} 
                  onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 px-1">选择分类</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={noticeForm.category} 
                  onChange={e => setNoticeForm({...noticeForm, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 px-1">通知正文</label>
                <textarea 
                  rows={12} 
                  placeholder="请输入正文内容..." 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={noticeForm.content} 
                  onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-blue-800 text-white p-4 rounded-xl font-bold shadow-lg">确认发布</button>
            </form>
          )}

          {/* 登录页面 */}
          {currentView === 'login' && (
            <div className="py-12 space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-blue-800 mb-4">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">管理员登录</h2>
                <p className="text-slate-400 text-sm">请登录后发布或管理通知内容</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="账号 (提示: admin)" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800"
                  value={loginForm.username} 
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                />
                <input 
                  type="password" 
                  placeholder="密码 (提示: admin123)" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800"
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                />
                <button type="submit" className="w-full bg-blue-800 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-colors">登录系统</button>
                <button type="button" onClick={() => setCurrentView('home')} className="w-full text-slate-400 text-sm font-medium py-2">返回主页</button>
              </form>
            </div>
          )}
        </main>

        {/* 底部简易导航栏 (仅在首页显示) */}
        {currentView === 'home' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-3 rounded-full shadow-2xl border border-slate-100 flex gap-12 z-20">
             <button onClick={() => {setCurrentView('home'); setActiveCategory('全部');}} className="text-blue-800 flex flex-col items-center gap-1">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
               <span className="text-[10px] font-bold">首页</span>
             </button>
             <button onClick={() => setCurrentView(user ? 'admin' : 'login')} className="text-slate-400 flex flex-col items-center gap-1">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               <span className="text-[10px] font-bold">管理</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
