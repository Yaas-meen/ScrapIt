export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-ink-100 text-ink-400
          grid place-items-center mb-4">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-700 mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-ink-400 max-w-xs">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}