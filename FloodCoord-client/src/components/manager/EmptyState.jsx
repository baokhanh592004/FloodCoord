import React from 'react';
import { Package } from 'lucide-react';

export default function EmptyState({ onAdd, title, description, buttonText, icon: Icon = Package }) {
    return (
        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
            <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Icon size={40} className="text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
                {title || 'Chưa có vật tư nào'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {description || 'Hệ thống chưa ghi nhận vật tư cứu trợ nào. Hãy thêm vật tư để bắt đầu quản lý kho.'}
            </p>
            <button
                onClick={onAdd}
                className="px-6 py-3 bg-[#f97316] text-white rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition font-semibold"
            >
                {buttonText || '+ Thêm vật tư đầu tiên'}
            </button>
        </div>
    );
}
