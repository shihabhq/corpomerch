import * as Icons from "lucide-react";
import { Circle } from "lucide-react";

import { HOW_IT_WORKS } from "@/data/site";

function StepIcon({ name }: { name: string }) {
  const Resolved =
    (Icons as unknown as Record<string, React.ElementType>)[name] || Circle;
  return <Resolved className="size-5" aria-hidden />;
}

export function HowItWorks() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {HOW_IT_WORKS.map((step, i) => (
        <li
          key={step.title}
          className="relative rounded-xl border border-line bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-ink text-white">
              <StepIcon name={step.icon} />
            </span>
            <span className="text-3xl font-semibold tabular-nums text-line-strong">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-4 text-base font-semibold text-ink">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>

          {/* Connector on the widest layout only. */}
          {i < HOW_IT_WORKS.length - 1 ? (
            <span
              className="absolute -right-2 top-11 hidden h-px w-4 bg-line-strong lg:block"
              aria-hidden
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
