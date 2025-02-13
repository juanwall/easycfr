import { useEffect, useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import twColors from 'tailwindcss/colors';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

import { IAgency, IRegsByDate } from '@/lib/types';

interface IProps {
  regsByDate: IRegsByDate[];
  selectedAgencies: IAgency[];
  targetWord?: string;
}

const Chart = ({ regsByDate, selectedAgencies, targetWord }: IProps) => {
  const [formattedData, setFormattedData] = useState<
    Array<{ [key: string]: any }>
  >([]);
  const [colors, setColors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  const tailwindColors = [
    twColors.blue[300],
    twColors.gray[400],
    twColors.green[400],
    twColors.orange[300],
    twColors.red[500],
    twColors.indigo[400],
    twColors.stone[400],
  ];

  useEffect(() => {
    const newColors = { ...colors };
    const existingAgencies = Object.keys(newColors);

    const agenciesNeedingColors = selectedAgencies.filter(
      (agency) => !existingAgencies.includes(agency.name),
    );

    agenciesNeedingColors.forEach((agency) => {
      const usedColors = Object.values(newColors);
      const availableColor = tailwindColors.find(
        (color) => !usedColors.includes(color),
      );

      newColors[agency.name] =
        availableColor ||
        tailwindColors[existingAgencies.length % tailwindColors.length];
    });

    setColors(newColors);
  }, [selectedAgencies]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../lib/workers/chart-data-worker.ts', import.meta.url),
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      setFormattedData(e.data);
      setIsLoading(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    setIsLoading(true);
    workerRef.current.postMessage({
      regsByDate,
      selectedAgencies,
      targetWord,
    });
  }, [regsByDate, selectedAgencies, targetWord]);

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00Z`);
    return date
      .toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .replace(/(\w+)\s(\d+),\s(\d+)/, '$1. $2, $3');
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  const formatYAxisNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 px-4 py-2">
        {payload.map((entry: any) => (
          <div key={entry.value} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm text-[${entry.color}]`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={formattedData}
        margin={{
          top: 20,
          right: 30,
          left: 40,
          bottom: 5,
        }}
      >
        {isLoading && (
          <g className="relative">
            <foreignObject x="105" y="405" width="80" height="20">
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="w-4 h-4 text-gray-500 animate-spin mr-1" />
                <span className="text-gray-500 text-sm">Working...</span>
              </div>
            </foreignObject>
          </g>
        )}
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} dy={7} />
        <YAxis
          tickFormatter={formatYAxisNumber}
          label={{
            value: 'Word count',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
            dx: -20,
          }}
        />
        <Tooltip
          labelFormatter={formatDate}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const total = payload.reduce(
                (sum, entry) => sum + (entry.value as number),
                0,
              );
              return (
                <div className="bg-white border border-gray-200 p-2 shadow-md rounded-md">
                  <p className="font-medium">{formatDate(label)}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} className="text-sm">
                      <span style={{ color: entry.color }}>{entry.name}</span>:{' '}
                      {formatNumber(entry.value as number)}
                    </p>
                  ))}
                  <p className="text-sm font-medium border-t border-gray-200 mt-1 pt-1">
                    Total: {formatNumber(total)} words
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
        {selectedAgencies.map((agency) => (
          <Bar
            key={agency.name}
            dataKey={agency.name}
            stackId="a"
            fill={colors[agency.name]}
            maxBarSize={50}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
