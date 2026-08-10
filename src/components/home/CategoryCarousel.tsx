"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import * as Icons from "lucide-react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { CategoryShowcaseDTO } from "@/types/catalog";

/** Same icon-name-to-component resolution as CategoryGrid — kept local since
 * it is the fallback tile here, not the primary visual. */
function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Resolved =
    (name && (Icons as unknown as Record<string, React.ElementType>)[name]) || Package;
  return <Resolved className={className} aria-hidden />;
}

export function CategoryCarousel({ categories }: { categories: CategoryShowcaseDTO[] }) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (categories.length === 0) return null;

  const loop = categories.length > 6;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-0 top-[calc(50%-1.25rem)] z-10 hidden size-11 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-body shadow-sm transition-all hover:border-brand/30 hover:text-brand md:flex"
        aria-label="Previous categories"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-0 top-[calc(50%-1.25rem)] z-10 hidden size-11 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-line bg-white text-body shadow-sm transition-all hover:border-brand/30 hover:text-brand md:flex"
        aria-label="Next categories"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={14}
        loop={loop}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{
          clickable: true,
          el: ".category-carousel-pagination",
          bulletClass:
            "size-1.5 rounded-full bg-line cursor-pointer transition-all",
          bulletActiveClass: "!w-5 !bg-brand",
        }}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 10 },
          480: { slidesPerView: 3, spaceBetween: 12 },
          768: { slidesPerView: 4, spaceBetween: 14 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
          1280: { slidesPerView: 6, spaceBetween: 18 },
        }}
        className="!pb-1"
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat.id} className="!h-auto py-1">
            <Link
              href={`/categories/${cat.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg active:scale-[0.98]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-white">
                {cat.image ? (
                  <Image
                    src={cat.image.url}
                    alt={cat.image.alt}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 20vw, 33vw"
                    placeholder={cat.image.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={cat.image.blurDataUrl ?? undefined}
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-brand-tint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      <CategoryIcon name={cat.iconKey} className="size-6" />
                    </span>
                  </span>
                )}
              </div>

              <div className="border-t border-line px-3 py-3 text-center">
                <h3 className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-faint">
                  {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="category-carousel-pagination mt-4 flex items-center justify-center gap-1.5 md:hidden" />
    </div>
  );
}
