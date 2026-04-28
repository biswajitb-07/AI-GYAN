import { adsterraConfig } from "../../config/adsterra";

const AdsterraDirectLinkCard = () => {
  if (!adsterraConfig.directLinkUrl) {
    return null;
  }

  return (
    <div className="rounded-[1.8rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(15,23,42,0.78))] p-5 shadow-xl shadow-slate-950/20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">{adsterraConfig.directLinkLabel}</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{adsterraConfig.directLinkTitle}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">This promotional link may open third-party offers selected by the ad network.</p>
      <a
        href={adsterraConfig.directLinkUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
      >
        Open sponsored link
      </a>
    </div>
  );
};

export default AdsterraDirectLinkCard;
