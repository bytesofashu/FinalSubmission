import React from 'react';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { logout } from '../lib/firebase';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-200">
          <Heart className="w-6 h-6 text-white fill-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">HeartTwin</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center overflow-hidden border border-red-200">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User profile'} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-red-600" aria-hidden="true" />
            )}
          </div>
          <span className="font-semibold text-sm text-gray-700">{user.displayName}</span>
        </div>
        <button 
          onClick={logout}
          aria-label="Logout"
          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all focus:ring-2 focus:ring-red-500 outline-none"
          title="Logout"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
