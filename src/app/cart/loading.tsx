import { Container, Skeleton } from "@/components/ui";

/** /cart has no 404-capable descendants, so a skeleton is safe here. */
export default function Loading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-8 w-52" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </Container>
  );
}
