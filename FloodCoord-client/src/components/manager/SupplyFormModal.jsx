import React from 'react';

export default function SupplyFormModal({ 
    showModal, 
    editingSupply, 
    formData, 
    onInputChange, 
    onSubmit, 
    onClose 
}) {
    const supplyTypes = [
        { value: 'FOOD_WATER', label: 'Đồ ăn, nước uống' },
        { value: 'MEDICAL', label: 'Thuốc men, y tế' },
        { value: 'EQUIPMENT', label: 'Thiết bị cứu hộ' },
        { value: 'OTHER', label: 'Khác' }
    ];

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-[#059669]/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="bg-[#059669] p-6 text-white flex justify-between items-center sticky top-0">
                    <h2 className="text-xl font-bold">
                        {editingSupply ? 'Cập nhật lô hàng' : 'Nhập lô hàng mới'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl"
                        type="button"
                    >
                        ✕
                    </button>
                </div>
                
                <form onSubmit={onSubmit} className="p-8 space-y-5">
                    {/* Info Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Cho phép cùng tên vật tư nhưng khác lô (ID). 
                            Nếu không nhập <strong>Ngày nhập kho</strong>, hệ thống tự lấy ngày hiện tại.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Tên vật tư *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="VD: Mì tôm Hảo Hảo"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Loại vật tư *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                required
                            >
                                {supplyTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Đơn vị *
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="VD: Thùng, Hộp, Cái..."
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Số lượng *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="VD: 100"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mô tả / Ghi chú lô hàng
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="VD: Lô 1 - Ưu tiên xuất trước, Lô 2 - Hàng mới về..."
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                Ngày nhập kho
                                <span className="text-xs text-slate-500 font-normal">(Tự động nếu bỏ trống)</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="importedDate"
                                value={formData.importedDate}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                Hạn sử dụng
                                <span className="text-xs text-red-500 font-normal">(Quan trọng!)</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    {/* Export Date - Only show when editing */}
                    {editingSupply && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                Ngày xuất kho
                                <span className="text-xs text-slate-500 font-normal">(Khi xuất hàng cứu trợ)</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="exportedDate"
                                value={formData.exportedDate}
                                onChange={onInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                * Ghi nhận khi lô hàng được xuất đi cho đội cứu hộ
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-[#059669] text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-700 transition transform hover:-translate-y-0.5"
                        >
                            {editingSupply ? 'Cập nhật lô hàng' : 'Nhập lô mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
