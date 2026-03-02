import { Phone, Mail, MapPin } from "lucide-react";
import logo from '../assets/images/logo.png'
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-400 from-blue-600 via-cyan-600 to-teal-600 text-white">
      <div className="w-full px-16 py-4 grid md:grid-cols-[2fr_1fr_1fr] gap-12">

        {/* Column 1 - About */}
        <div>
          <div className="flex items-center gap-4 mb-3">
            <img
              alt="Logo"
              src={logo}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />

            <h3 className="text-black text-lg font-semibold">
              Trung tâm cứu trợ lũ lụt TP.HCM
            </h3>
          </div>

          <p className="text-white text-sm leading-relaxed">
            Hệ thống hỗ trợ điều phối cứu trợ và kết nối cộng đồng
            trong tình huống thiên tai, giúp phân bổ nguồn lực nhanh chóng và hiệu quả.
          </p>
        </div>

        {/* Column 2 - Quick Links */}
        <div>
          <h3 className="text-black text-lg font-semibold mb-3">Liên kết nhanh</h3>
          <ul className="space-y-2 text-sm">

            <li>
              <Link to="/request-rescue" className="text-white hover:text-gray-200 transition">
                Gửi yêu cầu cứu trợ
              </Link>
            </li>

            <li>
              <Link to="/track-rescue" className="text-white hover:text-gray-200 transition">
                Tra cứu cứu hộ
              </Link>
            </li>

          </ul>
        </div>

        {/* Column 3 - Contact */}
        <div>
          <h3 className="text-black text-lg font-semibold mb-3">Liên hệ khẩn cấp</h3>
          <div className="space-y-2 text-sm text-white">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>Hotline: 1900 0000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>Email: trungtamcuutrolulutTPHCM@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Việt Nam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20 text-center py-4 text-sm text-white">
        © 2026 Flood Rescue Support System | All rights reserved
      </div>
    </footer>
  );
}