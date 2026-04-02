import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import logo from '../assets/images/logo.png';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/request-rescue', label: 'Gửi yêu cầu cứu trợ' },
  { to: '/track-rescue', label: 'Tra cứu cứu hộ' },
];

const CONTACT_ITEMS = [
  { icon: Phone, text: 'Hotline: 1900 0000' },
  { icon: Mail, text: 'trungtamcuutrolulutTPHCM@gmail.com', longText: true },
  { icon: MapPin, text: 'Việt Nam' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">

      {/* Main grid */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-[2fr_1fr_1fr] lg:gap-12">

          {/* Column 1 — About */}
          <div>
            <div className="mb-4 flex items-center gap-3 sm:gap-4">
              <img
                alt="Logo"
                src={logo}
                className="h-10 w-10 rounded-full border-2 border-white/30 shadow-lg sm:h-11 sm:w-11"
              />
              <h3 className="font-condensed text-lg font-bold leading-snug text-accent sm:text-xl">
                Trung tâm cứu trợ lũ lụt TP.HCM
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-navy-200/75 sm:text-base">
              Hệ thống hỗ trợ điều phối cứu trợ và kết nối cộng đồng
              trong tình huống thiên tai, giúp phân bổ nguồn lực nhanh chóng và hiệu quả.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="mb-4 font-condensed text-lg font-bold text-navy-50">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-navy-200/75 transition-colors hover:text-accent sm:text-base"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Emergency Contact */}
          <div>
            <h3 className="mb-4 font-condensed text-lg font-bold text-navy-50">
              Liên hệ khẩn cấp
            </h3>
            <div className="space-y-3">
              {CONTACT_ITEMS.map(({ icon, text, longText }) => (
                <div
                  key={text}
                  className="flex items-start gap-2.5 text-sm text-navy-200/75 sm:text-base"
                >
                  <span className="shrink-0 pt-0.5 text-accent">
                    {React.createElement(icon, { size: 16 })}
                  </span>
                  <span className={longText ? 'break-all' : 'wrap-break-word'}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-navy-200/45 sm:px-6 sm:text-sm lg:px-16">
        © 2026 Flood Rescue Support System | All rights reserved
      </div>
    </footer>
  );
}