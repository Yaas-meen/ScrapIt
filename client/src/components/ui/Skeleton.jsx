export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-ink-100 rounded-xl ${className}`}
      aria-hidden="true" />
  );
}