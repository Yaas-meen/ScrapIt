import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function PickupLineChart({ data = [], xKey = 'day', yKey = 'count', color = '#d97706', height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, padding: '8px 12px' }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
