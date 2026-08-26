import { Compass, Package, FolderOpen, Briefcase } from "lucide-react";

import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { ButtonLink } from "@/components/ui";

export function ProductNotFound() {
  return (
    <NotFoundPage
      icon={<Package className="size-7" aria-hidden />}
      title="Product not found"
      description="This product may have been removed, renamed, or is not published yet. Browse the catalogue or message us with what you need."
      actions={
        <>
          <ButtonLink href="/products">Browse all products</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Ask us directly
          </ButtonLink>
        </>
      }
    />
  );
}

export function CategoryNotFound() {
  return (
    <NotFoundPage
      icon={<FolderOpen className="size-7" aria-hidden />}
      title="Category not found"
      description="This category may have moved or been renamed. Browse the full catalogue to find what you are looking for."
      actions={
        <>
          <ButtonLink href="/products">Browse all products</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </>
      }
    />
  );
}

export function PortfolioNotFound() {
  return (
    <NotFoundPage
      icon={<Briefcase className="size-7" aria-hidden />}
      title="Case study not found"
      description="This portfolio item may have been removed or renamed. View our latest work or get in touch about your project."
      actions={
        <>
          <ButtonLink href="/portfolio">View portfolio</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Start a project
          </ButtonLink>
        </>
      }
    />
  );
}
