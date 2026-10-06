import Image from "next/image";

import { CLIENTS } from "@/data/site";

/**
 * Plain logo row — no card, no border, no motion. Every logo renders at the
 * same fixed height with its real aspect ratio, so marks with different
 * canvas sizes still read as "the same size" the way a logo strip should.
 * Files in public/clients/ must be cropped tight (see data/site.ts).
 *
 * Split into two stacked rows so a wide desktop viewport reads as a
 * deliberate two-row grid rather than one long, sparse line. Each row still
 * wraps on its own on narrow screens, so mobile is unaffected.
 */
const half = Math.ceil(CLIENTS.length / 2);
const ROWS = [CLIENTS.slice(0, half), CLIENTS.slice(half)];

export function ClientLogos() {
  return (
    <div className="flex flex-col items-center gap-y-8 sm:gap-y-10">
      {ROWS.map((row, i) => (
        <ul
          key={i}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14"
        >
          {row.map((client) => (
            <li
              key={client.name}
              className={`flex items-center ${client.compact ? "h-8 sm:h-10" : "h-10 sm:h-12"}`}
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={client.width}
                height={client.height}
                className="h-full w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
