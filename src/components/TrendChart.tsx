import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

const MOCK_CHART_DATA: CashFlowData[] = [
  { month: 'Jan', income: 24000, expense: 11000, net: 13000 },
  { month: 'Feb', income: 29000, expense: 14000, net: 15000 },
  { month: 'Mar', income: 27000, expense: 13500, net: 13500 },
  { month: 'Apr', income: 34000, expense: 15200, net: 18800 },
  { month: 'May', income: 31000, expense: 12000, net: 19000 },
  { month: 'Jun', income: 38900, expense: 13620, net: 25280 }
];

export default function TrendChart({ type = 'cashflow' }: { type?: 'cashflow' | 'forecast' }) {
  if (type === 'forecast') {
    // Generate simple projection
    const forecastData = [
      { month: 'Jun (Now)', balance: 148500 },
      { month: 'Jul', balance: 167500 },
      { month: 'Aug', balance: 186000 },
      { month: 'Sep', balance: 201000 },
      { month: 'Oct', balance: 224000 },
      { month: 'Nov', balance: 248000 }
    ];

    return (
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#171717', 
                borderColor: '#262626', 
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#fff'
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Projected Balance']}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#balanceGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Cashflow Trend
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#171717', 
              borderColor: '#262626', 
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#fff'
            }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`]}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', color: '#9ca3af' }}
          />
          <Area 
            type="monotone" 
            name="Revenue / Inflow"
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#incomeGlow)" 
          />
          <Area 
            type="monotone" 
            name="Expenses / Outflow"
            dataKey="expense" 
            stroke="#f43f5e" 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#expenseGlow)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
