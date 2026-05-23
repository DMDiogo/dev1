'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Point = { month: string; revenue: number }

export default function RevenueChart({ data }: { data: Point[] }) {
  const hasData = data.some((d) => d.revenue > 0)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
      <h3 className="font-display font-semibold text-white mb-1">
        Receita Mensal
      </h3>
      <p className="text-xs text-gray-500 mb-6">Últimos 6 meses (Kz)</p>
      {!hasData ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-gray-500">
          Ainda sem pedidos com receita registada.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString('pt-AO')} Kz`,
                'Receita',
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
