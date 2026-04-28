import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCompareTools } from "../api/tools";
import SectionTitle from "../components/shared/SectionTitle";
import { getCompareSlugs } from "../utils/discoveryStorage";

const CompareToolsPage = () => {
  const [searchParams] = useSearchParams();
  const requestedSlugs = String(searchParams.get("slugs") || "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  const slugs = requestedSlugs.length ? requestedSlugs : getCompareSlugs();
  const [state, setState] = useState({
    tools: [],
    loading: true,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!slugs.length) {
        setState({ tools: [], loading: false });
        return;
      }

      setState((current) => ({ ...current, loading: true }));

      try {
        const tools = await fetchCompareTools(slugs);
        setState({ tools, loading: false });
      } catch {
        setState({ tools: [], loading: false });
      }
    };

    loadData();
  }, [slugs.join(",")]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        <SectionTitle
          eyebrow="Compare tools"
          title="Side-by-side tool comparison"
          description="Check category, pricing, traffic, ratings, and tags in one clean view."
        />

        {!state.loading && !state.tools.length ? (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg font-semibold text-white">No tools selected for compare</p>
            <p className="mt-3 text-sm text-slate-300">Add tools from cards or the detail page, then open compare.</p>
          </div>
        ) : null}

        {state.tools.length ? (
          <div className="overflow-x-auto rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-4 font-medium">Field</th>
                  {state.tools.map((tool) => (
                    <th key={tool.slug} className="pb-4 font-medium">
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[
                  ["Category", (tool) => tool.category],
                  ["Pricing", (tool) => tool.pricing],
                  ["Rating", (tool) => `${tool.rating}/5`],
                  ["Traffic", (tool) => tool.monthlyVisits],
                  ["Featured", (tool) => (tool.featured ? "Yes" : "No")],
                  ["Tags", (tool) => tool.tags.join(", ")],
                ].map(([label, formatter]) => (
                  <tr key={label} className="border-t border-white/10 align-top">
                    <td className="py-4 pr-4 font-semibold">{label}</td>
                    {state.tools.map((tool) => (
                      <td key={`${tool.slug}-${label}`} className="py-4 pr-6">
                        {formatter(tool)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-white/10 align-top">
                  <td className="py-4 pr-4 font-semibold">Action</td>
                  {state.tools.map((tool) => (
                    <td key={`${tool.slug}-action`} className="py-4 pr-6">
                      <Link
                        to={`/tools/${tool.slug}`}
                        className="inline-flex items-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                      >
                        View Tool
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CompareToolsPage;
