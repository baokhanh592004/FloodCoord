import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/coordinator/StatCard'
import {
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function ManagerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">

      {/* ===== Header giống Coordinator ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bảng điều khiển Quản lý
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý phương tiện, đội cứu hộ và vật tư trong hệ thống.
        </p>
      </div>

      {/* ===== Thống kê ===== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tổng quan hệ thống
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon={<TruckIcon className="h-6 w-6" />}
            count={18}
            label="Phương tiện"
            color="blue"
          />
          <StatCard
            icon={<UserGroupIcon className="h-6 w-6" />}
            count={12}
            label="Đội cứu hộ"
            color="red"
          />
          <StatCard
            icon={<ArchiveBoxIcon className="h-6 w-6" />}
            count={4}
            label="Kho vật tư"
            color="green"
          />
        </div>
      </div>

      {/* ===== Lối tắt quản lý ===== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lối tắt quản lý
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ActionCard
            title="Quản lý phương tiện"
            description="Xem, thêm và chỉnh sửa phương tiện"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            title="Quản lý đội cứu hộ"
            description="Quản lý nhân sự và phân công đội"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            title="Quản lý vật tư"
            description="Theo dõi và cập nhật kho vật tư"
            onClick={() => navigate('/manager/supplies')}
          />
        </div>
      </div>

    </div>
  )
}

function ActionCard({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 cursor-pointer 
                 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>
        <ArrowRightIcon className="h-5 w-5 text-gray-400" />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {description}
      </p>
    </div>
  )
}