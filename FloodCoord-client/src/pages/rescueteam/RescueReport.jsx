import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";

export default function RescueReport() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rescuedPeople: "",
    injuredPeople: "",
    notes: ""
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.rescuedPeople) {
      alert("Vui lòng nhập số người đã cứu");
      return;
    }

    try {

      await rescueTeamApi.createReport(id, form);

      alert("Báo cáo đã gửi thành công!");

      navigate("/rescue-team/missions");

    } catch (error) {

      console.error(error);
      alert("Gửi báo cáo thất bại");

    }

  };

  return (

    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Báo cáo cứu hộ
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 max-w-xl space-y-5"
      >

        {/* rescued people */}
        <div>

          <label className="block font-medium mb-1">
            Số người đã cứu
          </label>

          <input
            type="number"
            className="border p-2 w-full rounded"
            value={form.rescuedPeople}
            onChange={(e) =>
              setForm({ ...form, rescuedPeople: e.target.value })
            }
          />

        </div>

        {/* injured people */}
        <div>

          <label className="block font-medium mb-1">
            Số người bị thương
          </label>

          <input
            type="number"
            className="border p-2 w-full rounded"
            value={form.injuredPeople}
            onChange={(e) =>
              setForm({ ...form, injuredPeople: e.target.value })
            }
          />

        </div>

        {/* notes */}
        <div>

          <label className="block font-medium mb-1">
            Ghi chú cứu hộ
          </label>

          <textarea
            rows="4"
            className="border p-2 w-full rounded"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />

        </div>

        {/* buttons */}
        <div className="flex gap-3 pt-2">

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Gửi báo cáo
          </button>

          <button
            type="button"
            onClick={() => navigate("/rescue-team/missions")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Quay lại
          </button>

        </div>

      </form>

    </div>
  );
}