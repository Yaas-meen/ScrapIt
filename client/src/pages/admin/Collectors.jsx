import { useEffect, useMemo, useState } from 'react';
import { Plus, Power, Loader2, AlertTriangle } from 'lucide-react';
import { collectorApi } from '../../api/collectorApi';
import Avatar from '../../components/ui/Avater';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchInput from '../../components/ui/SearchInput';
import PageHeader from '../../components/shared/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';

export default function AdminCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const addModal = useModal();

  const load = async () => {
    setLoading(true);
    try {
      const data = await collectorApi.list({ search: q });
      setCollectors(Array.isArray(data) ? data : data?.collectors || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load collectors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const handleToggle = async (c) => {
    setBusyId(c._id);
    try {
      await collectorApi.update(c._id, { isActive: !c.isActive });
      setCollectors((list) => list.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x)));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update collector');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Collectors"
        subtitle="Manage field collectors, vehicles, and account status."
        action={
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, email…" className="w-full sm:w-64" />
            <Button icon={Plus} onClick={() => addModal.open()}>Add collector</Button>
          </div>
        }
      />

      {error && (
        <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink-500 bg-ink-50/60">
              <tr>
                <th className="text-left p-3 pl-5 font-medium">Collector</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Active pickups</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 pr-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-sm text-ink-400">Loading…</td></tr>}
              {!loading && collectors.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-sm text-ink-400">No collectors match.</td></tr>
              )}
              {collectors.map((c) => (
                <tr key={c._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.fullName} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-ink-800">{c.fullName}</div>
                        <div className="text-xs text-ink-500">{c.totalCompleted || 0} completed</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink-700">{c.email}</td>
                  <td className="p-3 text-ink-700">{c.phone || '—'}</td>
                  <td className="p-3 tabular-nums">{c.activePickups || 0}</td>
                  <td className="p-3">
                    <Badge color={c.isActive ? 'green' : 'gray'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="p-3 pr-5 text-right">
                    <button
                      onClick={() => handleToggle(c)}
                      disabled={busyId === c._id}
                      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                        c.isActive
                          ? 'text-red-700 hover:bg-red-50 border border-red-200'
                          : 'text-eco-700 hover:bg-eco-50 border border-eco-200'
                      }`}
                    >
                      {busyId === c._id ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                      {c.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCollectorModal
        open={addModal.isOpen}
        onClose={addModal.close}
        onCreated={(c) => setCollectors((list) => [c, ...list])}
      />
    </div>
  );
}

function AddCollectorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const reset = () => { setForm({ fullName: '', email: '', phone: '', password: '' }); setError(null); };

  const valid =
    form.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.phone.replace(/[^0-9]/g, '').length >= 10 &&
    form.password.length >= 6;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const created = await collectorApi.create(form);
      onCreated?.(created);
      reset();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create collector');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add a new collector"
      subtitle="Creates a collector account that can sign in via /collector/login."
      footer={
        <>
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={submit} loading={submitting} disabled={!valid}>Create collector</Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && (
          <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2">{error}</div>
        )}
        <Field label="Full name">
          <input type="text" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })}
            placeholder="Chidi Eze" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })}
              placeholder="chidi@scrapit.io" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })}
              placeholder="+234..." className={inputCls} />
          </Field>
        </div>
        <Field label="Temporary password" hint="6+ characters; collector should change on first login">
          <input type="text" value={form.password} onChange={(e) => set({ password: e.target.value })}
            placeholder="••••••••" className={`${inputCls} font-mono`} />
        </Field>
      </div>
    </Modal>
  );
}

const inputCls =
  'w-full h-11 rounded-xl border border-ink-200 px-3 text-sm bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-800">{label}</span>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}