import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Clock, Check, Truck, CheckCircle2, XCircle, Users, UserCog, Activity, ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/shared/StatCard';
import StatsChartCard from '../../components/charts/StatsChartCard';
import PickupBarChart from '../../components/charts/PickupBarChart';
import PickupLineChart from '../../components/charts/PickupLineChart';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate, formatTimeAgo } from '../../utils/formatDate';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, acts] = await Promise.all([
          adminApi.dashboard(),
          adminApi.activity(10).catch(() => []),
        ]);
        if (cancelled) return;
        setData(dash);
        setActivity(Array.isArray(acts) ? acts : []);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const s = data?.stats || {};
  const weekly = (data?.weeklyTrend || []).map((d) => ({
    day: d.day,
    label: d.day,
    count: d.count,
  }));
  const byStatus = ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'].map((k) => ({
    label: k,
    count: s[k] || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Operations dashboard" subtitle="All requests, users and collectors at a glance." />

      {error && (
        <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2">{error}</div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : (
            <>
              <StatCard label="Total requests" value={s.totalPickups || 0} icon={Package} accent="eco" />
              <StatCard label="Pending" value={s.Pending || 0} icon={Clock} accent="gray" />
              <StatCard label="Approved" value={s.Approved || 0} icon={Check} accent="blue" />
              <StatCard label="In Progress" value={s['In Progress'] || 0} icon={Truck} accent="orange" />
              <StatCard label="Completed" value={s.Completed || 0} icon={CheckCircle2} accent="eco" />
              <StatCard label="Rejected" value={s.Rejected || 0} icon={XCircle} accent="red" />
              <StatCard label="Users" value={s.totalUsers || 0} icon={Users} accent="purple" />
              <StatCard label="Collectors" value={s.totalCollectors || 0} icon={UserCog} accent="gold" />
            </>
          )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StatsChartCard title="Pickups · last 7 days" subtitle="Daily count of new requests">
          {loading
            ? <Skeleton className="h-60 rounded-xl" />
            : <PickupLineChart data={weekly} xKey="day" yKey="count" />}
        </StatsChartCard>
        <StatsChartCard title="By status" subtitle="Snapshot across the queue">
          {loading
            ? <Skeleton className="h-60 rounded-xl" />
            : <PickupBarChart data={byStatus} />}
        </StatsChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-ink-100">
            <div>
              <h3 className="font-semibold text-ink-800">Recent pickup requests</h3>
              <p className="text-xs text-ink-500 mt-0.5">Last 10 across all users</p>
            </div>
            <Link to="/admin/pickup-requests" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-eco-700">
              Open requests <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-500 bg-ink-50/60">
                <tr>
                  <th className="text-left p-3 pl-5 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Weight</th>
                  <th className="text-left p-3 font-medium">Scheduled</th>
                  <th className="text-left p-3 pr-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="p-6 text-center text-sm text-ink-400">Loading…</td></tr>
                )}
                {!loading && data?.recentPickups?.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-sm text-ink-400">No pickups yet.</td></tr>
                )}
                {(data?.recentPickups || []).map((p) => (
                  <tr key={p._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                    <td className="p-3 pl-5 font-mono text-xs text-ink-600">
                      <Link to={`/admin/pickup-requests/${p._id}`} className="hover:text-eco-700">
                        PK-{p._id.toString().slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-3 text-ink-700">{p.user?.fullName || '—'}</td>
                    <td className="p-3 text-ink-700 tabular-nums">{p.totalWeight} kg</td>
                    <td className="p-3 text-ink-600">{formatDate(p.pickupDate)}</td>
                    <td className="p-3 pr-5"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
          <h3 className="font-semibold text-ink-800">Activity log</h3>
          <p className="text-xs text-ink-500 mt-0.5">Recent status changes</p>
          <ul className="mt-4 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              : activity.length === 0
                ? <p className="text-sm text-ink-400 text-center py-6">No activity yet.</p>
                : activity.map((a) => (
                  <li key={`${a.pickupId}-${a.timestamp}`} className="flex gap-3">
                    <span className="w-8 h-8 rounded-full bg-eco-50 text-eco-700 grid place-items-center shrink-0 mt-0.5">
                      <Activity size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700 leading-snug">
                        <span className="font-mono text-xs text-ink-500">{a.requestId}</span>{' '}
                        — {a.status}{a.changedByModel ? ` by ${a.changedByModel}` : ''}
                      </p>
                      <div className="text-xs text-ink-400 mt-0.5">{formatTimeAgo(a.timestamp)}</div>
                    </div>
                  </li>
                ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
