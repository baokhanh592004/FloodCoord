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
          Manager Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Manage vehicles, teams and supplies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TruckIcon className="h-6 w-6" />}
          count={18}
          label="Vehicles"
          color="blue"
        />
        <StatCard
          icon={<UserGroupIcon className="h-6 w-6" />}
          count={12}
          label="Rescue Teams"
          color="red"
        />
        <StatCard
          icon={<ArchiveBoxIcon className="h-6 w-6" />}
          count={4}
          label="Warehouses"
          color="green"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">
          Management Shortcuts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            title="Manage Vehicles"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            title="Manage Rescue Teams"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            title="Manage Supplies"
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
        Access module →
      </p>
    </div>
  )
}
