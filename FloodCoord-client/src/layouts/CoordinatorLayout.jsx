import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    UserGroupIcon,
    MapIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Dashboard', href: '/coordinator/dashboard', icon: HomeIcon },
    { name: 'Request Queue', href: '/coordinator/requests', icon: ClipboardDocumentListIcon },
    { name: 'Assign Teams', href: '/coordinator/assign-teams', icon: UserGroupIcon },
    { name: 'Operations', href: '/coordinator/operations', icon: MapIcon },
];

export default function CoordinatorLayout() {
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="px-6 py-5 border-b border-slate-800">
                    <Link to="/coordinator/dashboard" className="text-lg font-semibold">
                        FloodRescue
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">Coordinator Panel</p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="px-4 py-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
