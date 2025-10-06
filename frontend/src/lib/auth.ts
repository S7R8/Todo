import {apiClient} from "./api.ts";

export const authApi = {
    signup: async(userData: { name: string; email: string; password: string }) => { // nameを追加
        return apiClient.post('/signup', userData);
    },

    login: async (credentials: { email: string; password: string }) => {
        return apiClient.post('/authenticate', credentials);
    },

    logout: async () => {
        return apiClient.post('/logout', {});
    },

    // セッション確認用（/todosはユーザー情報も返す）
    checkAuth: async () => {
        return apiClient.get('/todos');
    }
}