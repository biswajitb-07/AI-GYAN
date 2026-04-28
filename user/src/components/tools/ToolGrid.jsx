import EmptyState from "../shared/EmptyState";
import SkeletonCard from "../shared/SkeletonCard";
import ToolCard from "./ToolCard";

const ToolGrid = ({ tools = [], loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!tools.length) {
    return <EmptyState title="No tools matched your filters" description="Try a different category, pricing type, or search term to discover more AI products." />;
  }

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool._id || tool.slug} tool={tool} />
      ))}
    </div>
  );
};

export default ToolGrid;
