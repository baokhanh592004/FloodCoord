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

    const getRoleIdFromCode = (roleCode) => {
    const role = roles.find(r => r.roleCode === roleCode);
    return role ? role.id : '';
};

    useEffect(() => {
    fetchRoles();
}, []);

    useEffect(() => {
        if (editingUser && roles.length > 0) {
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
        }, [editingUser, roles]);

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
                    roleCode: roles.find(r => r.id === parseInt(formData.roleId))?.roleCode
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
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                <Shield size={16} className="inline mr-1" />
                                Vai trò (Role) <span className="text-red-500">*</span>
                            </label>

                            {/* Current role badge when editing */}
                            {editingUser && (
                                <div className="mb-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
                                    <span className="text-base">{getRoleIcon(roles.find(r => r.id === parseInt(formData.roleId))?.roleCode || '')}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-purple-500 font-medium">Vai trò hiện tại</span>
                                        <p className="text-sm font-bold text-purple-800 leading-tight">
                                            {roles.find(r => r.id === parseInt(formData.roleId))?.roleName || editingUser.roleName || '—'}
                                        </p>
                                    </div>
                                    <span className="text-xs text-purple-400 font-mono bg-purple-100 px-2 py-0.5 rounded-md">
                                        {roles.find(r => r.id === parseInt(formData.roleId))?.roleCode || ''}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {roles.map(role => {
                                    const isSelected = parseInt(formData.roleId) === role.id;
                                    const colorMap = {
                                        'ADMIN':       { border: 'border-yellow-400', bg: 'bg-yellow-50',  ring: 'ring-yellow-400',  text: 'text-yellow-700',  badge: 'bg-yellow-100 text-yellow-700' },
                                        'MANAGER':     { border: 'border-blue-400',   bg: 'bg-blue-50',    ring: 'ring-blue-400',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700' },
                                        'COORDINATOR': { border: 'border-green-400',  bg: 'bg-green-50',   ring: 'ring-green-400',   text: 'text-green-700',   badge: 'bg-green-100 text-green-700' },
                                        'RESCUE_TEAM': { border: 'border-red-400',    bg: 'bg-red-50',     ring: 'ring-red-400',     text: 'text-red-700',     badge: 'bg-red-100 text-red-700' },
                                        'MEMBER':      { border: 'border-slate-400',  bg: 'bg-slate-50',   ring: 'ring-slate-400',   text: 'text-slate-700',   badge: 'bg-slate-100 text-slate-600' },
                                    };
                                    const color = colorMap[role.roleCode] || colorMap['MEMBER'];
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, roleId: role.id }));
                                                setError('');
                                            }}
                                            className={`relative w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                                isSelected
                                                    ? `${color.border} ${color.bg} ring-2 ${color.ring} shadow-sm`
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${color.bg} ${color.border} border`}>
                                                    <svg className={`w-3 h-3 ${color.text}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 pr-6">
                                                <span className="text-2xl">{getRoleIcon(role.roleCode)}</span>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-bold text-sm ${isSelected ? color.text : 'text-slate-700'}`}>
                                                            {role.roleName}
                                                        </span>
                                                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected ? color.badge : 'bg-slate-100 text-slate-500'}`}>
                                                            {role.roleCode}
                                                        </span>
                                                    </div>
                                                    {role.roleDescription && (
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{role.roleDescription}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {!formData.roleId && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Vui lòng chọn một vai trò
                                </p>
                            )}
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
