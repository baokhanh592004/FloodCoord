import React, { useState, useEffect, useMemo } from 'react';
import { adminTeamApi } from '../../services/adminTeamApi';
import { Plus, AlertCircle, Users, Activity } from 'lucide-react';
import StatCard from '../../components/coordinator/StatCard';
import TeamCard from '../../components/admin/TeamCard';
import TeamFormModal from '../../components/admin/TeamFormModal';
import TeamDetailModal from '../../components/admin/TeamDetailModal';
import {
    UserGroupIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function RescueTeamManagement() {
    const [teams, setTeams] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'AVAILABLE'
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (submitData) => {
        try {
            const updateTeamId = submitData.teamId || editingTeam?.id;
            const teamData = {
                name: submitData.name,
                description: submitData.description,
                status: submitData.status || 'AVAILABLE',
                leaderId: submitData.leaderId,
                memberIds: submitData.memberIds
            };

            if (updateTeamId) {
                await adminTeamApi.updateTeam(updateTeamId, teamData);
            } else {
                await adminTeamApi.createTeam(teamData);
            }

            setShowModal(false);
            resetForm();
            fetchTeams();
            fetchAvailableUsers(); // Refresh available users
        } catch (err) {
            setError((submitData.teamId || editingTeam?.id) ? 'Không thể cập nhật đội' : 'Không thể tạo đội');
            console.error(err);
        }
    };

    const handleEdit = async (team) => {
        try {
            const detailData = await adminTeamApi.getTeamById(team.id);
            setEditingTeam(detailData);
            setFormData({
                name: detailData.name || '',
                description: detailData.description || '',
                status: detailData.status || 'AVAILABLE'
            });
            setShowModal(true);
        } catch (err) {
            setError('Không thể tải dữ liệu đội để cập nhật');
            console.error(err);
        }
    };

    const handleDelete = async (teamId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đội này? Thành viên sẽ không bị xóa, chỉ rời khỏi đội.')) {
            try {
                await adminTeamApi.deleteTeam(teamId);
                fetchTeams();
                fetchAvailableUsers(); // Refresh available users
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
        } catch (err) {
            setError('Không thể tải chi tiết đội');
            console.error(err);
        }
    };

    const handleRemoveMember = async (teamId, userId) => {
        try {
            await adminTeamApi.removeMember(teamId, userId);
            // Refresh team details
            const detailData = await adminTeamApi.getTeamById(teamId);
            setSelectedTeam(detailData);
            fetchTeams();
            fetchAvailableUsers(); // Refresh available users
        } catch (err) {
            setError('Không thể loại bỏ thành viên');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'AVAILABLE'
        });
        setEditingTeam(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleCloseDetailModal = () => {
        setSelectedTeam(null);
    };

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: teams.length,
            available: teams.filter(t => t.status === 'AVAILABLE').length,
            inMission: teams.filter(t => t.status === 'BUSY').length,
            totalMembers: teams.reduce((sum, t) => sum + (t.memberCount || t.members?.length || 0), 0)
        };
    }, [teams]);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đội Cứu Hộ</h1>
                    <p className="text-sm text-gray-500">Quản lý đội ngũ và thành viên cứu hộ.</p>
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
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.total} label="Tổng số đội" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.available} label="Đội sẵn sàng" color="green" />
                <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={stats.inMission} label="Đang nhiệm vụ" color="yellow" />
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.totalMembers} label="Tổng thành viên" color="rose" />
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
            ) : teams.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                    <UserGroupIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có đội cứu hộ nào</h3>
                    <p className="text-sm text-gray-500 mb-4">Hãy tạo đội đầu tiên để bắt đầu quản lý.</p>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        + Tạo đội đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map(team => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <TeamFormModal
                key={`${editingTeam?.id || 'create'}-${showModal ? 'open' : 'closed'}`}
                showModal={showModal}
                editingTeam={editingTeam}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
                availableUsers={availableUsers}
            />
            <TeamDetailModal
                team={selectedTeam}
                onClose={handleCloseDetailModal}
                onRemoveMember={handleRemoveMember}
            />
        </div>
    );
}
