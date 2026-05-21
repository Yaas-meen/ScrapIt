import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avater';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import SearchInput from '../../components/ui/SearchInput';
import PageHeader from '../../components/shared/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { userApi } from '../../api/userApi';
import { adminApi } from '../../api/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';
import { formatDate, formatTimeAgo } from '../../utils/formatDate';
import { formatNumber } from '../../utils/formatCurrency';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const modal = useModal();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await userApi.list({ search: q });
        const list = Array.isArray(data) ? data : data?.users || [];
        if (!cancelled) setUsers(list);
      } catch {
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        subtitle="Manage end-user accounts and review their activity."
        action={<SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone…" className="w-full sm:w-72" />}
      />

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink-500 bg-ink-50/60">
              <tr>
                <th className="text-left p-3 pl-5 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Points</th>
                <th className="text-left p-3 pr-5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-ink-400">Loading users…</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-sm text-ink-400">No users match.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u._id} onClick={() => modal.open({ id: u._id })} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 cursor-pointer">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-ink-800">{u.fullName}</div>
                        <div className="text-xs text-ink-500 font-mono">{u._id?.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink-700">{u.email}</td>
                  <td className="p-3 text-ink-700">{u.phone || '—'}</td>
                  <td className="p-3 tabular-nums font-semibold text-ink-800">{formatNumber(u.points || 0)}</td>
                  <td className="p-3 pr-5 text-ink-600">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailModal open={modal.isOpen} onClose={modal.close} userId={modal.data?.id} />
    </div>
  );
}

function UserDetailModal({ open, onClose, userId }) {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return undefined;
    setLoading(true);
    adminApi.userSummary(userId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    return undefined;
  }, [open, userId]);

  return (
    <Modal open={open} onClose={onClose} size="xl"
      title={data?.user?.fullName || 'User detail'}
      subtitle={data ? `${data.user.email} · joined ${formatDate(data.user.createdAt)}` : ''}
    >
      <Tabs
        className="mb-5"
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'pickups', label: 'Pickups', count: data?.pickups?.length },
          { value: 'rewards', label: 'Rewards', count: data?.rewards?.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      {loading && <Skeleton className="h-40" />}
      {!loading && data && tab === 'overview' && <Overview summary={data.summary} user={data.user} />}
      {!loading && data && tab === 'pickups' && <PickupsList pickups={data.pickups} />}
      {!loading && data && tab === 'rewards' && <RewardsList rewards={data.rewards} />}
    </Modal>
  );
}

function Overview({ summary, user }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total pickups', value: summary?.totalPickups || 0 },
        { label: 'Completed', value: summary?.completedPickups || 0 },
        { label: 'Completion rate', value: `${summary?.completionRate || 0}%` },
        { label: 'Balance', value: formatNumber(summary?.currentBalance || 0) },
      ].map((s) => (
        <div key={s.label} className="bg-ink-50/60 rounded-xl border border-ink-100 p-3">
          <div className="text-[10px] uppercase tracking-wide font-medium text-ink-500">{s.label}</div>
          <div className="text-lg font-bold text-ink-800 tabular-nums">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function PickupsList({ pickups = [] }) {
  if (pickups.length === 0) return <p className="text-center text-sm text-ink-500 py-8">No pickups yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th className="text-left p-2 font-medium">ID</th>
            <th className="text-left p-2 font-medium">Weight</th>
            <th className="text-left p-2 font-medium">Scheduled</th>
            <th className="text-left p-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {pickups.map((p) => (
            <tr key={p._id} className="border-t border-ink-100">
              <td className="p-2 font-mono text-xs text-ink-600">PK-{p._id.slice(-6).toUpperCase()}</td>
              <td className="p-2 tabular-nums">{p.totalWeight} kg</td>
              <td className="p-2 text-ink-600">{formatDate(p.pickupDate)}</td>
              <td className="p-2"><StatusBadge status={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RewardsList({ rewards = [] }) {
  if (rewards.length === 0) return <p className="text-center text-sm text-ink-500 py-8">No redemptions.</p>;
  return (
    <ul className="divide-y divide-ink-100">
      {rewards.map((r) => (
        <li key={r._id} className="py-3 flex justify-between text-sm">
          <span>{r.provider} · ₦{formatNumber(r.nairaValue)} ({r.type})</span>
          <span className="text-ink-500">{formatTimeAgo(r.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}