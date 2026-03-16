import { useMemo, type ReactNode } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#ea580c', '#f97316', '#0891b2', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  data: Array<Record<string, unknown>>;
}

type ParsedPart = { type: 'text'; content: string } | { type: 'chart'; data: ChartData };

function parseCharts(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const chartRegex = /```chart\s*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = chartRegex.exec(content)) !== null) {
    // Text before chart
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    // Parse chart JSON
    try {
      const chartData = JSON.parse(match[1].trim()) as ChartData;
      parts.push({ type: 'chart', data: chartData });
    } catch {
      // If JSON parse fails, treat as text
      parts.push({ type: 'text', content: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
}

function RenderChart({ chart }: { chart: ChartData }) {
  const { type, title, data } = chart;

  return (
    <div className="my-6 p-4 bg-white border rounded-xl shadow-sm">
      {title && <h4 className="text-sm font-semibold text-center mb-3 text-gray-700">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0] as [number, number, number, number]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2.5} dot={{ fill: '#ea580c', r: 4 }} />
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#ea580c" fill="#ea580c" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={data}>
            <Bar dataKey="value" fill="#ea580c" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

interface ChartRendererProps {
  content: string;
  renderText: (text: string) => ReactNode;
}

export function ChartRenderer({ content, renderText }: ChartRendererProps) {
  const parts = useMemo(() => parseCharts(content), [content]);

  return (
    <>
      {parts.map((part, index) => (
        part.type === 'chart' ? (
          <RenderChart key={index} chart={part.data} />
        ) : (
          <div key={index}>{renderText(part.content)}</div>
        )
      ))}
    </>
  );
}

export { parseCharts };
