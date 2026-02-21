import React from 'react';

export default function StatCard({ label, count, icon: Icon, color }) {
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
