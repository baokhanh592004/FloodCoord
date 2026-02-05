import React from 'react';

export default function ResourceCounter({ icon, label, current, total }) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    const getColorClass = () => {
        if (percentage >= 70) return 'text-green-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="text-gray-600">
                    {icon}
                </div>
                <span className="text-sm text-gray-700 font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getColorClass()}`}>
                    {current}
                </span>
                <span className="text-sm text-gray-500">/ {total}</span>
            </div>
        </div>
    );
}
