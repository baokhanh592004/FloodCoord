import { createElement } from 'react';
import { Package } from 'lucide-react';

export default function EmptyState({
  onAdd,
  title,
  description,
  buttonText,
  icon = Package,
}) {
  const iconElement = createElement(icon, { size: 36, className: 'text-accent' });

  return (
    <div className="text-center py-20 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
      {/* Icon ring */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-100 bg-accent-50">
        {iconElement}
      </div>

      {/* Text */}
      <h3 className="mb-2 font-condensed text-xl font-bold text-navy-dark">
        {title || 'Chưa có dữ liệu'}
      </h3>
      <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-neutral-400">
        {description || 'Chưa có dữ liệu nào được ghi nhận. Hãy thêm mới để bắt đầu.'}
      </p>

      {/* CTA button */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/35"
        >
          {buttonText || '+ Thêm mới'}
        </button>
      )}
    </div>
  );
}