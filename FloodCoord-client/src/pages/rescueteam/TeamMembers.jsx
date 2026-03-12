import React, { useEffect, useState } from 'react';
import { rescueTeamApi } from '../../services/rescueTeamApi';
import { 
  UserGroupIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await rescueTeamApi.getTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="p-6 pb-20">
      {/* Header giống trang nhiệm vụ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            Thành viên đội cứu hộ
          </h1>
          <p className="text-slate-500 font-medium mt-1">Quản lý và liên lạc nội bộ đội ngũ</p>
        </div>
        <button 
          onClick={fetchMembers}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 text-sm"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          LÀM MỚI
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thành viên</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400 font-medium">
                    Chưa có dữ liệu thành viên.
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr key={member.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-6 text-sm font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${
                          member.isTeamLeader 
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {member.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1">{member.fullName}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: #{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <PhoneIcon className="h-4 w-4 text-blue-500" />
                        {member.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <EnvelopeIcon className="h-4 w-4" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        {member.isTeamLeader ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black ring-1 ring-blue-600/20">
                            <ShieldCheckIcon className="h-4 w-4" />
                            ĐỘI TRƯỞNG
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-slate-200">
                            THÀNH VIÊN
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}