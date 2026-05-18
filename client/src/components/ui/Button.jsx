import { Loader2 } from 'lucide-react';

const V = {
  primary:  'bg-eco-600 hover:bg-eco-700 text-white border-transparent',
  secondary:'bg-white hover:bg-ink-50 text-ink-700 border-ink-200',
  danger:   'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost:    'bg-transparent hover:bg-ink-100 text-ink-600 border-transparent',
};
const S = { sm:'h-8 px-3 text-xs', md:'h-10 px-4 text-sm', lg:'h-11 px-5 text-sm' };

export default function Button({
  children, variant='primary', size='md',
  loading=false, disabled=false, icon:Icon,
  onClick, type='button', className='',
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold
        rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed
        ${V[variant]} ${S[size]} ${className}`}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
      {children}
    </button>
  );
}