import Image from "next/image";

import { CLIENTS } from "@/data/site";

/**
 * Plain logo row — no card, no border, no motion. Every logo renders at the
 * same fixed height with its real (trimmed) aspect ratio, so marks with very
 * different canvas sizes still read as "the same size" the way a logo strip
 * should. See the CLIENTS comment in data/site.ts for why the source images
 * needed trimming first.
 */
export function ClientLogos() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
      {CLIENTS.map((client) => (
        <li key={client.name} className="flex h-10 items-center sm:h-12">
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
  );
}
