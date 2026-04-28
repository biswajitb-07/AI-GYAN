const RecentToolsTable = ({ tools = [] }) => {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold text-white">Recent additions</h3>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Tool</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Pricing</th>
              <th className="pb-3 font-medium">Featured</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool._id} className="border-t border-white/10 text-slate-200">
                <td className="py-3">{tool.name}</td>
                <td className="py-3">{tool.category}</td>
                <td className="py-3">{tool.pricing}</td>
                <td className="py-3">{tool.featured ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentToolsTable;
