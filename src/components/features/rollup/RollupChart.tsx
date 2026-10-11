import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AuthorCount } from '../../../types/api';
export function RollupChart({ rows }: { rows: AuthorCount[] }) {
  return (
    <div
      className="chart"
      role="img"
      aria-label="Books per author; exact counts are listed in the table below"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 20, right: 15, left: -20, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(name) => (name.length > 20 ? `${name.slice(0, 18)}…` : name)}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              color: 'hsl(var(--foreground))',
            }}
            cursor={{ fill: 'hsl(var(--muted))' }}
          />
          <Bar
            dataKey="book-count"
            name="Books"
            fill="hsl(var(--primary))"
            radius={[5, 5, 0, 0]}
            maxBarSize={70}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
