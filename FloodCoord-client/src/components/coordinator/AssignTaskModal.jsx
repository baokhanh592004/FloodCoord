import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import { teamApi } from '../../services/teamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';
import { MODAL_STYLE_MAP } from '../shared/styleMaps';
import toast from 'react-hot-toast';

/**
 * AssignTaskModal — Modal phân công đội cứu hộ cho yêu cầu đã xác thực
 *
 * Tính năng:
 * - Chọn đội cứu hộ (bắt buộc), sort theo kinh nghiệm
 * - Toggle phương tiện: mặc định TẮT, bật lên mới hiện danh sách + số lượng
 * - Toggle hàng cứu trợ: mặc định TẮT, bật lên mới hiện danh sách + số lượng theo unit
 * - Hướng dẫn cho đội (optional)
 * - Modal xác nhận nhỏ trước khi gửi chính thức
 */
export default function AssignTaskModal({ request, isOpen, onClose, onSuccess }) {
    const [teams, setTeams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Toggle có/không sử dụng phương tiện & hàng cứu trợ
    const [useVehicle, setUseVehicle] = useState(false);
    const [useSupplies, setUseSupplies] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});

    const [formData, setFormData] = useState({
        rescueTeamId: '',
        vehicleId: '',      // single vehicle
        note: '',
        emergencyLevel: '',
        supplies: [],       // [{supplyId, quantity}]
    });

    useEffect(() => {
        if (isOpen) {
            loadResources();
            setFormData({
                rescueTeamId: '',
                vehicleId: '',
                note: '',
                emergencyLevel: request?.emergencyLevel || '',
                supplies: [],
            });
            setUseVehicle(false);
            setUseSupplies(false);
            setShowConfirmDialog(false);
        }
    }, [isOpen, request]);

    const loadResources = async () => {
        try {
            const [teamData, vehicleData, supplyData] = await Promise.all([
                teamApi.getAllTeams(),
                vehicleApi.getAllVehicles(),
                supplyApi.getAllSupplies(),
            ]);
            setTeams(Array.isArray(teamData) ? teamData : (teamData?.content || []));
            setVehicles(Array.isArray(vehicleData) ? vehicleData : (vehicleData?.content || []));
            setSupplies(Array.isArray(supplyData) ? supplyData : (supplyData?.content || []));
        } catch (error) {
            console.error('Failed to load resources:', error);
        }
    };

    // Bấm "Xác nhận phân công" → hiện dialog nhỏ
    const handleClickAssign = () => {
        if (!formData.rescueTeamId) {
            toast.error('Vui lòng chọn đội cứu hộ');
            return;
        }
        setShowConfirmDialog(true);
    };

    // Xác nhận chính thức → gọi API
    const handleConfirmAssign = async () => {
        setLoading(true);
        try {
            await coordinatorApi.assignTask(request.requestId, {
                rescueTeamId: Number(formData.rescueTeamId),
                vehicleId: useVehicle && formData.vehicleId
                    ? Number(formData.vehicleId)
                    : null,
                note: formData.note,
                emergencyLevel: formData.emergencyLevel || request.emergencyLevel,
                supplies: useSupplies
                    ? formData.supplies.map((s) => ({ supplyId: s.supplyId, quantity: s.quantity }))
                    : [],
            });
            toast.success('Phân công đội cứu hộ thành công!');
            setShowConfirmDialog(false);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Phân công thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleSupply = (supplyId) => {
        setFormData((prev) => {
            const exists = prev.supplies.find((s) => s.supplyId === supplyId);
            if (exists) {
                return { ...prev, supplies: prev.supplies.filter((s) => s.supplyId !== supplyId) };
            }
            return { ...prev, supplies: [...prev.supplies, { supplyId, quantity: 1 }] };
        });
    };

    const updateQuantity = (supplyId, delta) => {
        setFormData((prev) => ({
            ...prev,
            supplies: prev.supplies.map((s) => {
                if (s.supplyId !== supplyId) return s;
                const maxQty = supplies.find((sup) => sup.id === supplyId)?.quantity || 999;
                return { ...s, quantity: Math.max(1, Math.min(maxQty, s.quantity + delta)) };
            }),
        }));
    };

    const toggleGroup = (type) => {
        setExpandedGroups((prev) => ({ ...prev, [type]: prev[type] === false ? true : false }));
    };

    // Lọc hàng hết hạn, nhóm theo loại
    const validSupplies = supplies.filter(
        (s) => (s.quantity ?? 0) > 0 && (!s.expiryDate || new Date(s.expiryDate) > new Date())
    );
    const groupedSupplies = validSupplies.reduce((acc, s) => {
        const type = s.type || 'Khác';
        if (!acc[type]) acc[type] = [];
        acc[type].push(s);
        return acc;
    }, {});

    if (!isOpen || !request) return null;

    // Sort đội theo kinh nghiệm (experienceYears) giảm dần, ưu tiên available
    const sortedTeams = [...(teams.filter((t) => t.isActive !== false))].sort((a, b) => {
        // Available trước
        if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
        if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;
        // Kinh nghiệm cao hơn trước
        return (b.experienceYears || 0) - (a.experienceYears || 0);
    });

    const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');
    const selectedTeam = sortedTeams.find((t) => String(t.id) === String(formData.rescueTeamId));

    return (
        <>
            {/* Main Modal */}
            <div className={MODAL_STYLE_MAP.overlaySoft}>
                <div className={`${MODAL_STYLE_MAP.shell} max-w-3xl`}>
                    {/* Header — cố định */}
                    <div className={MODAL_STYLE_MAP.header}>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Phân công đội cứu hộ</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Chọn đội, phương tiện và hàng cứu trợ cho nhiệm vụ
                            </p>
                        </div>
                        <button onClick={onClose} className={MODAL_STYLE_MAP.closeButton}>
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content — cuộn được */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                        {/* Tóm tắt yêu cầu */}
                        <div className="bg-coordinator-50 border border-coordinator-100 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-coordinator-900 mb-1">
                                {request.title || request.trackingCode}
                            </p>
                            <p className="text-xs text-coordinator-dark">
                                📍 {request.location?.addressText || 'Chưa xác định'}
                            </p>
                            <p className="text-xs text-coordinator-dark mt-1">
                                👥 {request.peopleCount || 0} người cần cứu
                            </p>
                        </div>

                        {/* ===== CHỌN ĐỘI CỨU HỘ (bắt buộc) ===== */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đội cứu hộ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.rescueTeamId}
                                onChange={(e) => setFormData({ ...formData, rescueTeamId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">— Chọn đội cứu hộ —</option>
                                {sortedTeams.map((team) => (
                                    <option key={team.id} value={team.id} disabled={team.status === 'BUSY'}>
                                        {team.name} — {team.members?.length || 0} thành viên
                                        {team.experienceYears ? ` — ${team.experienceYears} năm kinh nghiệm` : ''}
                                        {team.specialization ? ` — ${team.specialization}` : ''}
                                        {team.status === 'BUSY' ? ' (Đang bận)' : ''}
                                    </option>
                                ))}
                            </select>
                            {selectedTeam && (
                                <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-md text-xs text-teal-800">
                                    <strong>{selectedTeam.name}</strong>
                                    {selectedTeam.experienceYears && ` — ${selectedTeam.experienceYears} năm kinh nghiệm`}
                                    {selectedTeam.specialization && ` — Chuyên môn: ${selectedTeam.specialization}`}
                                    {` — ${selectedTeam.members?.length || 0} thành viên`}
                                </div>
                            )}
                        </div>

                        {/* ===== PHƯƠNG TIỆN (toggle có/không) ===== */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Phương tiện</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseVehicle(!useVehicle);
                                        if (useVehicle) setFormData({ ...formData, vehicleId: '' });
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        useVehicle ? 'bg-teal-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            useVehicle ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                {useVehicle ? 'Chọn phương tiện cho nhiệm vụ' : 'Không sử dụng phương tiện'}
                            </p>

                            {useVehicle && (
                                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                    {availableVehicles.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">Không có phương tiện khả dụng</p>
                                    ) : (
                                        availableVehicles.map((v) => {
                                            const checked = formData.vehicleId === String(v.id);
                                            return (
                                                <label
                                                    key={v.id}
                                                    className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="vehicleId"
                                                        checked={checked}
                                                        onChange={() => setFormData((prev) => ({ ...prev, vehicleId: String(v.id) }))}
                                                        className="h-4 w-4 text-teal-600"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{v.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {v.licensePlate && <span className="font-mono mr-2">{v.licensePlate}</span>}
                                                            {v.type} • Sức chứa: {v.capacity} người
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== HÀNG CỨU TRỢ (toggle có/không) ===== */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Hàng cứu trợ</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseSupplies(!useSupplies);
                                        if (useSupplies) setFormData({ ...formData, supplies: [] });
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        useSupplies ? 'bg-teal-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            useSupplies ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                {useSupplies ? 'Chọn hàng cứu trợ và số lượng' : 'Không sử dụng hàng cứu trợ'}
                            </p>

                            {useSupplies && (
                                <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                                    {Object.keys(groupedSupplies).length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">Không có hàng cứu trợ</p>
                                    ) : (
                                        Object.entries(groupedSupplies).map(([type, items]) => (
                                            <div key={type}>
                                                {/* Group header — bấm để mở/đóng */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(type)}
                                                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="text-xs font-semibold text-gray-700 uppercase">
                                                        {type} ({items.length})
                                                    </span>
                                                    {expandedGroups[type] === false ? (
                                                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                                {/* Supply items — mặc định mở */}
                                                {expandedGroups[type] !== false && items.map((supply) => {
                                                    const selected = formData.supplies.find((s) => s.supplyId === supply.id);
                                                    return (
                                                        <div
                                                            key={supply.id}
                                                            className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                                        >
                                                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!selected}
                                                                    onChange={() => toggleSupply(supply.id)}
                                                                    className="h-4 w-4 text-teal-600 rounded"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">{supply.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Có sẵn: {supply.quantity} {supply.unit}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                            {selected && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => updateQuantity(supply.id, -1)}
                                                                        className="p-1 rounded hover:bg-gray-200"
                                                                    >
                                                                        <MinusIcon className="h-4 w-4 text-gray-600" />
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={supply.quantity}
                                                                        value={selected.quantity}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value, 10);
                                                                            if (!isNaN(val)) {
                                                                                setFormData((prev) => ({
                                                                                    ...prev,
                                                                                    supplies: prev.supplies.map((s) =>
                                                                                        s.supplyId === supply.id
                                                                                            ? { ...s, quantity: Math.max(1, Math.min(supply.quantity, val)) }
                                                                                            : s
                                                                                    ),
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-14 text-center text-sm font-medium border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                                    />
                                                                    <button
                                                                        onClick={() => updateQuantity(supply.id, 1)}
                                                                        className="p-1 rounded hover:bg-gray-200"
                                                                        disabled={selected.quantity >= supply.quantity}
                                                                    >
                                                                        <PlusIcon className="h-4 w-4 text-gray-600" />
                                                                    </button>
                                                                    <span className="text-xs text-gray-500 w-10">
                                                                        {supply.unit}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== HƯỚNG DẪN CHO ĐỘI CỨU HỘ (optional) ===== */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hướng dẫn cho đội cứu hộ <span className="text-gray-400">(không bắt buộc)</span>
                            </label>
                            <textarea
                                rows="3"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Hướng dẫn đặc biệt, thông tin đường đi, lưu ý an toàn..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Footer — cố định */}
                    <div className={MODAL_STYLE_MAP.footerEnd}>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className={MODAL_STYLE_MAP.secondaryButton}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleClickAssign}
                            disabled={loading || !formData.rescueTeamId}
                            className={MODAL_STYLE_MAP.primaryTeal}
                        >
                            Xác nhận phân công
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog — modal nhỏ xác nhận lần cuối */}
            {showConfirmDialog && (
                <div className={MODAL_STYLE_MAP.overlayStrong}>
                    <div className={MODAL_STYLE_MAP.shellCompact}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Xác nhận phân công</h3>
                                <p className="text-sm text-gray-500">Vui lòng kiểm tra lại thông tin</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-700 space-y-2 mb-6">
                            <p>
                                <strong>Đội:</strong> {selectedTeam?.name || '—'}
                            </p>
                            {useVehicle && formData.vehicleId && (
                                <p>
                                    <strong>Phương tiện:</strong>{' '}
                                    {availableVehicles.find((v) => String(v.id) === formData.vehicleId)?.name || '—'}
                                </p>
                            )}
                            {useSupplies && formData.supplies.length > 0 && (
                                <p>
                                    <strong>Hàng cứu trợ:</strong> {formData.supplies.length} loại
                                </p>
                            )}
                            <p className="pt-2 text-gray-600">
                                Bạn có chắc chắn muốn phân công đội cứu hộ cho yêu cầu <strong>"{request.title}"</strong>?
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={loading}
                                className={MODAL_STYLE_MAP.secondaryButton}
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmAssign}
                                disabled={loading}
                                className={MODAL_STYLE_MAP.primaryTeal}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
