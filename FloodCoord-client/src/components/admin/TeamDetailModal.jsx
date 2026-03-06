import React from 'react';
import { X, Shield, Users, UserMinus, Mail, Phone } from 'lucide-react';

export default function TeamDetailModal({ team, onClose, onRemoveMember, readonly = false }) {
    if (!team) return null;

    const handleRemoveMember = (userId, userName) => {
        if (window.confirm(`Bạn có chắc chắn muốn loại bỏ ${userName} khỏi đội?`)) {
            onRemoveMember(team.id, userId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold">{team.name}</h2>
                        <p className="text-blue-100 text-sm mt-1">Chi tiết đội cứu hộ</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Team Info */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            Thông tin đội
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Tên đội</p>
                                <p className="font-semibold text-slate-800">{team.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                                    {team.status}
                                </span>
                            </div>
                            {team.description && (
                                <div className="col-span-2">
                                    <p className="text-sm text-slate-500 mb-1">Mô tả</p>
                                    <p className="text-slate-700">{team.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Leader */}
                    {team.leader && (
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-orange-600" />
                                Đội trưởng
                            </h3>
                            <div className="flex items-center gap-4 bg-white rounded-xl p-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {team.leader.fullName?.charAt(0) || team.leader.email?.charAt(0) || 'L'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800">
                                        {team.leader.fullName || 'Chưa có tên'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} />
                                            {team.leader.email}
                                        </span>
                                        {team.leader.phoneNumber && (
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {team.leader.phoneNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                    LEADER
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Team Members */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            Danh sách thành viên ({team.members?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {(!team.members || team.members.length === 0) ? (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500">Đội chưa có thành viên</p>
                                </div>
                            ) : (
                                team.members.map(member => (
                                    <div 
                                        key={member.id}
                                        className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition border border-slate-200"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {member.fullName?.charAt(0) || member.email?.charAt(0) || 'M'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">
                                                {member.fullName || 'Chưa có tên'}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {member.email}
                                                </span>
                                                {member.phoneNumber && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {member.phoneNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {member.isTeamLeader && (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                LEADER
                                            </span>
                                        )}
                                        {!member.isTeamLeader && !readonly && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.fullName || member.email)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Loại bỏ thành viên"
                                            >
                                                <UserMinus size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
