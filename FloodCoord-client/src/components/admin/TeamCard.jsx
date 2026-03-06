import React from 'react';
import { Users, Edit, Trash2, Shield, UserCheck } from 'lucide-react';

export default function TeamCard({ team, onEdit, onDelete, onViewDetails }) {
    const getStatusColor = (status) => {
        const colors = {
            AVAILABLE: 'bg-emerald-100 text-emerald-700',
            IN_MISSION: 'bg-blue-100 text-blue-700',
            RESTING: 'bg-orange-100 text-orange-700',
            INACTIVE: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        const labels = {
            AVAILABLE: 'Sẵn sàng',
            IN_MISSION: 'Đang nhiệm vụ',
            RESTING: 'Nghỉ ngơi',
            INACTIVE: 'Không hoạt động'
        };
        return labels[status] || status;
    };

    const getStatusBadge = () => {
        const color = getStatusColor(team.status);
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${color}`}>
                <span className={`w-2 h-2 rounded-full ${team.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                {getStatusLabel(team.status)}
            </span>
        );
    };

    return (
        <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient blob inside card */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Users size={32} strokeWidth={1.5} className="text-blue-600" />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onEdit(team)} 
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Edit size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(team.id)} 
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Xóa đội"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <h3 
                    className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#1e40af] transition-colors cursor-pointer"
                    onClick={() => onViewDetails(team)}
                >
                    {team.name}
                </h3>
                <p className="text-sm text-slate-500">Đội cứu hộ #{team.id}</p>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
                {team.leader && (
                    <div className="flex items-center gap-2 py-2 border-b border-slate-100/50">
                        <Shield size={16} className="text-orange-500" />
                        <span className="text-sm text-slate-500">Đội trưởng:</span>
                        <span className="font-semibold text-slate-700 ml-auto">
                            {team.leader.fullName || team.leader.email}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-2 py-2 border-b border-slate-100/50">
                    <UserCheck size={16} className="text-blue-500" />
                    <span className="text-sm text-slate-500">Thành viên:</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded ml-auto">
                        {team.memberCount || team.members?.length || 0} người
                    </span>
                </div>

                {team.description && (
                    <div className="text-sm py-2">
                        <span className="text-slate-500 block mb-1">Mô tả:</span>
                        <span className="text-slate-700">{team.description}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto relative z-10">
                {getStatusBadge()}
                <button
                    onClick={() => onViewDetails(team)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                    Xem chi tiết →
                </button>
            </div>
        </div>
    );
}
