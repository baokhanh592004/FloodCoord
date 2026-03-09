import { useState } from "react";

export default function AttendancePanel({ teamMembers, onSubmit, onClose }) {
  const [attendance, setAttendance] = useState({});

  const toggle = (id) => {
    setAttendance({
      ...attendance,
      [id]: attendance[id] === "PRESENT" ? "ABSENT" : "PRESENT",
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">Điểm danh đội</h2>

        {teamMembers.map((m) => (
          <div key={m.id} className="flex justify-between mb-2">
            <span>{m.name}</span>

            <button
              onClick={() => toggle(m.id)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              {attendance[m.id] || "ABSENT"}
            </button>
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Huỷ</button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => onSubmit(attendance)}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}