
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

  // 初始化加载数据
  useEffect(() => {
    try {
      const savedNotices = localStorage.getItem(STORAGE_KEY);
      const savedCats = localStorage.getItem(CATEGORY_KEY);
      const savedAuth = localStorage.getItem(AUTH_KEY);

      const loadedNotices = savedNotices ? JSON.parse(savedNotices) : INITIAL_NOTICES;
      const loadedCats = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;
      
      setNotices(loadedNotices);
      setCategories(loadedCats);
      if (savedAuth) setUser(JSON.parse(savedAuth));
      
      // 设置表单默认分类
      setNoticeForm(prev => ({ ...prev, category: loadedCats[0] }));
    } catch (e) {
      console.error("加载本地数据失败:", e);
      setNotices(INITIAL_NOTICES);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  // 监听通知状态变更并保存
  useEffect(() => {
    if (notices.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    }
  }, [notices]);

  // 搜索过滤
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

  // 登录
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      const u = { username: '系统管理员', isAdmin: true };
      setUser(u);
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      setCurrentView('admin');
    } else {
      alert('账号或密码错误 (提示: admin/admin123)');
    }
  };

  // 退出
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setCurrentView('home');
  };

  // 发布
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('请填写完整内容');
      return;
    }
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: noticeForm.title,
      content: noticeForm.content,
      category: noticeForm.category || categories[0],
      createdAt: Date.now(),
      author: user?.username || '管理中心'
    };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNoticeForm({ title: '', content: '', category: categories[0] });
    setCurrentView('home');
    alert('通知发布成功！');
  };

  // 删除
  const handleDelete = (id: string) => {
    if (confirm('确认删除此通知吗？此操作不可恢复。')) {
      const updated = notices.filter(n => n.id !== id);
      setNotices(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center selection:bg-blue-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* 导航条 */}
        <header className="bg-blue-800 text-white p-5 sticky top-0 z-50 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="bg-white/20 p-1 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 2.318a1 1 0 01-.8 1.601H3.852a1 1 0 01-.8-1.601l1.738-2.318-1.233-.616a1 1 0 01.894-1.79l1.599.8L10 4.323V3a1 1 0 011-1z" /></svg>
              </div>
              <h1 className="text-xl font-bold italic tracking-tighter">惠警暖警</h1>
            </div>
            {user ? (
              <div className="flex gap-2">
                <button onClick={() => setCurrentView('admin')} className="text-[10px] bg-white/20 px-3 py-1.5 rounded-full font-bold">管理后台</button>
                <button onClick={handleLogout} className="text-[10px] bg-red-500 px-3 py-1.5 rounded-full font-bold">退出</button>
              </div>
            ) : (
              <button onClick={() => setCurrentView('login')} className="text-[10px] bg-white text-blue-800 px-3 py-1.5 rounded-full font-bold">管理员登录</button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          {/* 首页 */}
          {currentView === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索通知关键词..." 
                  className="w-full p-4 pl-12 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['全部', ...categories].map(c => (
                  <button 
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      activeCategory === c ? 'bg-blue-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map(n => (
                    <NoticeCard key={n.id} notice={n} onClick={(notice) => { setSelectedNotice(notice); setCurrentView('detail'); }} />
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 text-sm">暂无内容</div>
                )}
              </div>
            </div>
          )}

          {/* 详情 */}
          {currentView === 'detail' && selectedNotice && (
            <div className="animate-in slide-in-from-right duration-300">
              <button onClick={() => setCurrentView('home')} className="flex items-center gap-1 text-blue-800 font-bold mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                返回列表
              </button>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-800 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{selectedNotice.category}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedNotice.title}</h2>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-sm">
                    {selectedNotice.author.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-800 font-bold">{selectedNotice.author}</p>
                    <p className="text-slate-400">官方发布</p>
                  </div>
                </div>
                <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap pt-2">
                  {selectedNotice.content}
                </div>
              </div>
            </div>
          )}

          {/* 登录 */}
          {currentView === 'login' && (
            <div className="py-10 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black text-center text-slate-800 mb-8">管理员登录</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  required 
                  placeholder="账号 (admin)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-800"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
                <input 
                  type="password" 
                  required 
                  placeholder="密码 (admin123)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-800"
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
                <button type="submit" className="w-full bg-blue-800 text-white p-4 rounded-2xl font-bold shadow-lg">登录</button>
                <button type="button" onClick={() => setCurrentView('home')} className="w-full text-slate-400 text-sm py-2">取消</button>
              </form>
            </div>
          )}

          {/* 管理 */}
          {currentView === 'admin' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">内容维护</h2>
                <button onClick={() => setCurrentView('create')} className="bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold">发布新通知</button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {notices.map(n => (
                  <div key={n.id} className="p-4 flex justify-between items-center border-b last:border-0 border-slate-50">
                    <div className="flex-1 truncate mr-4">
                      <p className="font-bold text-slate-800 text-sm truncate">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.category} · {new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(n.id)} className="p-2 text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 发布 */}
          {currentView === 'create' && (
            <div className="animate-in slide-in-from-bottom duration-300">
              <h2 className="text-xl font-black mb-6">发布通知</h2>
              <form onSubmit={handleCreateNotice} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">标题</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="请输入标题..." 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                    value={noticeForm.title}
                    onChange={e => setNoticeForm({...noticeForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">选择分类</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(c => (
                      <button 
                        key={c}
                        type="button"
                        onClick={() => setNoticeForm({...noticeForm, category: c})}
                        className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                          noticeForm.category === c 
                            ? 'bg-blue-800 text-white border-blue-800' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">正文</label>
                  <textarea 
                    rows={8} 
                    required 
                    placeholder="请输入详细内容..." 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                    value={noticeForm.content}
                    onChange={e => setNoticeForm({...noticeForm, content: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-blue-800 text-white p-5 rounded-2xl font-bold shadow-xl">立即发布</button>
                <button type="button" onClick={() => setCurrentView('admin')} className="w-full text-slate-400 text-sm py-2">返回管理</button>
              </form>
            </div>
          )}
        </main>

        {/* 底部导航 */}
        {currentView === 'home' && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-slate-100 px-10 py-4 flex justify-around items-center z-50">
            <button className="flex flex-col items-center gap-1 text-blue-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">首页</span>
            </button>
            <button onClick={() => setCurrentView(user ? 'admin' : 'login')} className="flex flex-col items-center gap-1 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">设置</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
