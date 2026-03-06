import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';

export default function TeamFormModal({ 
    showModal, 
    editingTeam, 
    formData, 
    onInputChange, 
    onSubmit, 
    onClose,
    availableUsers = []
}) {
    const [selectedLeaderId, setSelectedLeaderId] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);

    useEffect(() => {
        if (editingTeam) {
            setSelectedLeaderId(editingTeam.leader?.id || '');
            setSelectedMemberIds(editingTeam.members?.map(m => m.id) || []);
        } else {
            setSelectedLeaderId('');
            setSelectedMemberIds([]);
        }
    }, [editingTeam]);

    const handleMemberToggle = (userId) => {
        setSelectedMemberIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            leaderId: selectedLeaderId || null,
            memberIds: selectedMemberIds
        };
        onSubmit(submitData);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-[#1e40af]/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="bg-[#1e40af] p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-bold">
                        {editingTeam ? 'Cập nhật đội cứu hộ' : 'Tạo đội cứu hộ mới'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition"
                        type="button"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                    {/* Team Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tên đội *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="VD: Đội Cứu Hộ Alpha"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Mô tả về đội cứu hộ..."
                            rows="3"
                        />
                    </div>

                    {/* Team Leader Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Shield size={16} className="text-orange-500" />
                            Đội trưởng
                        </label>
                        <select
                            value={selectedLeaderId}
                            onChange={(e) => setSelectedLeaderId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="">-- Chọn đội trưởng --</option>
                            {availableUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName || user.email} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <UserPlus size={16} className="text-blue-500" />
                            Thành viên đội ({selectedMemberIds.length} người)
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                            {availableUsers.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">
                                    Không có người dùng khả dụng
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {availableUsers.map(user => (
                                        <label 
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition border border-slate-100"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMemberIds.includes(user.id)}
                                                onChange={() => handleMemberToggle(user.id)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">
                                                    {user.fullName || 'Chưa có tên'}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                            {selectedLeaderId === user.id.toString() && (
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                                                    Đội trưởng
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            * Chọn các thành viên cho đội cứu hộ
                        </p>
                    </div>

                    {/* Status (for editing) */}
                    {editingTeam && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="AVAILABLE">Sẵn sàng</option>
                                <option value="IN_MISSION">Đang nhiệm vụ</option>
                                <option value="RESTING">Nghỉ ngơi</option>
                                <option value="INACTIVE">Không hoạt động</option>
                            </select>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-[#1e40af] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 hover:bg-blue-800 transition transform hover:-translate-y-0.5"
                        >
                            {editingTeam ? 'Lưu thay đổi' : 'Tạo đội mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
