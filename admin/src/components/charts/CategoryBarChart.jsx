import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CategoryBarChart = ({ data }) => {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold text-white">Top categories</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="_id" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryBarChart;
