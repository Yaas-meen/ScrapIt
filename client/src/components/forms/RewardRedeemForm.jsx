import { useRewardStore }       from '../../store/useRewardStore';
import { useAuthStore }         from '../../store/useAuthStore';
import { formatNumber }         from '../../utils/formatCurrency';

export default function RewardRedeemForm({
  type,
  providerId,
  denomination,
  phone,
  onTypeChange,
  onProviderChange,
  onDenominationChange,
  onPhoneChange,
}) {
  const catalog  = useRewardStore((s) => s.catalog);
  const user     = useAuthStore((s) => s.user);
  const balance  = user?.points || 0;

  const cat     = catalog?.[type];
  const provObj = cat?.providers?.find((p) => p.id === providerId);

  return (
    <div className="space-y-5">
      {/* Balance */}
      <div className="rounded-xl bg-gold-50 border border-gold-200 p-4">
        <p className="text-xs text-gold-700 font-medium mb-0.5">
          Current balance
        </p>
        <p className="text-2xl font-bold text-gold-700 tabular-nums">
          {formatNumber(balance)} pts
        </p>
      </div>

      {/* Type selection */}
      <div>
        <p className="text-sm font-medium text-ink-800 mb-2">
          Reward type
        </p>
        <div className="space-y-2">
          {Object.entries(catalog || {}).map(([key, cat]) => {
            const locked = balance < cat.minPoints;
            return (
              <button
                key={key}
                type="button"
                onClick={() => !locked && onTypeChange(key)}
                disabled={locked}
                className={`w-full text-left p-4 rounded-xl border-2
                  transition flex items-center gap-3
                  ${type === key
                    ? 'border-eco-500 bg-eco-50'
                    : locked
                      ? 'border-ink-200 opacity-50 cursor-not-allowed'
                      : 'border-ink-200 hover:border-eco-300'}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-ink-800">{cat.label}</p>
                  <p className="text-xs text-ink-500">
                    Min {formatNumber(cat.minPoints)} pts
                    {locked && ' — insufficient balance'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider */}
      {cat && (
        <div>
          <p className="text-sm font-medium text-ink-800 mb-2">Provider</p>
          <div className="grid grid-cols-2 gap-2">
            {cat.providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProviderChange(p.id)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold
                  transition
                  ${providerId === p.id
                    ? 'border-eco-500 bg-eco-50 text-eco-700'
                    : 'border-ink-200 text-ink-700 hover:border-ink-300'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Denominations */}
      {cat && providerId && (
        <div>
          <p className="text-sm font-medium text-ink-800 mb-2">Amount</p>
          <div className="space-y-2">
            {cat.denominations.map((d) => {
              const locked = balance < d.cost;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => !locked && onDenominationChange(d.value)}
                  disabled={locked}
                  className={`w-full flex justify-between items-center p-3
                    rounded-xl border-2 text-sm transition
                    ${denomination === d.value
                      ? 'border-eco-500 bg-eco-50'
                      : locked
                        ? 'border-ink-200 opacity-40 cursor-not-allowed'
                        : 'border-ink-200 hover:border-ink-300'}`}
                >
                  <span className="font-semibold text-ink-800">{d.label}</span>
                  <span className="text-xs text-ink-500">
                    {formatNumber(d.cost)} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Phone (airtime only) */}
      {type === 'airtime' && providerId && denomination && (
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+234..."
            className="w-full h-11 rounded-xl border border-ink-200 px-3
              text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
              outline-none"
          />
        </div>
      )}
    </div>
  );
}