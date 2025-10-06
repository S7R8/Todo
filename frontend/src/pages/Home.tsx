
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // TOPページにアクセスしたら自動的にLogin画面にリダイレクト
        navigate('/login');
    }, [navigate]);

    // リダイレクト中のローディング表示
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Redirecting to login...</p>
            </div>
        </div>
    );
}