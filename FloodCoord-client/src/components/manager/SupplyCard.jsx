import React from 'react';
import { Edit, Trash2, Apple, Pill, Wrench, Box, Package, Calendar, AlertTriangle, CheckCircle, TruckIcon } from 'lucide-react';

export default function SupplyCard({ supply, onEdit, onDelete }) {
    const getTypeIconComponent = (type) => {
        const iconProps = { size: 22, strokeWidth: 1.5 };
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
        <div className="group bg-white border border-slate-100 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {getTypeIconComponent(supply.type)}
            </div>

            {/* Name + type + description */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#059669] transition-colors truncate">
                        {supply.name}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${getTypeColor(supply.type)}`}>
                        {getTypeLabel(supply.type)}
                    </span>
                    {supply.exportedDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex-shrink-0">
                            <TruckIcon size={11} /> Đã xuất kho
                        </span>
                    )}
                </div>
                {supply.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate italic">{supply.description}</p>
                )}
            </div>

            {/* Quantity */}
            <div className="flex-shrink-0 text-center hidden sm:block w-24">
                <p className="text-xs text-slate-400 mb-0.5">Số lượng</p>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {supply.quantity} {supply.unit}
                </span>
            </div>

            {/* Imported date */}
            <div className="flex-shrink-0 text-center hidden md:block w-32">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                    <Calendar size={11} className="text-blue-400" /> Nhập kho
                </p>
                <span className="text-xs font-medium text-slate-600">{formatDate(supply.importedDate)}</span>
            </div>

            {/* Expiry date */}
            <div className="flex-shrink-0 text-center hidden md:block w-32">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                    {isExpired(supply.expiryDate) ? (
                        <AlertTriangle size={11} className="text-red-400" />
                    ) : isExpiringSoon(supply.expiryDate) ? (
                        <AlertTriangle size={11} className="text-yellow-400" />
                    ) : (
                        <CheckCircle size={11} className="text-green-400" />
                    )}
                    Hạn dùng
                </p>
                <span className={`text-xs font-medium ${
                    isExpired(supply.expiryDate) ? 'text-red-600' :
                    isExpiringSoon(supply.expiryDate) ? 'text-yellow-600' :
                    'text-slate-600'
                }`}>
                    {formatDate(supply.expiryDate)}
                </span>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0 hidden lg:block">
                {getStatusBadge()}
            </div>

            {/* ID */}
            <div className="flex-shrink-0 hidden lg:block">
                <span className="text-xs text-slate-400 font-mono">Lô #{supply.id}</span>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1">
                <button
                    onClick={() => onEdit(supply)}
                    className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => onDelete(supply.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Xóa"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
