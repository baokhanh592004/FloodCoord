import React from 'react';
import { Edit, Trash2, Apple, Pill, Wrench, Box, Package, Calendar, AlertTriangle, CheckCircle, TruckIcon, Eye } from 'lucide-react';
import { getSupplyTypeMeta, SUPPLY_EXPIRY_META } from '../shared/styleMaps';

export default function SupplyCard({ supply, onEdit, onDelete, onViewDetail }) {
    const getTypeIconComponent = (type) => {
        const iconProps = { size: 22, strokeWidth: 1.5 };
        const typeMeta = getSupplyTypeMeta(type);
        switch(type) {
            case 'FOOD_WATER': return <Apple {...iconProps} className={typeMeta.iconColor} />;
            case 'MEDICAL': return <Pill {...iconProps} className={typeMeta.iconColor} />;
            case 'EQUIPMENT': return <Wrench {...iconProps} className={typeMeta.iconColor} />;
            case 'OTHER': return <Box {...iconProps} className={typeMeta.iconColor} />;
            default: return <Package {...iconProps} />;
        }
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

    const getExpiryState = (expiryDate) => {
        if (isExpired(expiryDate)) return 'Đã hết hạn';
        if (isExpiringSoon(expiryDate)) return 'Sắp hết hạn';
        return 'Còn hạn';
    };

    const getStatusBadge = () => {
        const meta = SUPPLY_EXPIRY_META[getExpiryState(supply.expiryDate)];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${meta.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${meta.dotClass} animate-pulse`} />
                {meta.label}
            </span>
        );
    };

    const typeMeta = getSupplyTypeMeta(supply.type);
    const expiryMeta = SUPPLY_EXPIRY_META[getExpiryState(supply.expiryDate)];

    return (
        <div className="group bg-white border border-slate-100 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md hover:border-rescue-100 transition-all duration-200 flex items-center gap-4">
            {/* Icon */}
            <div className="shrink-0 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {getTypeIconComponent(supply.type)}
            </div>

            {/* Name + type + description */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-rescue-medium transition-colors truncate">
                        {supply.name}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${typeMeta.badge}`}>
                        {typeMeta.label}
                    </span>
                    {supply.exportedDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-coordinator-100 text-coordinator-dark shrink-0">
                            <TruckIcon size={11} /> Đã xuất kho
                        </span>
                    )}
                </div>
                {supply.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate italic">{supply.description}</p>
                )}
            </div>

            {/* Quantity */}
            <div className="shrink-0 text-center hidden sm:block w-24">
                <p className="text-xs text-slate-400 mb-0.5">Số lượng</p>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {supply.quantity} {supply.unit}
                </span>
            </div>

            {/* Imported date */}
            <div className="shrink-0 text-center hidden md:block w-32">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                    <Calendar size={11} className="text-coordinator" /> Nhập kho
                </p>
                <span className="text-xs font-medium text-slate-600">{formatDate(supply.importedDate)}</span>
            </div>

            {/* Expiry date */}
            <div className="shrink-0 text-center hidden md:block w-32">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                    {isExpired(supply.expiryDate) ? (
                        <AlertTriangle size={11} className={expiryMeta.iconClass} />
                    ) : isExpiringSoon(supply.expiryDate) ? (
                        <AlertTriangle size={11} className={expiryMeta.iconClass} />
                    ) : (
                        <CheckCircle size={11} className={expiryMeta.iconClass} />
                    )}
                    Hạn dùng
                </p>
                <span className={`text-xs font-medium ${expiryMeta.valueClass || 'text-slate-600'}`}>
                    {formatDate(supply.expiryDate)}
                </span>
            </div>

            {/* Status badge */}
            <div className="shrink-0 hidden lg:block">
                {getStatusBadge()}
            </div>

            {/* ID */}
            <div className="shrink-0 hidden lg:block">
                <span className="text-xs text-slate-400 font-mono">Lô #{supply.id}</span>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1">
                <button
                    onClick={() => onViewDetail(supply)}
                    className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                    title="Xem chi tiết"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={() => onEdit(supply)}
                    className="p-1.5 hover:bg-coordinator-50 text-slate-400 hover:text-coordinator rounded-lg transition-colors"
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
