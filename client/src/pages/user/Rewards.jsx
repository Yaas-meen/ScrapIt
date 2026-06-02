import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Eye, Smartphone, CreditCard } from 'lucide-react';
import { useAuthStore }   from '../../store/useAuthStore';
import { useRewardStore } from '../../store/useRewardStore';
import Button    from '../../components/ui/Button';
import Modal     from '../../components/ui/Modal';
import Skeleton  from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate }     from '../../utils/formatDate';
import { formatNumber, formatCurrency } from '../../utils/formatCurrency';

const TYPE_ICON = {
  airtime:  Smartphone,
  giftcard: CreditCard,
};

function RedemptionModal({ open, onClose }) {
  const user        = useAuthStore((s) => s.user);
  const catalog     = useRewardStore((s) => s.catalog);
  const redeem      = useRewardStore((s) => s.redeem);
  const isRedeeming = useRewardStore((s) => s.isRedeeming);
  const lastRedemption      = useRewardStore((s) => s.lastRedemption);
  const clearLastRedemption = useRewardStore((s) => s.clearLastRedemption);

  const [step,       setStep]       = useState(0);
  const [type,       setType]       = useState('');
  const [providerId, setProviderId] = useState('');
  const [denom,      setDenom]      = useState('');
  const [phone,      setPhone]      = useState(user?.phone || '');
  const [copied,     setCopied]     = useState(false);
  const [error,      setError]      = useState('');

  const reset = () => {
    setStep(0); setType(''); setProviderId('');
    setDenom(''); setPhone(user?.phone || '');
    setError(''); clearLastRedemption();
  };

  const handleClose = () => { reset(); onClose(); };

  const balance      = user?.points || 0;
  const cat          = catalog?.[type];
  const provider     = cat?.providers?.find((p) => p.id === providerId);
  const denomination = cat?.denominations?.find((d) => d.value === Number(denom));

  const canProceed = () => {
    if (step === 0) return !!type;
    if (step === 1) return !!providerId && !!denom;
    return true;
  };

  const handleRedeem = async () => {
    setError('');
    try {
      await redeem({ type, providerId, denomination: Number(denom), phone });
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Redemption failed');
    }
  };

  const copyCode = () => {
    if (!lastRedemption?.code) return;
    navigator.clipboard.writeText(lastRedemption.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={step < 3 ? 'Redeem reward' : 'Redemption successful!'}
      footer={
        step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Continue
          </Button>
        ) : step === 2 ? (
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleRedeem} loading={isRedeeming} className="flex-1">
              Confirm redemption
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleClose}>Done</Button>
        )
      }
    >

      {/* Step 0 — Choose type */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-ink-500 mb-4">
            Your balance:{' '}
            <strong className="text-ink-800">{formatNumber(balance)} pts</strong>
          </p>
          {Object.entries(catalog || {}).map(([key, cat]) => {
            const locked = balance < cat.minPoints;
            const Icon   = TYPE_ICON[key] || Gift;
            return (
              <button
                key={key}
                onClick={() => !locked && setType(key)}
                disabled={locked}
                className={`w-full text-left p-4 rounded-xl border-2 transition
                  ${type === key
                    ? 'border-eco-500 bg-eco-50'
                    : locked
                      ? 'border-ink-200 bg-ink-50 opacity-50 cursor-not-allowed'
                      : 'border-ink-200 hover:border-eco-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-eco-100 text-eco-700
                    grid place-items-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-800">{cat.label}</p>
                    <p className="text-xs text-ink-500">
                      Min {formatNumber(cat.minPoints)} pts
                      {locked && ' — insufficient balance'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1 — Choose provider + denomination */}
      {step === 1 && cat && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-ink-700 mb-3">
              Choose provider
            </p>
            <div className="grid grid-cols-2 gap-2">
              {cat.providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProviderId(p.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold
                    transition
                    ${providerId === p.id
                      ? 'border-eco-500 bg-eco-50 text-eco-700'
                      : 'border-ink-200 hover:border-ink-300 text-ink-700'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-700 mb-3">
              Choose amount
            </p>
            <div className="space-y-2">
              {cat.denominations.map((d) => {
                const locked = balance < d.cost;
                return (
                  <button
                    key={d.value}
                    onClick={() => !locked && setDenom(String(d.value))}
                    disabled={locked}
                    className={`w-full flex justify-between items-center p-3
                      rounded-xl border-2 text-sm transition
                      ${denom === String(d.value)
                        ? 'border-eco-500 bg-eco-50'
                        : locked
                          ? 'border-ink-200 opacity-40 cursor-not-allowed'
                          : 'border-ink-200 hover:border-ink-300'}`}
                  >
                    <span className="font-semibold text-ink-800">{d.label}</span>
                    <span className="text-ink-500 text-xs">
                      {formatNumber(d.cost)} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'airtime' && (
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full h-11 rounded-xl border border-ink-200 px-3
                  text-sm focus:border-eco-500 focus:ring-2
                  focus:ring-eco-100 outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 border border-ink-200 p-4
            space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Type</span>
              <span className="font-medium capitalize text-ink-800">{type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Provider</span>
              <span className="font-medium text-ink-800">{provider?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Value</span>
              <span className="font-medium text-ink-800">{denomination?.label}</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-3">
              <span className="text-ink-500">Points to deduct</span>
              <span className="font-bold text-red-600">
                −{formatNumber(denomination?.cost || 0)} pts
              </span>
            </div>
            {type === 'airtime' && phone && (
              <div className="flex justify-between">
                <span className="text-ink-500">Phone</span>
                <span className="font-medium text-ink-800">{phone}</span>
              </div>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200
              rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Step 3 — Success */}
      {step === 3 && lastRedemption && (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-eco-100 text-eco-600
            grid place-items-center mx-auto">
            <Gift size={24} />
          </div>
          <p className="text-sm text-ink-600">
            Your code is ready. Save it — it won't be shown again.
          </p>
          <div className="flex items-center gap-2 bg-ink-50 rounded-xl
            border border-ink-200 p-3">
            <code className="flex-1 font-mono text-sm text-ink-800
              tracking-widest text-center">
              {lastRedemption.code}
            </code>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg hover:bg-ink-200 text-ink-500
                transition shrink-0"
              aria-label="Copy code"
            >
              {copied
                ? <Check size={16} className="text-eco-600" />
                : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-ink-400">
            −{formatNumber(lastRedemption.pointsSpent)} pts deducted from your balance
          </p>
        </div>
      )}
    </Modal>
  );
}

export default function Rewards() {
  const user         = useAuthStore((s) => s.user);
  const history      = useRewardStore((s) => s.history);
  const fetchHistory = useRewardStore((s) => s.fetchHistory);
  const isLoading    = useRewardStore((s) => s.isLoading);
  const [modal,    setModal]    = useState(false);
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    const uid = user?.id || user?._id;
    if (uid) fetchHistory(uid);
  }, [user?.id, user?._id]);

  const balance = user?.points              || 0;
  const earned  = user?.pointsEarned        || user?.totalPointsEarned || 0;
  const spent   = user?.pointsSpent         || user?.totalPointsSpent  || 0;

  const toggleReveal = (id) =>
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Rewards</h1>
        <p className="text-sm text-ink-500 mt-1">
          Redeem your points for airtime and gift cards.
        </p>
      </div>

      {/* Points summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gold-500 text-white rounded-2xl p-5 shadow-soft">
          <p className="text-xs font-medium text-gold-100 uppercase tracking-wide mb-1">
            Current balance
          </p>
          <p className="text-3xl font-bold tabular-nums">{formatNumber(balance)}</p>
          <p className="text-sm text-gold-200 mt-0.5">points</p>
        </div>
        <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-1">
            Total earned
          </p>
          <p className="text-3xl font-bold text-eco-700 tabular-nums">
            {formatNumber(earned)}
          </p>
          <p className="text-sm text-ink-400 mt-0.5">points</p>
        </div>
        <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-1">
            Total redeemed
          </p>
          <p className="text-3xl font-bold text-ink-700 tabular-nums">
            {formatNumber(spent)}
          </p>
          <p className="text-sm text-ink-400 mt-0.5">points</p>
        </div>
      </div>

      {/* Redeem CTA */}
      <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm
        flex flex-col sm:flex-row items-start sm:items-center
        justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink-800">Ready to redeem?</h2>
          <p className="text-sm text-ink-500 mt-0.5">
            Min 500 pts for airtime · Min 1,000 pts for gift cards
          </p>
        </div>
        <Button icon={Gift} onClick={() => setModal(true)} disabled={balance < 500}>
          Redeem rewards
        </Button>
      </div>

      {/* History table */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm
        overflow-hidden">
        <div className="p-5 border-b border-ink-100">
          <h2 className="font-semibold text-ink-800">Redemption history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="text-left p-3 pl-5 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Provider</th>
                <th className="text-left p-3 font-medium">Value</th>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-right p-3 pr-5 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6">
                    <div className="space-y-2">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && history.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Gift}
                      title="No redemptions yet"
                      message="Earn points from pickups then redeem them here."
                    />
                  </td>
                </tr>
              )}
              {history.map((r) => {
                const id   = r._id || r.id;
                const show = revealed[id];
                return (
                  <tr key={id} className="border-b border-ink-100 last:border-0">
                    <td className="p-3 pl-5 text-ink-600">{formatDate(r.createdAt)}</td>
                    <td className="p-3 capitalize text-ink-700">{r.type}</td>
                    <td className="p-3 text-ink-700">{r.provider}</td>
                    <td className="p-3 font-medium text-ink-800">
                      {formatCurrency(r.value || r.nairaValue)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-ink-700">
                          {show
                            ? r.code
                            : `${(r.code || '????').slice(0, 4)}••••`}
                        </code>
                        <button
                          onClick={() => toggleReveal(id)}
                          className="text-ink-400 hover:text-ink-600"
                          aria-label={show ? 'Hide' : 'Reveal'}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 pr-5 text-right text-red-600 font-medium tabular-nums">
                      −{formatNumber(r.pointsSpent)} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RedemptionModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}