"use client";

import { Bell, Download, Share2, User } from "lucide-react";

interface TopNavigationProps {
  title: string;
  subtitle?: string;
  onDownload?: () => void;
  onShare?: () => void;
  notificationCount?: number;
  userAvatar?: string;
}

export function TopNavigation({ 
  title, 
  subtitle, 
  onDownload, 
  onShare, 
  notificationCount = 0,
  userAvatar 
}: TopNavigationProps) {
  return (
    <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          {onDownload && (
            <button onClick={onDownload} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-slate-400" />
            </button>
          )}
          {onShare && (
            <button onClick={onShare} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-slate-400" />
            </button>
          )}
          <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}