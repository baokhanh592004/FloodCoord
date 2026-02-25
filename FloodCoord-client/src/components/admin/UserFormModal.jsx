import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Shield, AlertCircle } from 'lucide-react';
import { adminUserApi } from '../../services/adminUserApi';

export default function UserFormModal({ editingUser, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        status: true
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoles();
        if (editingUser) {
            // Map roleName to roleId from roles list
            const getRoleIdFromName = (roleName) => {
                const roleMap = {
                    'Quản Trị Viên': 1,
                    'Quản Lý': 2,
                    'Điều Phối Viên': 3,
                    'Đội Cứu Hộ': 4,
                    'Thành Viên': 5
                };
                return roleMap[roleName] || '';
            };

            setFormData({
                fullName: editingUser.fullName || '',
                email: editingUser.email || '',
                phoneNumber: editingUser.phoneNumber || '',
                password: '',
                confirmPassword: '',
                roleId: getRoleIdFromName(editingUser.roleName),
                status: editingUser.status !== undefined ? editingUser.status : true
            });
        }
    }, [editingUser]);

    const fetchRoles = async () => {
        try {
            const data = await adminUserApi.getAllRoles();
            setRoles(data);
            if (!editingUser && data.length > 0) {
                setFormData(prev => ({ ...prev, roleId: data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!editingUser) {
            if (!formData.password) {
                setError('Vui lòng nhập mật khẩu');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                return;
            }
        }

        try {
            setLoading(true);
            
            if (editingUser) {
                // Update - only send changed fields
                const updateData = {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    status: formData.status,
                    roleId: parseInt(formData.roleId)
                };
                await adminUserApi.updateUser(editingUser.id, updateData);
            } else {
                // Create - send all required fields
                const createData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    rollCode: roles.find(r => r.id === parseInt(formData.roleId))?.roleCode
                };
                await adminUserApi.createUser(createData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (roleCode) => {
        switch (roleCode) {
            case 'ADMIN': return '👑';
            case 'MANAGER': return '📊';
            case 'COORDINATOR': return '🎯';
            case 'RESCUE_TEAM': return '🚨';
            case 'MEMBER': return '👤';
            default: return '👤';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">
                            {editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
                        </h2>
                        <p className="text-purple-100 text-sm mt-1">
                            {editingUser ? 'Chỉnh sửa thông tin và phân quyền' : 'Thêm người dùng vào hệ thống'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Warning for editing */}
                    {editingUser && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800">Lưu ý khi cập nhật</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Email không thể thay đổi. Để đổi mật khẩu, vui lòng sử dụng chức năng "Quên mật khẩu".
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <User size={16} className="inline mr-1" />
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Mail size={16} className="inline mr-1" />
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!!editingUser}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="nguyenvana@example.com"
                                required={!editingUser}
                            />
                            {editingUser && (
                                <p className="text-xs text-slate-500 mt-1">🔒 Email không thể thay đổi</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Phone size={16} className="inline mr-1" />
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                placeholder="0901234567"
                            />
                        </div>

                        {/* Password fields - only for create */}
                        {!editingUser && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Lock size={16} className="inline mr-1" />
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        placeholder="Tối thiểu 8 ký tự"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Tối thiểu 8 ký tự, bao gồm chữ và số</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Lock size={16} className="inline mr-1" />
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Role Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Shield size={16} className="inline mr-1" />
                                Vai trò (Role) <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                required
                            >
                                <option value="">-- Chọn vai trò --</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {getRoleIcon(role.roleCode)} {role.roleName} - {role.roleDescription}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Toggle */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-2 focus:ring-purple-500/50"
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                    Tài khoản đang hoạt động
                                </span>
                            </label>
                            <p className="text-xs text-slate-500 mt-2 ml-8">
                                Bỏ tick để vô hiệu hóa tài khoản (người dùng sẽ không thể đăng nhập)
                            </p>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (editingUser ? 'Cập nhật' : 'Tạo tài khoản')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
