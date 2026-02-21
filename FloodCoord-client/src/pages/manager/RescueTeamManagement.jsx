import React, { useState, useEffect, useMemo } from 'react';
import { teamApi } from '../../services/teamApi';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, UserCheck, Search, Plus, 
  ArrowLeft, Edit, Trash2, AlertCircle, 
  X, Info, LayoutGrid
} from 'lucide-react';

export default function RescueTeamManagement() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
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

    const resetForm = () => {
        setFormData({ name: '', description: '', leaderId: '', memberIds: [] });
        setMemberInput('');
        setEditingTeam(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                
                {/* 1. Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1e40af] tracking-tight">Quản lý Đội cứu hộ</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Điều phối nhân lực và đội ngũ phản ứng nhanh
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Tìm tên đội, đội trưởng..."
                                className="pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => navigate('/manager/dashboard')}
                            className="px-5 py-2.5 rounded-xl bg-white/50 border border-white/60 text-slate-600 hover:bg-white hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                        <button 
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="px-5 py-2.5 rounded-xl bg-[#1e40af] text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center gap-2 font-medium"
                        >
                            <Plus size={18} /> Tạo đội mới
                        </button>
                    </div>
                </div>

                {/* 2. Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard label="Tổng số đội" count={stats.total} icon={LayoutGrid} color="text-blue-600" />
                    <StatCard label="Tổng nhân lực" count={stats.totalMembers} icon={Users} color="text-teal-600" />
                    <StatCard label="Đội trưởng" count={stats.total} icon={UserCheck} color="text-orange-500" />
                </div>

                {/* 3. Main Content */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <EmptyState onAdd={() => setShowModal(true)} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map(team => (
                            <div 
                                key={team.id} 
                                className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-600">
                                        <Shield size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(team)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#1e40af] transition-colors">{team.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{team.description || 'Chưa có mô tả cho đội này.'}</p>
                                </div>

                                <div className="space-y-3 mb-6 relative z-10">
                                    <div className="flex justify-between text-sm items-center py-2 border-b border-slate-100/50">
                                        <span className="text-slate-500 flex items-center gap-2"><UserCheck size={14}/> Đội trưởng</span>
                                        <span className="font-semibold text-slate-700">{team.leaderName || 'Chưa chỉ định'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500 flex items-center gap-2"><Users size={14}/> Thành viên</span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold">
                                            {team.members?.length || 0} người
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ID: TEAM-{team.id}</span>
                                    <button className="text-xs font-bold text-blue-600 hover:underline">Chi tiết hồ sơ</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Modal Design */}
            {showModal && (
                <div className="fixed inset-0 bg-[#1e40af]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="bg-[#1e40af] p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingTeam ? 'Cập nhật thông tin đội' : 'Thiết lập đội cứu hộ mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên đội cứu hộ</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="VD: Đội Phản Ứng Nhanh Số 1" required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả nhiệm vụ</label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none min-h-[100px]"
                                    placeholder="Mô tả phạm vi hoạt động..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">ID Đội trưởng</label>
                                    <input
                                        type="number" name="leaderId" value={formData.leaderId} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        placeholder="Nhập ID"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center gap-2 text-xs">
                                        <Info size={16}/> Xác thực ID trong hệ thống
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">Hủy bỏ</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#1e40af] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 hover:bg-blue-800 transition transform hover:-translate-y-0.5">
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

// Sub-components (Đồng nhất với VehicleManager)
function StatCard({ label, count, icon: Icon, color }) {
    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{count < 10 ? `0${count}` : count}</p>
            </div>
            <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-300">
                <Shield size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có đội cứu hộ</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Thiết lập các đội phản ứng nhanh để bắt đầu công tác cứu trợ vùng thiên tai.</p>
            <button onClick={onAdd} className="px-6 py-3 bg-[#1e40af] text-white rounded-xl shadow-lg hover:scale-105 transition font-semibold">
                + Thiết lập đội đầu tiên
            </button>
        </div>
    );
}