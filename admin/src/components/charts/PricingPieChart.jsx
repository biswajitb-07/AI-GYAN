import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#22c55e", "#38bdf8", "#f59e0b"];

const PricingPieChart = ({ data }) => {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold text-white">Pricing mix</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="_id" innerRadius={68} outerRadius={102}>
              {data.map((entry, index) => (
                <Cell key={entry._id} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PricingPieChart;
