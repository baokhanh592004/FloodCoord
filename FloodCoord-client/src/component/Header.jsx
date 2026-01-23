
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold">
          Flood Rescue System
        </h1>

        <nav className="space-x-4 text-sm">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>
          <Link to="/request" className="hover:underline">
            Gửi cứu hộ
          </Link>
          <Link to="/login" className="hover:underline">
            Đăng nhập
          </Link>
        </nav>
      </div>
    </header>
  )
}
