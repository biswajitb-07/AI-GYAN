const StatCard = ({ label, value, tone = "sky" }) => {
  const toneMap = {
    sky: "from-sky-500/20 to-cyan-400/5 border-sky-400/20",
    emerald: "from-emerald-500/20 to-lime-400/5 border-emerald-400/20",
    violet: "from-violet-500/20 to-indigo-400/5 border-violet-400/20",
    amber: "from-amber-500/20 to-orange-400/5 border-amber-400/20",
  };

  return (
    <div className={`rounded-[1.8rem] border bg-gradient-to-br p-5 ${toneMap[tone]}`}>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
};

export default StatCard;
