import React from 'react';
import { X, Package, Apple, Pill, Wrench, Box, Calendar, Clock, Truck, Tag, Hash, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { getSupplyTypeMeta, SUPPLY_EXPIRY_META, MODAL_STYLE_MAP } from '../shared/styleMaps';

function Row({ icon, iconClass = 'text-slate-400', label, children }) {
    const iconElement = React.createElement(icon, { size: 16 });

    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className={`mt-0.5 shrink-0 ${iconClass}`}>
                {iconElement}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <div className="text-sm font-semibold text-slate-700">{children}</div>
            </div>
        </div>
    );
}

export default function SupplyDetailModal({ supply, onClose, onEdit }) {
    if (!supply) return null;

    const getTypeIconComponent = (type) => {
        const cls = 'w-10 h-10';
        const typeMeta = getSupplyTypeMeta(type);
        switch (type) {
            case 'FOOD_WATER': return <Apple className={`${cls} ${typeMeta.iconColor}`} strokeWidth={1.5} />;
            case 'MEDICAL':    return <Pill  className={`${cls} ${typeMeta.iconColor}`} strokeWidth={1.5} />;
            case 'EQUIPMENT':  return <Wrench className={`${cls} ${typeMeta.iconColor}`} strokeWidth={1.5} />;
            case 'OTHER':      return <Box   className={`${cls} ${typeMeta.iconColor}`} strokeWidth={1.5} />;
            default:           return <Package className={`${cls} text-slate-600`} strokeWidth={1.5} />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 30 && days > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const getExpiryState = (expiryDate) => {
        if (isExpired(expiryDate)) return 'expired';
        if (isExpiringSoon(expiryDate)) return 'expiring';
        return 'fresh';
    };

    const getStatusBadge = () => {
        const meta = SUPPLY_EXPIRY_META[getExpiryState(supply.expiryDate)];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${meta.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${meta.dotClass} animate-pulse`} /> {meta.label}
            </span>
        );
    };

    const typeMeta = getSupplyTypeMeta(supply.type);
    const expiryMeta = SUPPLY_EXPIRY_META[getExpiryState(supply.expiryDate)];

    return (
        <div className={MODAL_STYLE_MAP.overlayDefault}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                            {getTypeIconComponent(supply.type)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">{supply.name}</h2>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${typeMeta.badge}`}>
                                    {typeMeta.label}
                                </span>
                                <span className="text-white/70 text-xs font-mono">Lô #{supply.id}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition shrink-0 ml-2">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
                        <span className="text-sm font-semibold text-slate-600">Trạng thái lô hàng</span>
                        {getStatusBadge()}
                    </div>

                    {/* Core info */}
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 divide-y divide-slate-100">
                        <Row icon={Hash} iconClass="text-slate-400" label="Số lượng">
                            <span className="text-lg text-emerald-700">{supply.quantity} {supply.unit}</span>
                        </Row>

                        {supply.description && (
                            <Row icon={FileText} iconClass="text-slate-400" label="Mô tả / Ghi chú lô">
                                <span className="italic text-slate-600">{supply.description}</span>
                            </Row>
                        )}

                        <Row icon={Calendar} iconClass="text-blue-400" label="Ngày nhập kho">
                            {formatDate(supply.importedDate) ?? <span className="text-slate-400 font-normal italic">Không có</span>}
                        </Row>

                        <Row
                            icon={isExpired(supply.expiryDate) ? AlertTriangle : isExpiringSoon(supply.expiryDate) ? AlertTriangle : CheckCircle}
                            iconClass={expiryMeta.iconClass}
                            label="Hạn sử dụng"
                        >
                            {formatDate(supply.expiryDate) ? (
                                <span className={expiryMeta.valueClass}>
                                    {formatDate(supply.expiryDate)}
                                </span>
                            ) : (
                                <span className="text-slate-400 font-normal italic">Không có</span>
                            )}
                        </Row>

                        {supply.exportedDate && (
                            <Row icon={Truck} iconClass="text-blue-500" label="Ngày xuất kho">
                                <span className="text-blue-700">{formatDate(supply.exportedDate)}</span>
                            </Row>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 pt-0 shrink-0">
                    <button
                        onClick={onClose}
                        className={MODAL_STYLE_MAP.secondarySolidFlex}
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => onEdit(supply)}
                        className={MODAL_STYLE_MAP.primaryRescueFlex}
                    >
                        Chỉnh sửa lô này
                    </button>
                </div>
            </div>
        </div>
    );
}
