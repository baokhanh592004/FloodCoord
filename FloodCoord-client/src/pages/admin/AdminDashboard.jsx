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
  TruckIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Admin color palette ──────────────────────────────────────────────────────
const C = {
  primary: '#1c1c18',   // charcoal — admin identity
  primaryHover: '#3a3a32',
  primarySoft: '#f5f4ef',
  accent: '#e85d26',   // orange — universal emergency/CTA
  accentHover: '#d14e1a',
  success: '#16a34a',
  border: '#e2e8f0',
  borderSoft: '#f4f6fa',
  textMain: '#0d2240',
  textMuted: '#64748b',
  textFaint: '#9ab8d4',
}

// Chart colors mapped to the color system
const ROLE_COLORS = [C.primary, C.accent, C.success, '#312070', '#2563eb'];

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase();
}

function isAvailableStatus(status) {
  return normalizeStatus(status) === 'AVAILABLE';
}

function isInMissionStatus(status) {
  return ['IN_MISSION', 'BUSY', 'MOVING', 'ARRIVED', 'RESCUING', 'ASSIGNED']
    .includes(normalizeStatus(status));
}

function isRestingStatus(status) {
  return ['RESTING', 'OFF_DUTY', 'INACTIVE'].includes(normalizeStatus(status));
}

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
    available: teams.filter(t => isAvailableStatus(t.status)).length,
    inMission: teams.filter(t => isInMissionStatus(t.status)).length,
    resting: teams.filter(t => isRestingStatus(t.status)).length,
    totalMembers: teams.reduce((s, t) => s + (t.memberCount || t.members?.length || 0), 0),
  }), [teams]);

  // Role distribution chart data
  const roleChartData = useMemo(() => {
    const roleCount = {};
    users.forEach(u => { roleCount[u.roleName] = (roleCount[u.roleName] || 0) + 1; });
    return Object.entries(roleCount).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Team status chart data
  const teamPieData = useMemo(() => [
    { name: 'Sẵn sàng', value: teamStats.available, color: C.success },
    { name: 'Đang nhiệm vụ', value: teamStats.inMission, color: C.primary },
    { name: 'Nghỉ ngơi', value: teamStats.resting, color: C.textMuted },
  ].filter(d => d.value > 0), [teamStats]);

  // ── Shared button style ────────────────────────────────────────────────────
  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', background: C.primary, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'background .18s',
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: C.textMain }}>Tổng quan</h1>
          <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
            Thống kê tình hình người dùng và đội cứu hộ trong hệ thống.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{ ...btnPrimary, opacity: loading ? .55 : 1 }}
          onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = C.primary}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: C.textMuted }}>
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
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: C.textMuted }}>
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
        <div className="bg-white border rounded-lg p-5" style={{ borderColor: C.border }}>
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: C.textMain }}>Phân bổ vai trò</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Số người dùng theo từng vai trò</p>
          </div>
          <div className="h-64">
            {roleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.textMuted }} />
                  <Tooltip
                    contentStyle={{ border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: C.primarySoft }}
                  />
                  <Bar dataKey="value" name="Số người" radius={[4, 4, 0, 0]}>
                    {roleChartData.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: C.textFaint }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Team status pie */}
        <div className="bg-white border rounded-lg p-5" style={{ borderColor: C.border }}>
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: C.textMain }}>Trạng thái đội cứu hộ</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Phân bổ theo trạng thái hiện tại</p>
          </div>
          <div className="h-64">
            {teamPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={teamPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {teamPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: C.textFaint }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border rounded-lg p-5" style={{ borderColor: C.border }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textMain }}>Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6" style={{ color: C.primary }} />}
            title="Quản lý Đội Cứu Hộ"
            description="Quản lý đội ngũ và thành viên cứu hộ"
            badge={`${teamStats.total} đội`}
            onClick={() => navigate('/admin/rescue-teams')}
          />
          <ActionCard
            icon={<UsersIcon className="h-6 w-6" style={{ color: C.primary }} />}
            title="Quản lý Người Dùng"
            description="Quản lý tài khoản và phân quyền hệ thống"
            badge={`${userStats.total} người`}
            onClick={() => navigate('/admin/users')}
          />
          <ActionCard
            icon={<TruckIcon className="h-6 w-6" style={{ color: C.primary }} />}
            title="Quản lý Phương tiện"
            description="Xem và điều phối phương tiện cứu hộ"
            onClick={() => navigate('/admin/vehicles')}
          />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, badge, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? '#c8d8ec' : '#e2e8f0'}`,
        background: hovered ? '#f5f4ef' : '#fff',
      }}
    >
      <div className="p-2 rounded-lg shrink-0 transition-colors"
        style={{ background: hovered ? '#e8e6de' : '#f4f6fa' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm transition-colors"
            style={{ color: hovered ? '#1c1c18' : '#374151' }}>
            {title}
          </h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#f5f4ef', color: '#1c1c18' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: '#64748b' }}>{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 shrink-0 mt-1 transition-colors"
        style={{ color: hovered ? '#1c1c18' : '#c8d8ec' }} />
    </div>
  );
}