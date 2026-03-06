import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminTeamApi } from '../../services/adminTeamApi';
import { Package, Plus, AlertCircle, Users, Shield, Clock, Activity } from 'lucide-react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import TeamCard from '../../components/admin/TeamCard';
import TeamFormModal from '../../components/admin/TeamFormModal';
import TeamDetailModal from '../../components/admin/TeamDetailModal';

export default function RescueTeamManagement() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
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
            const data = await adminTeamApi.getAvailableUsers();
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
            const teamData = {
                name: submitData.name,
                description: submitData.description,
                status: submitData.status || 'AVAILABLE',
                leaderId: submitData.leaderId,
                memberIds: submitData.memberIds
            };

            if (editingTeam) {
                await adminTeamApi.updateTeam(editingTeam.id, teamData);
            } else {
                await adminTeamApi.createTeam(teamData);
            }

            setShowModal(false);
            resetForm();
            fetchTeams();
            fetchAvailableUsers(); // Refresh available users
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
            status: team.status || 'AVAILABLE'
        });
        setShowModal(true);
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
            setShowDetailModal(true);
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
        setShowDetailModal(false);
        setSelectedTeam(null);
    };

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: teams.length,
            available: teams.filter(t => t.status === 'AVAILABLE').length,
            inMission: teams.filter(t => t.status === 'IN_MISSION').length,
            totalMembers: teams.reduce((sum, t) => sum + (t.memberCount || t.members?.length || 0), 0)
        };
    }, [teams]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1e40af] tracking-tight">Quản lý Đội Cứu Hộ</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            Quản lý đội ngũ và thành viên cứu hộ
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={openCreateModal}
                            className="px-5 py-2.5 rounded-xl bg-[#1e40af] text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:scale-105 hover:shadow-blue-900/30 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                            <Plus size={18} /> Tạo đội mới
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Tổng số đội" count={stats.total} icon={Users} color="text-slate-600" />
                    <StatCard label="Đội sẵn sáng" count={stats.available} icon={Shield} color="text-emerald-600" />
                    <StatCard label="Đang nhiệm vụ" count={stats.inMission} icon={Activity} color="text-blue-600" />
                    <StatCard label="Tổng thành viên" count={stats.totalMembers} icon={Users} color="text-purple-600" />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
                    </div>
                ) : teams.length === 0 ? (
                    <EmptyState 
                        onAdd={openCreateModal}
                        icon={Users}
                        title="Chưa có đội cứu hộ nào"
                        description="Hệ thống chưa có đội cứu hộ. Hãy tạo đội đầu tiên để bắt đầu quản lý."
                        buttonText="+ Tạo đội đầu tiên"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>

            {/* Modals */}
            <TeamFormModal
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
