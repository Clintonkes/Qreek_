import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function fmtNGN(v) {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  return `₦${v.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem', fontSize: '0.82rem',
    }}>
      <div style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {fmtNGN(payload[0].value)}
      </div>
    </div>
  );
}

export default function PortfolioChart({ totalNGN = 0 }) {
  const data = useMemo(() => {
    const points = 12;
    const seed = totalNGN || 100_000;
    return Array.from({ length: points }, (_, i) => ({
      label: `${i + 1}`,
      value: Math.max(0, seed * (0.85 + Math.sin(i * 0.8) * 0.1 + (i / points) * 0.15)),
    }));
  }, [totalNGN]);

  return (
    <div style={{ width: '100%', height: 120 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="value"
            stroke="var(--teal)" strokeWidth={2}
            fill="url(#portfolioGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
