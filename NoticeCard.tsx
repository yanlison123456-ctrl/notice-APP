
import React from 'react';
import { Notice } from './types';

interface NoticeCardProps {
  notice: Notice;
  onClick: (notice: Notice) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onClick }) => {
  const dateStr = new Date(notice.createdAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      onClick={() => onClick(notice)}
      className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm active:scale-[0.97] active:bg-slate-50 transition-all cursor-pointer relative overflow-hidden flex flex-col gap-3 group"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg uppercase tracking-wider">
          {notice.category}
        </span>
        <span className="text-[10px] text-slate-400 font-bold">{dateStr}</span>
      </div>
      
      <h3 className="text-xl font-black text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
        {notice.title}
      </h3>
      
      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
        {notice.content}
      </p>
      
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-[8px] font-black text-white">
            {notice.author.charAt(0)}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">{notice.author}</span>
        </div>
        <div className="text-blue-700">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>
      </div>
    </div>
  );
};
