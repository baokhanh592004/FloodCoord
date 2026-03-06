import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Quản lý Đội Cứu Hộ',
      description: 'Quản lý đội ngũ và thành viên cứu hộ',
      icon: Users,
      path: '/admin/rescue-teams',
    },
    {
      title: 'Quản lý Người Dùng',
      description: 'Quản lý tài khoản và phân quyền hệ thống',
      icon: UserCog,
      path: '/admin/users',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Tổng quan hệ thống
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Quản lý và giám sát toàn bộ hệ thống cứu hộ
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <item.icon size={24} className="text-blue-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {item.title}
            </h3>

            <p className="text-sm text-slate-600">
              {item.description}
            </p>

            <div className="mt-4 text-sm font-medium text-blue-600">
              Truy cập →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}