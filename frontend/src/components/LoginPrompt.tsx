import { X, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const LoginPrompt = () => {
  const { showLoginPrompt, dismissLoginPrompt, isInitializing } = useAuth();
  const location = useLocation();
  
  // ログイン・サインアップ画面では表示しない
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // ダッシュボード画面でのみ表示
  const isDashboardPage = location.pathname === '/dashboard';
  
  // 初期化中は表示しない
  if (isInitializing || !showLoginPrompt || isAuthPage || !isDashboardPage) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Session Expired</h2>
          </div>
          <button
            onClick={dismissLoginPrompt}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Your session has expired or you're not logged in. Please log in to continue using TaskMaster.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={dismissLoginPrompt}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Dismiss
          </button>
          <Link
            to="/login"
            onClick={dismissLoginPrompt}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};