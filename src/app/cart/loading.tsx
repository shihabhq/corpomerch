import { Container } from "@/components/ui";

/** /cart has no 404-capable descendants, so a skeleton is safe here. */
export default function Loading() {
  return (
    <Container className="py-10">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-surface-alt" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-alt" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-surface-alt" />
      </div>
    </Container>
  );
}
