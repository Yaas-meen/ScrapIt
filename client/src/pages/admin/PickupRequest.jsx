
import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, MapPin, Calendar, Scale, User as UserIcon, AlertTriangle, Check, X, UserCog } from 'lucide-react';
import { usePickupStore } from '../../store/usePickupStore';
import { mockCollectors, findMockCollectorById } from '../../mock/mockCollectors';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { calculatePoints } from '../../utils/calculatePoints';

const STATUS_TABS = [
  { value: null, label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
];

const WORKLOAD_WARNING_THRESHOLD = 5;

export default function PickupRequests() {
  const pickups = usePickupStore((s) => s.pickups);
  const fetchAllPickups = usePickupStore((s) => s.fetchAllPickups);
  const isLoading = usePickupStore((s) => s.isLoading);

  const [statusFilter, setStatusFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchAllPickups();
  }, [fetchAllPickups]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pickups
      .filter((p) => (statusFilter ? p.status === statusFilter : true))
      .filter((p) => {
        if (!q) return true;
        return (
          p.id.toLowerCase().includes(q) ||
          (p.userName || '').toLowerCase().includes(q) ||
          (p.address || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [pickups, statusFilter, search]);

  const counts = useMemo(() => {
    const c = { all: pickups.length };
    pickups.forEach((p) => {
      c[p.status] = (c[p.status] || 0) + 1;
    });
    return c;
  }, [pickups]);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-800">Pickup requests</h1>
          <p className="text-sm text-ink-500 mt-1">Review, approve, assign, or reject pickups.</p>
        </div>
        <div className="text-xs text-ink-500 inline-flex items-center gap-1.5">
          <Filter size={14} /> {filtered.length} of {pickups.length}
        </div>
      </header>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-ink-100 rounded-xl">
          {STATUS_TABS.map((t) => {
            const active = statusFilter === t.value;
            const count = t.value === null ? counts.all : counts[t.value] || 0;
            return (
              <button
                key={t.label}
                onClick={() => setStatusFilter(t.value)}
                className={`px-3 h-8 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                  active ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                {t.label}
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    active ? 'bg-eco-100 text-eco-700' : 'bg-ink-200 text-ink-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, user, address…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink-500 bg-ink-50/60">
              <tr>
                <th className="text-left p-3 pl-5 font-medium">ID</th>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Waste</th>
                <th className="text-left p-3 font-medium">Weight</th>
                <th className="text-left p-3 font-medium">Scheduled</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 pr-5 font-medium">Collector</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-ink-400">
                    Loading pickups…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-sm text-ink-400">
                    No pickups match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const collector = p.collectorId ? findMockCollectorById(p.collectorId) : null;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 cursor-pointer"
                  >
                    <td className="p-3 pl-5 font-mono text-xs text-ink-600">{p.id}</td>
                    <td className="p-3 text-ink-700">{p.userName}</td>
                    <td className="p-3 text-ink-700 capitalize">{p.wasteType}</td>
                    <td className="p-3 text-ink-700 tabular-nums">{p.weight} kg</td>
                    <td className="p-3 text-ink-600">{formatDate(p.scheduledFor)}</td>
                    <td className="p-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3 pr-5 text-ink-600">
                      {collector ? collector.name : <span className="text-ink-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PickupDetailModal
        pickup={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function PickupDetailModal({ pickup, onClose }) {
  const approvePickup = usePickupStore((s) => s.approvePickup);
  const rejectPickup = usePickupStore((s) => s.rejectPickup);
  const assignCollector = usePickupStore((s) => s.assignCollector);
  const selected = usePickupStore((s) => s.selected);

  // Prefer the live store record so the modal updates after mutations
  const live = selected?.id === pickup?.id ? selected : pickup;

  const [assigning, setAssigning] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);

  if (!pickup) return null;

  const collector = live.collectorId ? findMockCollectorById(live.collectorId) : null;
  const canApprove = live.status === 'Pending';
  const canReject = live.status === 'Pending';
  const canAssign = live.status === 'Approved' || live.status === 'Pending';

  const wrap = async (fn) => {
    setWorking(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e?.message || 'Action failed');
    } finally {
      setWorking(false);
    }
  };

  const handleApprove = () =>
    wrap(async () => {
      await approvePickup(live.id, assigning ? { collectorId: assigning } : {});
      onClose?.();
    });

  const handleReject = () =>
    wrap(async () => {
      if (!rejectReason.trim()) {
        setError('Please enter a rejection reason.');
        return;
      }
      await rejectPickup(live.id, rejectReason.trim());
      onClose?.();
    });

  const handleAssign = () =>
    wrap(async () => {
      if (!assigning) {
        setError('Pick a collector first.');
        return;
      }
      await assignCollector(live.id, assigning);
      onClose?.();
    });

  return (
    <Modal
      open={!!pickup}
      onClose={onClose}
      size="lg"
      title={`Pickup ${live.id}`}
      subtitle={`${live.userName} · scheduled ${formatDate(live.scheduledFor)}`}
      footer={
        <div className="flex items-center gap-2 w-full justify-between flex-wrap">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100"
          >
            Close
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {canReject && !rejectMode && (
              <button
                onClick={() => setRejectMode(true)}
                disabled={working}
                className="h-10 px-4 rounded-xl text-sm font-semibold border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {canAssign && !canApprove && (
              <button
                onClick={handleAssign}
                disabled={working || !assigning}
                className="h-10 px-4 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                Assign collector
              </button>
            )}
            {canApprove && (
              <button
                onClick={handleApprove}
                disabled={working}
                className="h-10 px-4 rounded-xl text-sm font-semibold bg-eco-600 hover:bg-eco-700 text-white disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Check size={16} /> Approve {assigning ? '& assign' : ''}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <StatusBadge status={live.status} size="md" />

        {error && (
          <div className="text-xs rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 flex items-start gap-1.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <DT icon={UserIcon} label="Requester" value={live.userName} sub={live.userPhone} />
          <DT icon={Calendar} label="Scheduled" value={formatDate(live.scheduledFor)} sub={`Submitted ${formatDateTime(live.createdAt)}`} />
          <DT icon={Scale} label="Waste" value={`${live.wasteType} · ${live.weight} kg`} sub={`Est. ${calculatePoints(live.wasteType, live.weight)} pts`} />
          <DT icon={MapPin} label="Pickup address" value={live.address} />
        </dl>

        {live.imageUrls?.length > 0 && (
          <div>
            <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
              Submitted images
            </div>
            <div className="flex gap-2 flex-wrap">
              {live.imageUrls.map((url, i) => (
                <a
                  key={url + i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-24 h-24 rounded-xl bg-ink-100 border border-ink-200 overflow-hidden hover:opacity-90"
                >
                  <img src={url} alt={`Pickup ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {live.notes && (
          <div className="text-sm text-ink-700 bg-ink-50 rounded-xl p-3 border border-ink-100">
            <span className="font-medium text-ink-800">Note: </span>
            {live.notes}
          </div>
        )}

        {live.rejectionReason && (
          <div className="text-sm text-red-700 bg-red-50 rounded-xl p-3 border border-red-200">
            <span className="font-medium">Rejection reason: </span>
            {live.rejectionReason}
          </div>
        )}

        {/* Reject form */}
        {rejectMode && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3">
            <div className="text-sm font-semibold text-red-700">Reject pickup</div>
            <textarea
              rows={3}
              autoFocus
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this pickup is being rejected (will be shown to the user)."
              className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setRejectMode(false);
                  setRejectReason('');
                }}
                className="h-9 px-3 rounded-lg text-sm font-medium text-ink-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={working || !rejectReason.trim()}
                className="h-9 px-3 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <X size={14} /> Confirm reject
              </button>
            </div>
          </div>
        )}

        {/* Assign collector */}
        {!rejectMode && canAssign && (
          <CollectorPicker
            value={assigning || live.collectorId || ''}
            onChange={setAssigning}
            currentCollector={collector}
          />
        )}
      </div>
    </Modal>
  );
}

function DT({ icon: Icon, label, value, sub }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
        <Icon size={12} /> {label}
      </dt>
      <dd className="text-sm text-ink-800">{value}</dd>
      {sub && <div className="text-xs text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function CollectorPicker({ value, onChange, currentCollector }) {
  return (
    <div>
      <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <UserCog size={12} /> Assign collector
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {mockCollectors.map((c) => {
          const selected = value === c.id;
          const overloaded = c.assignedCount >= WORKLOAD_WARNING_THRESHOLD;
          const isCurrent = currentCollector?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={!c.active}
              onClick={() => onChange(c.id)}
              className={`text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                selected
                  ? 'border-eco-500 bg-eco-50'
                  : 'border-ink-200 bg-white hover:border-ink-300'
              } ${!c.active ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-700 grid place-items-center font-semibold text-xs">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-ink-800 truncate">{c.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      current
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-500 truncate">
                  {c.zone} · {c.assignedCount} active
                </div>
              </div>
              {overloaded && (
                <span
                  title={`High workload: ${c.assignedCount} active pickups`}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5"
                >
                  <AlertTriangle size={10} /> heavy
                </span>
              )}
              {!c.active && (
                <span className="text-[10px] font-semibold text-ink-500 bg-ink-100 rounded-full px-2 py-0.5">
                  inactive
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
