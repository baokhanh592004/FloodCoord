import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AttendancePanel({ teamMembers, onSubmit, onClose }) {
  const [attendance, setAttendance] = useState({});

  const toggle = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const getStatus = (id) => attendance[id] || 'ABSENT';

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-navy-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-lg text-navy-dark font-condensed">
              Điểm danh đội
            </h2>
            <p className="text-xs mt-0.5 text-navy-100">
              {presentCount}/{teamMembers.length} thành viên có mặt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-neutral-50 text-neutral-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Member list */}
        <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
          {teamMembers.map((m) => {
            const present = getStatus(m.id) === 'PRESENT';
            return (
              <div
                key={m.id}
                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${present ? 'bg-success-50' : 'bg-neutral-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Status dot */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${present ? 'bg-success' : 'bg-navy-200'}`}
                  />
                  <span className="text-sm font-medium text-navy-dark">
                    {m.name}
                  </span>
                </div>

                <button
                  onClick={() => toggle(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${present ? 'bg-success text-white border border-transparent' : 'bg-white text-neutral-400 border border-neutral-100'}`}
                >
                  {present ? 'Có mặt' : 'Vắng mặt'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-white text-neutral-400 border border-neutral-100"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSubmit(attendance)}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors bg-navy hover:bg-navy-dark"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}