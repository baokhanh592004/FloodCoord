import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_ROOT_URL,
    withCredentials: true,
});

// ====== REFRESH TOKEN QUEUE ======
// Giải quyết vấn đề race condition: Khi nhiều request 401 xảy ra đồng thời
// (ví dụ: auto-refresh dashboard + operations mỗi 15-30s), chỉ CÓ DUY NHẤT 1
// lần gọi /api/auth/refresh. Các request khác sẽ ĐỢI kết quả rồi retry với
// token mới, tránh backend nhận 2-3 refresh cùng lúc → invalidate token cũ → logout.
let isRefreshing = false;            // Cờ: đang có 1 refresh đang chạy?
let failedQueue = [];                // Hàng đợi các request bị 401 đang chờ token mới

// Xử lý hàng đợi sau khi refresh xong (thành công hoặc thất bại)
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);   // Refresh thất bại → reject tất cả request đang chờ
        } else {
            resolve(token);  // Refresh thành công → trả token mới cho tất cả
        }
    });
    failedQueue = [];  // Reset hàng đợi
};

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
        //console.log('✅ API Success:', response.config.method.toUpperCase(), response.config.url, 'Status:', response.status);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // LOG CHI TIẾT LỖI
        console.error('Error:', {
        //    method: error.config?.method?.toUpperCase(),
        //    url: error.config?.url,
        //    status: error.response?.status,
        //    statusText: error.response?.statusText,
        //    data: error.response?.data,
            message: error.message
        });

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Đánh dấu request này đã retry rồi, tránh vòng lặp vô hạn
            originalRequest._retry = true;

            // CASE A: Đã có 1 refresh đang chạy → xếp hàng chờ
            if (isRefreshing) {
                console.log('⏳ Token refresh in progress, queuing request:', originalRequest.url);
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        // Khi refresh xong → gắn token mới → retry request
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // CASE B: Chưa có ai refresh → mình làm
            isRefreshing = true;
            console.warn('⚠️ 401 Unauthorized - Attempting to refresh token...');

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    console.error('❌ No refresh token found!');
                    processQueue(new Error('No refresh token'), null);
                    return Promise.reject(error);
                }

                //console.log('🔄 Calling refresh token API...');
                const response = await axios.post(
                    `${import.meta.env.VITE_API_ROOT_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                console.log('✅ Token refreshed successfully!');
                localStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Thông báo cho tất cả request đang chờ: "token mới đây, retry đi"
                processQueue(null, newAccessToken);

                // Retry request gốc (request đầu tiên gặp 401)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);

            } catch (refreshError) {
                console.error('❌ Refresh token failed!');
                console.error('❌ Refresh error:', refreshError.response?.data || refreshError.message);
                
                // Thông báo cho tất cả request đang chờ: "thất bại rồi"
                processQueue(refreshError, null);
                
                // Xóa token cũ và redirect về login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event('authChange'));
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                
                return Promise.reject(refreshError);
            } finally {
                // Dù thành công hay thất bại, luôn mở khóa để lần sau có thể refresh lại
                isRefreshing = false;
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