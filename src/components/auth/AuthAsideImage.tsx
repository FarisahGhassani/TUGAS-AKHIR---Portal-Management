"use client";

import { SmartImage as Image } from "@/components/ui/SmartImage";
import { useGetSiteAssetsQuery } from "@/store/api/siteAssetsApi";

// Default bila admin belum mengganti aset (Site Assets).
const DEFAULT_AUTH_IMAGE =
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80";

export function AuthAsideImage() {
  const { data } = useGetSiteAssetsQuery();
  const src = data?.authImage || DEFAULT_AUTH_IMAGE;
  return (
    <Image
      src={src}
      alt="High-fashion editorial portrait of a model in dramatic monochrome lighting."
      fill
      sizes="(min-width: 768px) 50vw, 100vw"
      priority
      className="object-cover grayscale"
    />
  );
}
