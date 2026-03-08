import React, { useState, useEffect, useMemo } from 'react';
import { teamApi } from '../../services/teamApi';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserCheck, Plus, Edit, Trash2, AlertCircle, X, Info } from 'lucide-react';
import TeamDetailModal from '../../components/admin/TeamDetailModal';
import StatCard from '../../components/coordinator/StatCard';
import {
    UserGroupIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function RescueTeamManagement() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        leaderId: '',
        memberIds: []
    });
    const [memberInput, setMemberInput] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await teamApi.getAllTeams();
            setTeams(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách đội cứu hộ');
            // Mock data cho giao diện khi lỗi API
            setTeams([
                { id: 1, name: 'Đội Phản Ứng Nhanh Alpha', description: 'Chuyên cứu hộ đường thủy', leaderName: 'Nguyễn Văn A', members: [{},{},{}] },
                { id: 2, name: 'Đội Y Tế Cơ Động', description: 'Sơ cứu và vận chuyển thương vong', leaderName: 'Trần Thị B', members: [{},{}] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // --- Logic Helpers ---
    const stats = useMemo(() => ({
        total: teams.length,
        totalMembers: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0),
        activeTeams: teams.length // Có thể thêm logic status nếu API hỗ trợ
    }), [teams]);

    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMember = () => {
        const memberId = parseInt(memberInput.trim());
        if (memberId && !formData.memberIds.includes(memberId)) {
            setFormData(prev => ({ ...prev, memberIds: [...prev.memberIds, memberId] }));
            setMemberInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowModal(false);
        resetForm();
    };

    const handleEdit = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            leaderId: team.leaderId?.toString() || '',
            memberIds: team.members?.map(m => m.id) || []
        });
        setShowModal(true);
    };

    const handleViewDetails = async (team) => {
        try {
            const detailData = await teamApi.getTeamById(team.id);
            setSelectedTeam(detailData);
            setShowDetailModal(true);
        } catch (err) {
            setError('Không thể tải chi tiết đội');
            console.error(err);
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTeam(null);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', leaderId: '', memberIds: [] });
        setMemberInput('');
        setEditingTeam(null);
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đội cứu hộ</h1>
                    <p className="text-sm text-gray-500">Điều phối nhân lực và đội ngũ phản ứng nhanh.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> Tạo đội mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.total} label="Tổng số đội" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.totalMembers} label="Tổng nhân lực" color="green" />
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.total} label="Đội trưởng" color="yellow" />
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm tên đội, đội trưởng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                    <Shield size={40} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có đội cứu hộ nào</h3>
                    <p className="text-sm text-gray-500 mb-4">Hãy thiết lập các đội phản ứng nhanh để bắt đầu công tác cứu trợ.</p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        + Tạo đội đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map(team => (
                        <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
                                    <Shield size={24} strokeWidth={1.5} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(team)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 min-h-8">{team.description || 'Chưa có mô tả cho đội này.'}</p>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500 flex items-center gap-1.5"><UserCheck size={13}/> Đội trưởng</span>
                                    <span className="font-medium text-gray-700">{team.leaderName || 'Chưa chỉ định'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-1.5"><Users size={13}/> Thành viên</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                                        {team.members?.length || 0} người
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-400">TEAM-{team.id}</span>
                                <button
                                    onClick={() => handleViewDetails(team)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Chi tiết →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <TeamDetailModal
                team={selectedTeam}
                onClose={handleCloseDetailModal}
                readonly={true}
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingTeam ? 'Cập nhật thông tin đội' : 'Tạo đội cứu hộ mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đội cứu hộ</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                                    placeholder="VD: Đội Phản Ứng Nhanh Số 1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả nhiệm vụ</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-h-20 resize-none"
                                    placeholder="Mô tả phạm vi hoạt động..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Đội trưởng</label>
                                    <input type="number" name="leaderId" value={formData.leaderId} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        placeholder="Nhập ID" />
                                </div>
                                <div className="flex items-end">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1.5 text-xs w-full">
                                        <Info size={14}/> Xác nhận ID trong hệ thống
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    {editingTeam ? 'Lưu thay đổi' : 'Kích hoạt đội'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}