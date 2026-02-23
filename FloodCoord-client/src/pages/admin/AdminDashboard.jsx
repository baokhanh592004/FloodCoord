import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, Settings, BarChart3, Shield, Activity, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Quản lý Đội Cứu Hộ',
            description: 'Quản lý đội ngũ và thành viên cứu hộ',
            icon: Users,
            color: 'blue',
            path: '/admin/rescue-teams',
            gradient: 'from-blue-500 to-blue-600'
        }
       
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 mt-1">Quản lý và giám sát toàn bộ hệ thống cứu hộ</p>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => item.path && navigate(item.path)}
                            className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden hover:scale-[1.02]"
                        >
                            {/* Decorative gradient blob */}
                            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`} />
                            
                            <div className="relative z-10">
                                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={28} className="text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {item.description}
                                </p>
                                {item.path && (
                                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                                        Truy cập →
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

               
            </div>
        </div>
    );
}
