const Loader = ({ label = "Loading curated AI tools..." }) => {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="space-y-5 text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
        <p className="text-sm text-slate-300">{label}</p>
      </div>
    </div>
  );
};

export default Loader;
