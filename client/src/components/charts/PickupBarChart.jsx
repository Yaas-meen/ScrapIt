import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function PickupBarChart({ data = [], color = '#059669', height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, padding: '8px 12px' }}
        />
        <Bar dataKey="count" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}