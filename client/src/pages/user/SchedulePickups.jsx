import { useState, useCallback } from 'react';
import { useNavigate }     from 'react-router-dom';
import { useDropzone }     from 'react-dropzone';
import {
  Plus, Trash2, Upload, ImageIcon,
  CheckCircle2, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { useAuthStore }   from '../../store/useAuthStore';
import { usePickupStore } from '../../store/usePickupStore';
import StepIndicator      from '../../components/ui/StepIndicator';
import Button             from '../../components/ui/Button';
import { WASTE_TYPES }    from '../../constants/wasteTypes';
import { calculatePoints, calculateTotalPoints } from '../../utils/calculatePoints';
import { toDateInputValue, todayISO } from '../../utils/formatDate';
import { formatPoints }   from '../../utils/formatCurrency';

const STEPS = ['Waste details', 'Pickup info', 'Upload image', 'Review'];

const blankItem = () => ({ type: '', weight: '' });

export default function SchedulePickup() {
  const navigate       = useNavigate();
  const user           = useAuthStore((s) => s.user);
  const createPickup   = usePickupStore((s) => s.createPickup);
  const isLoading      = usePickupStore((s) => s.isLoading);

  const [step,         setStep]         = useState(0);
  const [wasteItems,   setWasteItems]   = useState([blankItem()]);
  const [pickupDate,   setPickupDate]   = useState('');
  const [useDefault,   setUseDefault]   = useState(true);
  const [address,      setAddress]      = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError,   setImageError]   = useState('');
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState('');

  const defaultAddress = user?.address || user?.defaultAddress || '';

  const addItem = () => setWasteItems((p) => [...p, blankItem()]);

  const removeItem = (i) =>
    setWasteItems((p) => p.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) =>
    setWasteItems((p) =>
      p.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );

  const validItems = wasteItems.filter(
    (it) => it.type && Number(it.weight) > 0
  );

  const totalPts = calculateTotalPoints(
    validItems.map((it) => ({ type: it.type, weight: it.weight }))
  );

  const onDrop = useCallback((accepted, rejected) => {
    setImageError('');
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') setImageError('File exceeds 5 MB.');
      else setImageError('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    const file = accepted[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const canNext = () => {
    if (step === 0) return validItems.length > 0;
    if (step === 1) return !!pickupDate;
    if (step === 2) return !!imageFile;
    return true;
  };

  const next = () => { if (canNext()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
  setError('');

  const finalAddress = useDefault ? defaultAddress : address.trim();

  if (!finalAddress) {
    setError('Please add a pickup address in your profile or enter one above.');
    return;
  }

  if (validItems.length === 0) {
    setError('Please add at least one waste item.');
    return;
  }

  try {
    await createPickup({
      userId:    user?.id,
      userName:  user?.name || user?.fullName,
      userPhone: user?.phone,
      wasteType:       validItems[0]?.type,
      weight:          Number(validItems[0]?.weight || 0),
      scheduledFor:    new Date(pickupDate).toISOString(),
      address:         finalAddress,
      imageUrls:       imagePreview ? [imagePreview] : [],
      estimatedPoints: totalPts,
      notes:           '',
      wasteItems: validItems.map((it) => ({
        type:   it.type.charAt(0).toUpperCase() + it.type.slice(1),
        weight: Number(it.weight),
      })),
      pickupDate: new Date(pickupDate).toISOString(),
      imageFile:  imageFile || undefined,
    });

    setSubmitted(true);
  } catch (err) {
    setError(err?.message || 'Failed to schedule pickup. Please try again.');
  }
};

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-eco-100 text-eco-600
          grid place-items-center mx-auto mb-5">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-ink-800 mb-2">
          Pickup scheduled!
        </h2>
        <p className="text-sm text-ink-500 mb-6">
          We'll notify you when your request is reviewed by the team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/pickups')}>
            View my pickups
          </Button>
          <Button variant="secondary"
            onClick={() => {
              setStep(0); setWasteItems([blankItem()]);
              setPickupDate(''); setImageFile(null);
              setImagePreview(null); setSubmitted(false);
            }}>
            Schedule another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Schedule a pickup</h1>
        <p className="text-sm text-ink-500 mt-1">
          Tell us what you're recycling and when.
        </p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">

        {/* ── Step 0: Waste Details ──────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-ink-800">
              What are you recycling?
            </h2>

            {wasteItems.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                {/* Type */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-ink-600 mb-1 block">
                    Waste type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(i, 'type', e.target.value)}
                    className="w-full h-11 rounded-xl border border-ink-200 px-3
                      text-sm bg-white focus:border-eco-500 focus:ring-2
                      focus:ring-eco-100 outline-none"
                  >
                    <option value="">Select type</option>
                    {WASTE_TYPES.map((w) => (
                      <option key={w.type} value={w.key}>
                        {w.icon} {w.type} — {w.rate} pts/kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div className="w-32">
                  <label className="text-xs font-medium text-ink-600 mb-1 block">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.weight}
                    onChange={(e) => updateItem(i, 'weight', e.target.value)}
                    placeholder="0.0"
                    className="w-full h-11 rounded-xl border border-ink-200 px-3
                      text-sm focus:border-eco-500 focus:ring-2
                      focus:ring-eco-100 outline-none"
                  />
                </div>

                {/* Remove */}
                {wasteItems.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="mt-6 p-2.5 rounded-xl border border-red-200
                      text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addItem}
              className="inline-flex items-center gap-2 text-sm font-medium
                text-eco-700 hover:text-eco-800"
            >
              <Plus size={16} /> Add another item
            </button>

            {/* Live points preview */}
            {validItems.length > 0 && (
              <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
                <p className="text-xs font-semibold text-gold-700 uppercase
                  tracking-wide mb-3">
                  Estimated reward
                </p>
                {validItems.map((it, i) => {
                  const pts = calculatePoints(it.type, it.weight);
                  return (
                    <div key={i}
                      className="flex justify-between text-sm text-ink-700 mb-1">
                      <span className="capitalize">
                        {it.type} — {it.weight} kg
                      </span>
                      <span className="font-medium text-gold-700">
                        {pts} pts
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-gold-200 mt-2 pt-2
                  flex justify-between font-bold text-ink-800">
                  <span>Total</span>
                  <span className="text-gold-700">{totalPts} pts</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  Step 1: Pickup Info  */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-ink-800">
              When and where?
            </h2>

            <div>
              <label className="text-sm font-medium text-ink-800 mb-1.5 block">
                Pickup date
              </label>
              <input
                type="date"
                min={todayISO()}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-ink-200 px-3
                  text-sm focus:border-eco-500 focus:ring-2
                  focus:ring-eco-100 outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={useDefault}
                  onChange={(e) => setUseDefault(e.target.checked)}
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
                      No default address set — go to Profile to add one.
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full pickup address"
                  className="w-full h-11 rounded-xl border border-ink-200 px-3
                    text-sm focus:border-eco-500 focus:ring-2
                    focus:ring-eco-100 outline-none"
                />
              )}
            </div>
          </div>
        )}

        {/*  Step 2: Upload Image  */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-ink-800">
              Upload a photo of your waste
            </h2>
            <p className="text-sm text-ink-500">
              A clear photo helps our team verify your pickup quickly.
            </p>

            {!imagePreview ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center
                  cursor-pointer transition
                  ${isDragActive
                    ? 'border-eco-500 bg-eco-50'
                    : 'border-ink-300 hover:border-eco-400 hover:bg-ink-50'}`}
              >
                <input {...getInputProps()} />
                <Upload
                  size={32}
                  className="mx-auto mb-3 text-ink-400"
                />
                <p className="text-sm font-medium text-ink-700">
                  {isDragActive
                    ? 'Drop it here!'
                    : 'Drag your image here or click to browse'}
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  JPG, PNG, WEBP · Max 5 MB
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border
                border-ink-200">
                <img
                  src={imagePreview}
                  alt="Waste preview"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-ink-900/40 flex items-end p-4">
                  <div className="flex items-center gap-3 w-full">
                    <ImageIcon size={16} className="text-white shrink-0" />
                    <p className="text-sm text-white font-medium flex-1 truncate">
                      {imageFile?.name}
                    </p>
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-white/80 hover:text-white text-xs
                        font-medium underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {imageError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200
                rounded-lg px-3 py-2">
                {imageError}
              </p>
            )}
          </div>
        )}

        {/*  Step 3: Review  */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-ink-800">Review your request</h2>

            {/* Waste items */}
            <div className="rounded-xl border border-ink-200 overflow-hidden">
              <div className="bg-ink-50 px-4 py-2.5 text-xs font-semibold
                text-ink-500 uppercase tracking-wide">
                Waste items
              </div>
              {validItems.map((it, i) => (
                <div key={i}
                  className="flex justify-between items-center px-4 py-3
                    border-t border-ink-100 first:border-0 text-sm">
                  <span className="capitalize text-ink-700">
                    {it.type} — {it.weight} kg
                  </span>
                  <span className="font-medium text-gold-700">
                    {calculatePoints(it.type, it.weight)} pts
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3
                border-t border-ink-200 bg-gold-50 text-sm font-bold">
                <span className="text-ink-800">Total estimate</span>
                <span className="text-gold-700">{totalPts} pts</span>
              </div>
            </div>

            {/* Pickup info */}
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-ink-500 w-24 shrink-0">Date</span>
                <span className="text-ink-800 font-medium">
                  {pickupDate
                    ? new Date(pickupDate).toLocaleDateString('en-NG', {
                        weekday: 'long', day: 'numeric',
                        month: 'long', year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-500 w-24 shrink-0">Address</span>
                <span className="text-ink-800 font-medium">
                  {useDefault ? defaultAddress : address}
                </span>
              </div>
              {imagePreview && (
                <div className="flex gap-3 items-start">
                  <span className="text-ink-500 w-24 shrink-0 mt-1">Image</span>
                  <img src={imagePreview}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-xl border
                      border-ink-200"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border
                border-red-200 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={back}
          disabled={step === 0}
          icon={ChevronLeft}
        >
          Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={next}
            disabled={!canNext()}
            icon={ChevronRight}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={isLoading}
          >
            Submit request
          </Button>
        )}
      </div>
    </div>
  );
}