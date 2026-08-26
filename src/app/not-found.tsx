import { Compass } from "lucide-react";

import { NotFoundPage } from "@/components/shared/NotFoundPage";

export default function NotFound() {
  return (
    <NotFoundPage
      icon={<Compass className="size-7" aria-hidden />}
      title="We can't find that page"
      description="The link may be out of date, or the page may have been renamed. Try the catalogue, and if you know what you need, just message us."
    />
  );
}
