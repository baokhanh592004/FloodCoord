import React, { useState, useEffect } from 'react';
import { teamApi } from '../../services/teamApi';
import { useNavigate } from 'react-router-dom';

export default function RescueTeamManagement() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddMember = () => {
        const memberId = parseInt(memberInput.trim());
        if (memberId && !formData.memberIds.includes(memberId)) {
            setFormData(prev => ({
                ...prev,
                memberIds: [...prev.memberIds, memberId]
            }));
            setMemberInput('');
        }
    };

    const handleRemoveMember = (memberId) => {
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.filter(id => id !== memberId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const teamData = {
                name: formData.name,
                description: formData.description,
                leaderId: parseInt(formData.leaderId),
                memberIds: formData.memberIds
            };

            if (editingTeam) {
                await teamApi.updateTeam(editingTeam.id, teamData);
            } else {
                await teamApi.createTeam(teamData);
            }

            setShowModal(false);
            resetForm();
            fetchTeams();
        } catch (err) {
            setError(editingTeam ? 'Không thể cập nhật đội cứu hộ' : 'Không thể tạo đội cứu hộ');
            console.error(err);
        }
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

    const handleDelete = async (teamId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đội cứu hộ này?')) {
            try {
                await teamApi.deleteTeam(teamId);
                fetchTeams();
            } catch (err) {
                setError('Không thể xóa đội cứu hộ');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            leaderId: '',
            memberIds: []
        });
        setMemberInput('');
        setEditingTeam(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Hoạt động
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                Không hoạt động
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Đội Cứu hộ</h1>
                            <p className="text-gray-600 mt-1">Quản lý tất cả đội cứu hộ và thành viên</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/manager/dashboard')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                                ← Quay lại
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                + Tạo đội mới
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Teams Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <div key={team.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">🚨</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {team.id}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(team.isActive)}
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-gray-600 text-sm">Mô tả:</p>
                                        <p className="font-semibold">{team.description || 'Không có mô tả'}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 text-sm">Đội trưởng:</p>
                                        <p className="font-semibold">
                                            {team.leaderName || 'Chưa có'} 
                                            {team.leaderId && <span className="text-gray-500 text-sm ml-2">(ID: {team.leaderId})</span>}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 text-sm">Số thành viên:</p>
                                        <p className="font-semibold">{team.members?.length || 0} người</p>
                                        {team.members && team.members.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {team.members.map(member => (
                                                    <span key={member.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {member.fullName || member.email} (ID: {member.id})
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(team)}
                                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(team.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && teams.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">Chưa có đội cứu hộ nào</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Tạo đội đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingTeam ? 'Cập nhật đội cứu hộ' : 'Tạo đội cứu hộ mới'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Tên đội *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: Đội Đặc Nhiệm 01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: Chuyên cứu hộ vùng sâu"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    ID Đội trưởng *
                                </label>
                                <input
                                    type="number"
                                    name="leaderId"
                                    value={formData.leaderId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: 2"
                                    min="1"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Nhập User ID của người làm đội trưởng</p>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Thêm thành viên
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={memberInput}
                                        onChange={(e) => setMemberInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập User ID"
                                        min="1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Thêm
                                    </button>
                                </div>
                                
                                {formData.memberIds.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">Danh sách thành viên ({formData.memberIds.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.memberIds.map(id => (
                                                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    ID: {id}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(id)}
                                                        className="text-red-600 hover:text-red-800 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    {editingTeam ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
