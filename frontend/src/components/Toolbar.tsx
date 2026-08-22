import { Search } from "lucide-react";

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  groupBy?: { value: string; options: string[]; onChange: (v: string) => void };
  filter?: { value: string; options: string[]; onChange: (v: string) => void };
  sort?: { value: string; options: string[]; onChange: (v: string) => void };
}

export default function Toolbar({
  search,
  onSearchChange,
  placeholder = "Search…",
  groupBy,
  filter,
  sort,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="gt-input pl-10"
        />
      </div>
      {groupBy && (
        <select value={groupBy.value} onChange={(e) => groupBy.onChange(e.target.value)} className="gt-input w-auto">
          <option value="">Group by…</option>
          {groupBy.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      {filter && (
        <select value={filter.value} onChange={(e) => filter.onChange(e.target.value)} className="gt-input w-auto">
          <option value="">Filter…</option>
          {filter.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      {sort && (
        <select value={sort.value} onChange={(e) => sort.onChange(e.target.value)} className="gt-input w-auto">
          <option value="">Sort by…</option>
          {sort.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
