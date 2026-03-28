import React from 'react';
import { User, Mail, Phone, Shield, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { ROLE_BADGE_BY_NAME, ROLE_BADGE_DEFAULT } from '../shared/styleMaps';

export default function UserCard({ user, onEdit, onDelete, onView }) {
    const roleStyle = ROLE_BADGE_BY_NAME[user.roleName] || ROLE_BADGE_DEFAULT;

    return (
        <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-linear-to-br ${roleStyle.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`} />

            {/* Avatar & Actions */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-14 h-14 bg-linear-to-br ${roleStyle.gradient} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(user)}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        title="Xem chi tiết"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* User Info */}
            <div className="mb-4 relative z-10">
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">
                    {user.fullName}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleStyle.color}`}>
                    <Shield size={12} />
                    {user.roleName}
                </span>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 mb-4 relative z-10">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{user.email}</span>
                </div>
                {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{user.phoneNumber}</span>
                    </div>
                )}
            </div>

            {/* Team Badge (if applicable) */}
            {user.teamId && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-lg relative z-10">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600 font-medium truncate">{user.teamName}</p>
                        {user.isTeamLeader && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">
                                Đội trưởng
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Status & ID */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    user.status 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {user.status ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {user.status ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                
            </div>
        </div>
    );
}
