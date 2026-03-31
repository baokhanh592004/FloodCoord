import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Users, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { getTeamStatusMeta } from './styleMaps';

export default function TeamCard({
	team,
	mode = 'coordinator',
	onEdit,
	onDelete,
	onViewDetails,
}) {
	const statusMeta = getTeamStatusMeta(team, mode);

	if (mode === 'admin') {
		return (
			<div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
				<div className="absolute -right-6 -top-6 w-24 h-24 bg-linear-to-br from-coordinator-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

				<div className="flex justify-between items-start mb-6 relative z-10">
					<div className="p-3 bg-white rounded-xl shadow-sm border border-neutral-100">
						<Users size={32} strokeWidth={1.5} className="text-coordinator" />
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => onEdit?.(team)}
							className="p-2 text-neutral-400 hover:bg-coordinator-50 hover:text-coordinator rounded-lg transition-colors"
							title="Chỉnh sửa"
						>
							<Edit size={18} />
						</button>
						<button
							onClick={() => onDelete?.(team?.id)}
							className="p-2 text-neutral-400 hover:bg-accent-50 hover:text-accent rounded-lg transition-colors"
							title="Xóa đội"
						>
							<Trash2 size={18} />
						</button>
					</div>
				</div>

				<div className="mb-4 relative z-10">
					<h3
						className="text-xl font-bold text-slate-800 mb-1 group-hover:text-coordinator-dark transition-colors cursor-pointer"
						onClick={() => onViewDetails?.(team)}
					>
						{team?.name}
					</h3>
					<p className="text-sm text-slate-500">Đội cứu hộ #{team?.id}</p>
				</div>

				<div className="mb-6 relative z-10">
					<div className="flex items-center gap-2 border-b border-neutral-100/50">
						<Shield size={16} className="text-accent" />
						<span className="text-sm text-neutral-400">Đội trưởng:</span>
						<span className="font-semibold text-slate-700 ml-auto">{team?.leaderName || 'N/A'}</span>
					</div>

					<div className="flex items-center gap-2 py-2 border-b border-neutral-100/50">
						<UserCheck size={16} className="text-coordinator" />
						<span className="text-sm text-neutral-400">Thành viên:</span>
						<span className="font-semibold text-slate-700 bg-neutral-50 px-2 py-0.5 rounded ml-auto">
							{team?.memberCount || team?.members?.length || 0} người
						</span>
					</div>

					{team?.description && (
						<div className="text-sm py-2 space-y-1">
							<div>
								<span className="text-slate-500 mr-1">Mô tả:</span>
								<span className="text-slate-700">{team.description}</span>
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between mt-auto relative z-10">
					<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusMeta.tone}`}>
						<span className={`w-2 h-2 rounded-full ${statusMeta.dot} animate-pulse`} />
						{statusMeta.label}
					</span>

					<button
						onClick={() => onViewDetails?.(team)}
						className="text-xs text-coordinator hover:text-coordinator-dark font-semibold hover:underline"
					>
						Xem chi tiết →
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-neutral-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<h3 className="text-sm font-semibold text-neutral-900 mb-1">{team?.name}</h3>
					<p className="text-xs text-neutral-400">{team?.members?.length || 0} thành viên</p>
				</div>
				<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMeta.tone}`}>
					{statusMeta.label}
				</span>
			</div>

			{team?.leaderName && (
				<div className="flex items-center text-xs text-neutral-600 mb-2">
					<UserGroupIcon className="h-3.5 w-3.5 mr-1.5" />
					<span>Đội trưởng: {team.leaderName}</span>
				</div>
			)}

			{team?.description && <p className="text-xs text-neutral-400 line-clamp-2">{team.description}</p>}
		</div>
	);
}
