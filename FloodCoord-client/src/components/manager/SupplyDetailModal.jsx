import React from 'react';
import { X, Package, Apple, Pill, Wrench, Box, Calendar, Clock, Truck, Tag, Hash, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SupplyDetailModal({ supply, onClose, onEdit }) {
    if (!supply) return null;

    const getTypeIconComponent = (type) => {
        const cls = 'w-10 h-10';
        switch (type) {
            case 'FOOD_WATER': return <Apple className={`${cls} text-green-600`} strokeWidth={1.5} />;
            case 'MEDICAL':    return <Pill  className={`${cls} text-red-600`}   strokeWidth={1.5} />;
            case 'EQUIPMENT':  return <Wrench className={`${cls} text-blue-600`} strokeWidth={1.5} />;
            case 'OTHER':      return <Box   className={`${cls} text-gray-600`}  strokeWidth={1.5} />;
            default:           return <Package className={`${cls} text-slate-600`} strokeWidth={1.5} />;
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            FOOD_WATER: 'bg-green-100 text-green-800',
            MEDICAL:    'bg-red-100 text-red-800',
            EQUIPMENT:  'bg-blue-100 text-blue-800',
            OTHER:      'bg-gray-100 text-gray-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        const labels = {
            FOOD_WATER: 'Đồ ăn, nước uống',
            MEDICAL:    'Thuốc men, y tế',
            EQUIPMENT:  'Thiết bị cứu hộ',
            OTHER:      'Khác',
        };
        return labels[type] || type;
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

    const getStatusBadge = () => {
        if (isExpired(supply.expiryDate)) return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Đã hết hạn
            </span>
        );
        if (isExpiringSoon(supply.expiryDate)) return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Sắp hết hạn
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Còn hạn
            </span>
        );
    };

    const Row = ({ icon: Icon, iconClass = 'text-slate-400', label, children }) => (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className={`mt-0.5 flex-shrink-0 ${iconClass}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <div className="text-sm font-semibold text-slate-700">{children}</div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-start flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                            {getTypeIconComponent(supply.type)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">{supply.name}</h2>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTypeColor(supply.type)}`}>
                                    {getTypeLabel(supply.type)}
                                </span>
                                <span className="text-white/70 text-xs font-mono">Lô #{supply.id}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition flex-shrink-0 ml-2">
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
                            iconClass={isExpired(supply.expiryDate) ? 'text-red-500' : isExpiringSoon(supply.expiryDate) ? 'text-yellow-500' : 'text-green-500'}
                            label="Hạn sử dụng"
                        >
                            {formatDate(supply.expiryDate) ? (
                                <span className={
                                    isExpired(supply.expiryDate) ? 'text-red-600' :
                                    isExpiringSoon(supply.expiryDate) ? 'text-yellow-600' : ''
                                }>
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
                <div className="flex gap-3 p-6 pt-0 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => onEdit(supply)}
                        className="flex-1 px-4 py-3 bg-[#059669] text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20"
                    >
                        Chỉnh sửa lô này
                    </button>
                </div>
            </div>
        </div>
    );
}
