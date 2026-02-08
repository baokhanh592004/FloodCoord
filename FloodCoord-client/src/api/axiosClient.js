import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_ROOT_URL,
    withCredentials: true,
});

// Request interceptor - Tự động gắn accessToken vào mỗi request
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý khi token hết hạn
axiosClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Success:', response.config.method.toUpperCase(), response.config.url, 'Status:', response.status);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // LOG CHI TIẾT LỖI
        console.error('❌ API Error:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn('⚠️ 401 Unauthorized - Attempting to refresh token...');
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    // KHÔNG TỰ ĐỘNG REDIRECT - CHỈ LOG
                    console.error('❌ No refresh token found!');
                    console.error('❌ User will need to login again');
                    console.error('❌ Keeping on current page for debugging...');
                    // Không xóa token và không redirect để có thể debug
                    return Promise.reject(error);
                }

                console.log('🔄 Calling refresh token API...');
                // Gọi API refresh token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_ROOT_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                console.log('✅ Token refreshed successfully!');
                // Lưu token mới
                localStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Thử lại request ban đầu với token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);

            } catch (refreshError) {
                console.error('❌ Refresh token failed!');
                console.error('❌ Refresh error:', refreshError.response?.data || refreshError.message);
                console.error('🗑️ Clearing invalid tokens and redirecting to login...');
                
                // Xóa token cũ và redirect về login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event('authChange'));
                
                // Delay 2 giây để đọc log
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                
                return Promise.reject(refreshError);
            }
        }

        // Nếu lỗi 403 (Forbidden) - user không có quyền truy cập
        if (error.response?.status === 403) {
            console.error('⛔ 403 Forbidden - User does not have permission to access this resource');
            console.error('⛔ Required role may not match user role');
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;