import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { PortableText as PortableTextComponent } from "@portabletext/react";

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hajlrit4",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2021-03-25",
  useCdn: false,
};

export const sanityClient = createClient(config);

export async function safeSanityFetch(query, params = {}) {
  try {
    return await sanityClient.fetch(query, params);
  } catch (error) {
    console.error("Sanity fetch failed:", error.message);
    return null;
  }
}

export function usePreviewSubscription(_query, { initialData } = {}) {
  return { data: initialData, loading: false, error: null };
}

const builder = createImageUrlBuilder(config);

export const urlFor = (source) => {
  if (!source) return null;
  return builder.image(source);
};

export function PortableText({ blocks, className, value, ...props }) {
  return (
    <div className={className}>
      <PortableTextComponent value={blocks ?? value} {...props} />
    </div>
  );
}
