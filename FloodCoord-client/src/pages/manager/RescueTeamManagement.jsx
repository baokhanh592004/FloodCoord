import React, { useState, useEffect, useMemo } from 'react';
import { adminTeamApi } from '../../services/adminTeamApi';
import { Shield, Users, UserCheck, AlertCircle } from 'lucide-react';
import TeamDetailModal from '../../components/admin/TeamDetailModal';
import TeamFormModal from '../../components/admin/TeamFormModal';
import StatCard from '../../components/coordinator/StatCard';
import {
    UserGroupIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function RescueTeamManagement() {
    const [teams, setTeams] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
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
        status: 'AVAILABLE',
    });

    useEffect(() => {
        fetchTeams();
        fetchAvailableUsers();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await adminTeamApi.getAllTeams();
            setTeams(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách đội cứu hộ');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const data = await adminTeamApi.getAvailableRescueMembers();
            setAvailableUsers(data);
        } catch (err) {
            console.error('Không thể tải danh sách người dùng:', err);
        }
    };

    // --- Logic Helpers ---
    const stats = useMemo(() => ({
        total: teams.length,
        available: teams.filter(t => t.status === 'AVAILABLE').length,
        inMission: teams.filter(t => t.status === 'IN_MISSION').length,
        totalMembers: teams.reduce((acc, t) => acc + (t.memberCount || t.members?.length || 0), 0),
    }), [teams]);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (submitData) => {
        try {
            const teamData = {
                name: submitData.name,
                description: submitData.description,
                status: submitData.status || 'AVAILABLE',
                leaderId: submitData.leaderId,
                memberIds: submitData.memberIds,
            };
            if (editingTeam) {
                await adminTeamApi.updateTeam(editingTeam.id, teamData);
            } else {
                await adminTeamApi.createTeam(teamData);
            }
            setShowModal(false);
            resetForm();
            fetchTeams();
            fetchAvailableUsers();
        } catch (err) {
            setError(editingTeam ? 'Không thể cập nhật đội' : 'Không thể tạo đội');
            console.error(err);
        }
    };

    const handleEdit = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            status: team.status || 'AVAILABLE',
        });
        setShowModal(true);
    };

    const handleDelete = async (teamId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đội này? Thành viên sẽ không bị xóa, chỉ rời khỏi đội.')) {
            try {
                await adminTeamApi.deleteTeam(teamId);
                fetchTeams();
                fetchAvailableUsers();
            } catch (err) {
                setError('Không thể xóa đội');
                console.error(err);
            }
        }
    };

    const handleViewDetails = async (team) => {
        try {
            const detailData = await adminTeamApi.getTeamById(team.id);
            setSelectedTeam(detailData);
            setShowDetailModal(true);
        } catch (err) {
            setError('Không thể tải chi tiết đội');
            console.error(err);
        }
    };

    const handleRemoveMember = async (teamId, userId) => {
        try {
            await adminTeamApi.removeMember(teamId, userId);
            const detailData = await adminTeamApi.getTeamById(teamId);
            setSelectedTeam(detailData);
            fetchTeams();
            fetchAvailableUsers();
        } catch (err) {
            setError('Không thể loại bỏ thành viên');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', status: 'AVAILABLE' });
        setEditingTeam(null);
    };

    const openCreateModal = () => { resetForm(); setShowModal(true); };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đội cứu hộ</h1>
                    <p className="text-sm text-gray-500">Điều phối nhân lực và đội ngũ phản ứng nhanh.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" /> Tạo đội mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />}  count={stats.total}        label="Tổng số đội"     color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.available}   label="Đội sẵn sàng"   color="green" />
                <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={stats.inMission}   label="Đang nhiệm vụ"  color="yellow" />
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />}  count={stats.totalMembers} label="Tổng thành viên" color="rose" />
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
                    <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
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
                                    <button onClick={() => handleEdit(team)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-colors" title="Chỉnh sửa">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(team.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors" title="Xóa">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mb-3">
                                <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 min-h-8">{team.description || 'Chưa có mô tả cho đội này.'}</p>
                            </div>
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500 flex items-center gap-1.5"><UserCheck size={13} /> Đội trưởng</span>
                                    <span className="font-medium text-gray-700">{team.leaderName || 'Chưa chỉ định'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-1.5"><Users size={13} /> Thành viên</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                                        {team.memberCount || team.members?.length || 0} người
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

            {/* Modals */}
            <TeamFormModal
                showModal={showModal}
                editingTeam={editingTeam}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={() => { setShowModal(false); resetForm(); }}
                availableUsers={availableUsers}
            />
            <TeamDetailModal
                team={selectedTeam}
                onClose={() => { setShowDetailModal(false); setSelectedTeam(null); }}
                onRemoveMember={handleRemoveMember}
            />
        </div>
    );
}
