import { useState } from 'react';

export default function AddressForm({
  defaultAddress,
  pickupDate,
  onPickupDateChange,
  onAddressChange,
}) {
  const [useDefault, setUseDefault] = useState(true);
  const [address, setAddress]       = useState('');

  const handleUseDefault = (val) => {
    setUseDefault(val);
    onAddressChange(val ? defaultAddress : address);
  };

  const handleAddress = (val) => {
    setAddress(val);
    onAddressChange(val);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-ink-800">When and where?</h3>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-1.5">
          Pickup date
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={pickupDate}
          onChange={(e) => onPickupDateChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-ink-200 px-3
            text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
            outline-none"
        />
      </div>

      {/* Address */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => handleUseDefault(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300 text-eco-600
              focus:ring-eco-500"
          />
          <span className="text-sm font-medium text-ink-800">
            Use my default address
          </span>
        </label>

        {useDefault ? (
          <div className="p-3 rounded-xl bg-ink-50 border border-ink-200
            text-sm text-ink-700">
            {defaultAddress || (
              <span className="text-ink-400 italic">
                No default address — set one in Profile.
              </span>
            )}
          </div>
        ) : (
          <textarea
            rows={2}
            value={address}
            onChange={(e) => handleAddress(e.target.value)}
            placeholder="Enter full pickup address"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5
              text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
              outline-none resize-none"
          />
        )}
      </div>
    </div>
  );
}