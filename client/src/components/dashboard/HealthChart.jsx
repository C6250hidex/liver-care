import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const HealthChart = ({ data }) => {
  // data should be an array of { logged_at, fever }
  const formattedData = data
    .map((item) => ({
      date: new Date(item.logged_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      temp: parseFloat(item.fever),
    }))
    .reverse();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: "bold" }}
          />
          <YAxis domain={[35, 41]} hide />
          <Tooltip
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#0284c7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTemp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
