const API_BASE_URL = 'http://localhost:8080';

export const apiClient = {
    post: async(endpoint: string, data : any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: any = new Error(`API Error: ${response.statusText}`);
            error.status = response.status;
            error.response = { status: response.status };
            throw error;
        }

        // レスポンスが空の場合の対応
        const text = await response.text();
        if (!text) {
            return {}; // 空のオブジェクトを返す
        }
        
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON parse error:', error, 'Response text:', text);
            throw new Error('Invalid JSON response');
        }
    },

    get: async(endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const error: any = new Error(`API Error: ${response.statusText}`);
            error.status = response.status;
            error.response = { status: response.status };
            throw error;
        }

        // レスポンスが空の場合の対応
        const text = await response.text();
        if (!text) {
            return {};
        }
        
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON parse error:', error, 'Response text:', text);
            throw new Error('Invalid JSON response');
        }
    }
};