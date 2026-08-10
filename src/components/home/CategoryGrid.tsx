import Link from "next/link";
import * as Icons from "lucide-react";
import { Package } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryTreeDTO } from "@/types/catalog";

/**
 * Icons are stored as a lucide export name (`Category.iconKey`) so the admin
 * can pick one without a deploy. Anything unrecognised falls back to Package.
 */
function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Resolved =
    (name && (Icons as unknown as Record<string, React.ElementType>)[name]) || Package;
  return <Resolved className={className} aria-hidden />;
}

export function CategoryGrid({ categories }: { categories: CategoryTreeDTO[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className={cn(
            "group flex flex-col rounded-xl border border-line bg-white p-5 shadow-sm",
            "transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg active:scale-[0.98]",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <CategoryIcon name={cat.iconKey} className="size-5" />
          </span>

          <h3 className="mt-4 text-sm font-semibold text-ink transition-colors group-hover:text-brand sm:text-base">
            {cat.name}
          </h3>

          {cat.children.length > 0 ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted">
              {cat.children.map((c) => c.name).join(" · ")}
            </p>
          ) : cat.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {cat.description}
            </p>
          ) : null}

          <p className="mt-3 text-[11px] font-medium text-faint">
            {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
          </p>
        </Link>
      ))}
    </div>
  );
}
