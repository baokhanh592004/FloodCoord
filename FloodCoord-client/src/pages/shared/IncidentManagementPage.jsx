import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowPathIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { incidentReportApi } from '../../services/incidentReportApi';
import { coordinatorApi } from '../../services/coordinatorApi';

const ACTION_OPTIONS = [
	{ value: 'CONTINUE', label: 'CONTINUE - Tiếp tục nhiệm vụ' },
	{ value: 'ABORT', label: 'ABORT - Dừng nhiệm vụ để điều phối lại' }
];

const VEHICLE_STATUS_OPTIONS = ['AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE'];

export default function IncidentManagementPage() {
	const navigate = useNavigate();
	const [incidents, setIncidents] = useState([]);
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const [selectedIncident, setSelectedIncident] = useState(null);
	const [linkedRequestDetail, setLinkedRequestDetail] = useState(null);
	const [linkedRequestLoading, setLinkedRequestLoading] = useState(false);

	const [resolveForm, setResolveForm] = useState({
		action: 'CONTINUE',
		coordinatorResponse: '',
		vehicleStatus: 'AVAILABLE'
	});
	const [resolving, setResolving] = useState(false);

	const loadIncidents = useCallback(async () => {
		setLoading(true);
		setErrorMessage('');
		try {
			const response = await incidentReportApi.getAllIncidents();
			setIncidents(Array.isArray(response) ? response : []);
		} catch (error) {
			setErrorMessage(error?.response?.data?.message || 'Không thể tải danh sách sự cố.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadIncidents();
	}, [loadIncidents]);

	const filteredIncidents = useMemo(() => {
		const lowerKeyword = keyword.trim().toLowerCase();
		return incidents.filter((incident) => {
			if (statusFilter !== 'ALL' && incident.status !== statusFilter) {
				return false;
			}

			if (!lowerKeyword) {
				return true;
			}

			const searchable = [
				incident.title,
				incident.description,
				incident.teamName,
				incident.reportedByName,
				incident.reportedByPhone,
				incident.rescueRequestTitle,
				incident.coordinatorResponse
			];

			return searchable.some((value) => String(value || '').toLowerCase().includes(lowerKeyword));
		});
	}, [incidents, keyword, statusFilter]);

	const stats = useMemo(() => ({
		total: incidents.length,
		pending: incidents.filter((item) => item.status === 'PENDING').length,
		continueCount: incidents.filter((item) => item.coordinatorAction === 'CONTINUE').length,
		abortCount: incidents.filter((item) => item.coordinatorAction === 'ABORT').length
	}), [incidents]);

	const formatDateTime = (value) => {
		if (!value) return '—';
		return new Date(value).toLocaleString('vi-VN');
	};

	const openDetail = async (incident) => {
		setSelectedIncident(incident);
		setResolveForm({ action: 'CONTINUE', coordinatorResponse: '', vehicleStatus: 'AVAILABLE' });
		setLinkedRequestDetail(null);

		if (!incident?.rescueRequestId) return;

		try {
			setLinkedRequestLoading(true);
			const detail = await coordinatorApi.getRequestDetail(incident.rescueRequestId);
			setLinkedRequestDetail(detail || null);
		} catch (error) {
			setLinkedRequestDetail(null);
		} finally {
			setLinkedRequestLoading(false);
		}
	};

	const closeDetail = () => {
		setSelectedIncident(null);
		setLinkedRequestDetail(null);
		setLinkedRequestLoading(false);
		setResolving(false);
	};

	const handleGoReassign = () => {
		if (!selectedIncident?.rescueRequestId) {
			navigate('/coordinator/requests');
			return;
		}

		navigate('/coordinator/requests', {
			state: { focusRequestId: selectedIncident.rescueRequestId }
		});
	};

	const submitResolve = async () => {
		if (!selectedIncident) return;
		if (!resolveForm.coordinatorResponse.trim()) {
			toast.error('Vui lòng nhập phản hồi cho team leader.');
			return;
		}

		try {
			setResolving(true);
			const payload = {
				action: resolveForm.action,
				coordinatorResponse: resolveForm.coordinatorResponse
			};

			if (resolveForm.action === 'ABORT') {
				payload.vehicleStatus = resolveForm.vehicleStatus;
			}

			await incidentReportApi.resolveIncident(selectedIncident.id, payload);
			toast.success('Đã xử lý sự cố thành công.');

			if (resolveForm.action === 'ABORT') {
				toast('Nhiệm vụ đã trả về VERIFIED, hãy phân công team/xe/vật tư mới.', { icon: '🔁' });
			}

			await loadIncidents();
			closeDetail();
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Xử lý sự cố thất bại.');
		} finally {
			setResolving(false);
		}
	};

	return (
		<div className="h-full overflow-auto p-5 space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Báo cáo sự cố nhiệm vụ</h1>
					<p className="text-sm text-gray-500">Leader báo sự cố, coordinator xử lý CONTINUE hoặc ABORT.</p>
				</div>
				<button
					type="button"
					onClick={loadIncidents}
					disabled={loading}
					className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
				>
					<ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
					Làm mới
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
				<div className="rounded-lg border border-gray-200 bg-white p-4">
					<p className="text-xs text-gray-500">Tổng sự cố</p>
					<p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
				</div>
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
					<p className="text-xs text-amber-700">Đang chờ xử lý</p>
					<p className="mt-1 text-2xl font-bold text-amber-800">{stats.pending}</p>
				</div>
				<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
					<p className="text-xs text-emerald-700">Đã CONTINUE</p>
					<p className="mt-1 text-2xl font-bold text-emerald-800">{stats.continueCount}</p>
				</div>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-xs text-red-700">Đã ABORT</p>
					<p className="mt-1 text-2xl font-bold text-red-800">{stats.abortCount}</p>
				</div>
			</div>

			<div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						type="text"
						value={keyword}
						onChange={(event) => setKeyword(event.target.value)}
						placeholder="Tìm theo đội, leader, tiêu đề, mô tả..."
						className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					/>
					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					>
						<option value="ALL">Tất cả trạng thái</option>
						<option value="PENDING">PENDING</option>
						<option value="RESOLVED">RESOLVED</option>
					</select>
				</div>

				{errorMessage ? (
					<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{errorMessage}
					</div>
				) : null}

				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr>
								<th className="px-3 py-2 text-left font-semibold">Sự cố</th>
								<th className="px-3 py-2 text-left font-semibold">Đội báo cáo</th>
								<th className="px-3 py-2 text-left font-semibold">Thời gian</th>
								<th className="px-3 py-2 text-left font-semibold">Trạng thái</th>
								<th className="px-3 py-2 text-left font-semibold">Xử lý</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={5} className="px-3 py-6 text-center text-gray-500">Đang tải dữ liệu...</td>
								</tr>
							) : filteredIncidents.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-3 py-8 text-center text-gray-500">Không có sự cố phù hợp.</td>
								</tr>
							) : (
								filteredIncidents.map((incident) => (
									<tr key={incident.id} className="border-t border-gray-100 align-top">
										<td className="px-3 py-3">
											<p className="font-semibold text-gray-900">{incident.title || 'Không tiêu đề'}</p>
											<p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{incident.description || 'Không có mô tả'}</p>
											<p className="mt-1 text-xs text-gray-500">Nhiệm vụ: {incident.rescueRequestTitle || '—'}</p>
										</td>
										<td className="px-3 py-3">
											<p className="font-medium text-gray-800">{incident.teamName || '—'}</p>
											<p className="mt-1 text-xs text-gray-600">{incident.reportedByName || '—'}</p>
											<p className="mt-1 text-xs text-gray-600">{incident.reportedByPhone || '—'}</p>
										</td>
										<td className="px-3 py-3 text-xs text-gray-600">
											<p>Tạo lúc: {formatDateTime(incident.createdAt)}</p>
											<p className="mt-1">Xử lý lúc: {formatDateTime(incident.resolvedAt)}</p>
										</td>
										<td className="px-3 py-3">
											{incident.status === 'PENDING' ? (
												<span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
													<ExclamationTriangleIcon className="h-4 w-4" />
													PENDING
												</span>
											) : (
												<span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
													<CheckCircleIcon className="h-4 w-4" />
													{incident.coordinatorAction || 'RESOLVED'}
												</span>
											)}
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => openDetail(incident)}
												className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
											>
												<EyeIcon className="h-4 w-4" />
												Xem chi tiết
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{selectedIncident ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-xl">
						<div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4">
							<div>
								<h2 className="text-lg font-bold text-gray-900">Chi tiết báo cáo sự cố</h2>
								<p className="text-xs text-gray-500">{selectedIncident.teamName || '—'} • {selectedIncident.reportedByName || '—'}</p>
							</div>
							<button
								type="button"
								onClick={closeDetail}
								className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
							>
								<XMarkIcon className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-4 px-5 py-4 text-sm">
							<div className="rounded-lg border border-gray-200 p-3">
								<p className="font-semibold text-gray-900">{selectedIncident.title}</p>
								<p className="mt-1 whitespace-pre-wrap text-gray-700">{selectedIncident.description || 'Không có mô tả'}</p>
							</div>

							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
								<p className="font-semibold text-blue-900">Đơn cứu hộ liên quan</p>
								{linkedRequestLoading ? (
									<p className="mt-1 text-sm text-blue-700">Đang tải chi tiết đơn...</p>
								) : linkedRequestDetail ? (
									<div className="mt-2 space-y-1 text-sm text-blue-900">
										<p><span className="font-semibold">Mã đơn:</span> {linkedRequestDetail.requestId || '—'}</p>
										<p><span className="font-semibold">Tiêu đề:</span> {linkedRequestDetail.title || '—'}</p>
										<p><span className="font-semibold">Trạng thái:</span> {linkedRequestDetail.status || '—'}</p>
										<p><span className="font-semibold">Đội hiện tại:</span> {linkedRequestDetail.assignedTeamName || 'Chưa phân đội'}</p>
									</div>
								) : (
									<p className="mt-1 text-sm text-blue-700">Không lấy được chi tiết đơn này.</p>
								)}
							</div>

							{selectedIncident.images?.length > 0 ? (
								<div className="rounded-lg border border-gray-200 p-3">
									<p className="font-semibold text-gray-900">Hình ảnh sự cố</p>
									<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
										{selectedIncident.images.map((url, index) => (
											<button
												key={`${url}-${index}`}
												type="button"
												className="overflow-hidden rounded-lg border border-gray-200"
												onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
											>
												<img src={url} alt={`incident-${index}`} className="h-40 w-full object-cover" />
											</button>
										))}
									</div>
								</div>
							) : null}

							{selectedIncident.status === 'RESOLVED' ? (
								<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
									<p className="font-semibold text-emerald-900">Sự cố đã xử lý</p>
									<p className="mt-1 text-emerald-800">Hành động: {selectedIncident.coordinatorAction || '—'}</p>
									<p className="mt-1 whitespace-pre-wrap text-emerald-800">Phản hồi: {selectedIncident.coordinatorResponse || '—'}</p>
								</div>
							) : (
								<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
									<p className="font-semibold text-amber-900">Xử lý sự cố</p>
									<select
										value={resolveForm.action}
										onChange={(event) => setResolveForm((prev) => ({ ...prev, action: event.target.value }))}
										className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
									>
										{ACTION_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>{option.label}</option>
										))}
									</select>

									{resolveForm.action === 'ABORT' ? (
										<>
											<select
												value={resolveForm.vehicleStatus}
												onChange={(event) => setResolveForm((prev) => ({ ...prev, vehicleStatus: event.target.value }))}
												className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
											>
												{VEHICLE_STATUS_OPTIONS.map((status) => (
													<option key={status} value={status}>{status}</option>
												))}
											</select>

											<button
												type="button"
												onClick={handleGoReassign}
												className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
											>
												Mở màn phân công để gán team khác
											</button>
										</>
									) : null}

									<textarea
										rows={4}
										value={resolveForm.coordinatorResponse}
										onChange={(event) => setResolveForm((prev) => ({ ...prev, coordinatorResponse: event.target.value }))}
										placeholder="Nhập phản hồi cho team leader..."
										className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
									/>

									<div className="flex justify-end">
										<button
											type="button"
											onClick={submitResolve}
											disabled={resolving}
											className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
										>
											{resolving ? 'Đang xử lý...' : 'Xác nhận xử lý'}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

