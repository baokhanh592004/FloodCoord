import React from 'react';
import { X, User, Mail, Phone, Shield, CheckCircle, XCircle, UserCog } from 'lucide-react';

export default function UserDetailModal({ user, onClose }) {
    if (!user) return null;

    const getRoleBadge = (roleName) => {
        const roleConfig = {
            'Quản Trị Viên': { color: 'bg-purple-100 text-purple-700', icon: Shield },
            'Quản Lý': { color: 'bg-blue-100 text-blue-700', icon: UserCog },
            'Điều Phối Viên': { color: 'bg-orange-100 text-orange-700', icon: UserCog },
            'Đội Cứu Hộ': { color: 'bg-green-100 text-green-700', icon: User },
            'Thành Viên': { color: 'bg-slate-100 text-slate-700', icon: User }
        };
        const config = roleConfig[roleName] || { color: 'bg-gray-100 text-gray-700', icon: User };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${config.color}`}>
                <Icon size={16} />
                {roleName}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Chi tiết tài khoản</h2>
                        <p className="text-purple-100 text-sm mt-1">Thông tin đầy đủ người dùng</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-6 pb-6 border-b">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{user.fullName}</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                                {getRoleBadge(user.roleName)}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                    user.status 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {user.status ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {user.status ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            Thông tin liên hệ
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Mail size={20} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="font-medium text-slate-800">{user.email}</p>
                                </div>
                            </div>
                            {user.phoneNumber && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Phone size={20} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Số điện thoại</p>
                                        <p className="font-medium text-slate-800">{user.phoneNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Information */}
                    {user.teamId && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                Thông tin đội nhóm
                            </h4>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-600 mb-1">Đội cứu hộ</p>
                                        <p className="font-semibold text-blue-900">{user.teamName}</p>
                                    </div>
                                    {user.isTeamLeader && (
                                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                                            ĐỘI TRƯỞNG
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
