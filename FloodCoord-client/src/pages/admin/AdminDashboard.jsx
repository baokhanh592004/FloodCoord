import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../services/adminUserApi';
import { adminTeamApi } from '../../services/adminTeamApi';
import StatCard from '../../components/coordinator/StatCard';
import {
  UsersIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t] = await Promise.allSettled([
        adminUserApi.getAllUsers(),
        adminTeamApi.getAllTeams(),
      ]);
      setUsers(u.status === 'fulfilled' ? (u.value || []) : []);
      setTeams(t.status === 'fulfilled' ? (t.value || []) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const userStats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status).length,
    inactive: users.filter(u => !u.status).length,
  }), [users]);

  const teamStats = useMemo(() => ({
    total: teams.length,
    available: teams.filter(t => t.status === 'AVAILABLE').length,
    inMission: teams.filter(t => t.status === 'IN_MISSION').length,
    totalMembers: teams.reduce((sum, t) => sum + (t.memberCount || t.members?.length || 0), 0),
  }), [teams]);

  // Role distribution chart data
  const roleChartData = useMemo(() => {
    const roleCount = {};
    users.forEach(u => { roleCount[u.roleName] = (roleCount[u.roleName] || 0) + 1; });
    return Object.entries(roleCount).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Team status chart data
  const teamPieData = useMemo(() => [
    { name: 'Sẵn sàng', value: teamStats.available, color: '#10b981' },
    { name: 'Đang nhiệm vụ', value: teamStats.inMission, color: '#3b82f6' },
  ].filter(d => d.value > 0), [teamStats]);

  const ROLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500">Thống kê tình hình người dùng và đội cứu hộ trong hệ thống.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <UsersIcon className="h-4 w-4" /> Người dùng
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<UsersIcon className="h-6 w-6" />} count={userStats.total} label="Tổng người dùng" color="blue" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={userStats.active} label="Đang hoạt động" color="green" />
          <StatCard icon={<XCircleIcon className="h-6 w-6" />} count={userStats.inactive} label="Vô hiệu hóa" color="red" />
        </div>
      </div>

      {/* Team Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <UserGroupIcon className="h-4 w-4" /> Đội cứu hộ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={teamStats.total} label="Tổng số đội" color="blue" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={teamStats.available} label="Sẵn sàng" color="green" />
          <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={teamStats.inMission} label="Đang nhiệm vụ" color="yellow" />
          <StatCard icon={<UsersIcon className="h-6 w-6" />} count={teamStats.totalMembers} label="Tổng thành viên" color="rose" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Phân bổ vai trò</h2>
            <p className="text-xs text-gray-500">Số người dùng theo từng vai trò</p>
          </div>
          <div className="h-64">
            {roleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Số người" radius={[4, 4, 0, 0]}>
                    {roleChartData.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Team status pie */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái đội cứu hộ</h2>
            <p className="text-xs text-gray-500">Phân bổ theo trạng thái hiện tại</p>
          </div>
          <div className="h-64">
            {teamPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={teamPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {teamPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
            title="Quản lý Đội Cứu Hộ"
            description="Quản lý đội ngũ và thành viên cứu hộ"
            badge={`${teamStats.total} đội`}
            onClick={() => navigate('/admin/rescue-teams')}
          />
          <ActionCard
            icon={<UsersIcon className="h-6 w-6 text-indigo-600" />}
            title="Quản lý Người Dùng"
            description="Quản lý tài khoản và phân quyền hệ thống"
            badge={`${userStats.total} người`}
            onClick={() => navigate('/admin/users')}
          />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
    >
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{title}</h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">{badge}</span>
          )}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
    </div>
  );
}