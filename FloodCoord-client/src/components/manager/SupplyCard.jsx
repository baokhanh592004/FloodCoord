import React from 'react';
import { Edit, Trash2, Apple, Pill, Wrench, Box, Package } from 'lucide-react';

export default function SupplyCard({ supply, onEdit, onDelete }) {
    const getTypeIconComponent = (type) => {
        const iconProps = { size: 32, strokeWidth: 1.5 };
        switch(type) {
            case 'FOOD_WATER': return <Apple {...iconProps} className="text-green-600" />;
            case 'MEDICAL': return <Pill {...iconProps} className="text-red-600" />;
            case 'EQUIPMENT': return <Wrench {...iconProps} className="text-blue-600" />;
            case 'OTHER': return <Box {...iconProps} className="text-gray-600" />;
            default: return <Package {...iconProps} />;
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            FOOD_WATER: 'bg-green-100 text-green-800',
            MEDICAL: 'bg-red-100 text-red-800',
            EQUIPMENT: 'bg-blue-100 text-blue-800',
            OTHER: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        const types = {
            FOOD_WATER: 'Đồ ăn, nước uống',
            MEDICAL: 'Thuốc men, y tế',
            EQUIPMENT: 'Thiết bị cứu hộ',
            OTHER: 'Khác'
        };
        return types[type] || type;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const getStatusBadge = () => {
        if (isExpired(supply.expiryDate)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-red-100 text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Đã hết hạn
                </span>
            );
        }
        if (isExpiringSoon(supply.expiryDate)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-yellow-100 text-yellow-700">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Sắp hết hạn
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-100 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Còn hạn
            </span>
        );
    };

    return (
        <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient blob inside card */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    {getTypeIconComponent(supply.type)}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onEdit(supply)} 
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(supply.id)} 
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#059669] transition-colors">
                    {supply.name}
                </h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(supply.type)}`}>
                    {getTypeLabel(supply.type)}
                </span>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
                <div className="flex justify-between text-sm items-center py-2 border-b border-slate-100/50">
                    <span className="text-slate-500">Số lượng</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {supply.quantity} {supply.unit}
                    </span>
                </div>
                
                {supply.description && (
                    <div className="text-sm py-2 border-b border-slate-100/50">
                        <span className="text-slate-500 block mb-1">Ghi chú</span>
                        <span className="text-slate-700">{supply.description}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Nhập kho</span>
                    <span className="font-semibold text-slate-700 text-xs">
                        {formatDate(supply.importedDate)}
                    </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Hạn dùng</span>
                    <span className={`font-semibold text-xs ${
                        isExpired(supply.expiryDate) ? 'text-red-600' :
                        isExpiringSoon(supply.expiryDate) ? 'text-yellow-600' :
                        'text-slate-700'
                    }`}>
                        {formatDate(supply.expiryDate)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto relative z-10">
                {getStatusBadge()}
                <span className="text-xs text-slate-400">ID: #{supply.id}</span>
            </div>
        </div>
    );
}
