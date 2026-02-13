import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/coordinator/StatCard'
import {
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'

export default function ManagerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bảng điều khiển Quản lý
        </h1>
        <p className="text-sm text-gray-600">
          Quản lý phương tiện, đội cứu hộ và vật tư.
        </p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Thao tác nhanh */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">
          Lối tắt quản lý
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            title="Quản lý phương tiện"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            title="Quản lý đội cứu hộ"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            title="Quản lý vật tư"
            onClick={() => navigate('/manager/supplies')}
          />
        </div>
      </div>
    </div>
  )
}

function ActionCard({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        Truy cập chức năng →
      </p>
    </div>
  )
}
  