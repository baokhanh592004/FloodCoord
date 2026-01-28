import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PrivateRoute - Component bảo vệ các route cần xác thực
 * Nếu user chưa đăng nhập (không có token), sẽ redirect về trang login
 */
export default function PrivateRoute({ children }) {
    const location = useLocation();
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        // Redirect về login, lưu lại đường dẫn hiện tại để sau khi login có thể quay lại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
