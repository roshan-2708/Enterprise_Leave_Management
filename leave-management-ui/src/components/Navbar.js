// src/components/Navbar.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, isAuthReady, logout, openAuthModal } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isManager = currentUser?.role === 'MANAGER';
  const homeUrl = !currentUser ? '/' : isManager ? '/manager' : '/employee';

  return (
    <header className="bg-white border-b border-gray-200/90 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <Link href={homeUrl} className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            SAP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                Leave Management Portal
              </span>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-mono">
                BTP RAP
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {currentUser
                ? isManager
                  ? 'Manager Oversight & Approval Suite'
                  : 'Employee Self-Service Portal'
                : 'Enterprise HR Management System'}
            </p>
          </div>
        </Link>

        {/* Right: User Profile or Sign In Button (NO TOGGLE) */}
        <div className="flex items-center gap-3">
          {!isAuthReady ? (
            <div className="w-28 h-8 bg-gray-100 animate-pulse rounded-full" />
          ) : currentUser ? (
            /* Logged in state: Only user info + Sign Out. NO Register/Login button! NO demo toggle! */
            <div className="flex items-center gap-3">
              {/* User Identity Card */}
              <div className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 bg-gray-50 border border-gray-200/90 rounded-full shadow-2xs">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                    isManager
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                  }`}
                >
                  {getInitials(currentUser.name)}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 max-w-[140px] truncate leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isManager
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 leading-none mt-0.5">
                    ID: {currentUser.id}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors shadow-2xs"
                title="Sign Out"
              >
                <svg className="w-3.5 h-3.5 text-gray-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Logged out state: Show Sign In / Register button */
            <div className="flex items-center gap-2">
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}