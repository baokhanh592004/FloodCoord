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
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      {/* Header giống trang nhiệm vụ */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            Thành viên đội cứu hộ
          </h1>
          <p className="text-xs text-gray-500">Quản lý và liên lạc nội bộ đội ngũ:</p>
        </div>
        <button 
          onClick={fetchMembers}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 font-semibold text-gray-600 w-12">#</th>
                <th className="px-3 py-2 font-semibold text-gray-600 w-80">Thành viên</th>
                <th className="px-3 py-2 font-semibold text-gray-600 w-72">Liên hệ</th>
                <th className="px-3 py-2 font-semibold text-gray-600 w-40 text-center">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-gray-400">
                    Chưa có dữ liệu thành viên.
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-gray-400 font-mono">{index + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          member.isTeamLeader 
                            ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {member.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-none mb-1">{member.fullName}</p>
                          <p className="text-xs text-gray-400">ID: #{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneIcon className="h-4 w-4 text-blue-500" />
                        {member.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <EnvelopeIcon className="h-4 w-4" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        {member.isTeamLeader ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium ring-1 ring-blue-600/20">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Đội trưởng
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium ring-1 ring-gray-200">
                            Thành viên
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