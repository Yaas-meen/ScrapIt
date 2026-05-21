import { Link }   from 'react-router-dom';
import { Recycle } from 'lucide-react';

export default function Logo({
  to        = '/',
  size      = 'md',
  showText  = true,
  className = '',
}) {
  const sizes = {
    sm: { icon: 14, text: 'text-sm',    box: 'w-7 h-7 rounded-lg'  },
    md: { icon: 18, text: 'text-base',  box: 'w-9 h-9 rounded-xl'  },
    lg: { icon: 24, text: 'text-xl',    box: 'w-12 h-12 rounded-2xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 no-underline ${className}`}
    >
      <div className={`${s.box} bg-eco-100 text-eco-700
        grid place-items-center shrink-0`}>
        <Recycle size={s.icon} />
      </div>
      {showText && (
        <span className={`font-bold text-ink-800 ${s.text}`}>
          ScrapIt
        </span>
      )}
    </Link>
  );
}