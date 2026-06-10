"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineProps {
  data: { value: number; period: string }[];
  color?: string;
}

export function Sparkline({ data, color = "#1d4ed8" }: SparklineProps) {
  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Tooltip
          contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 4 }}
          labelFormatter={(label) => `Period: ${label}`}
          formatter={(val) => [val, "Value"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
