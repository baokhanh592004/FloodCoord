import React from 'react';

export default function StatCard({ icon, count, label, color = 'blue' }) {
    const colorClasses = {
        red: 'bg-red-50 text-red-600 border-red-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    };

    const iconBgClasses = {
        red: 'bg-red-100',
        blue: 'bg-blue-100',
        yellow: 'bg-yellow-100',
        green: 'bg-green-100',
        cyan: 'bg-cyan-100',
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className={`inline-flex p-3 rounded-lg ${iconBgClasses[color]} mb-3`}>
                        {icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                </div>
            </div>
        </div>
    );
}
