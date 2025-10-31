import { notFound } from "next/navigation";
import { getPageBySlug, getPostBySlug } from "@/lib/pages";
import PageTemplate from "@/app/components/templates/PageTemplate";
import BlogTemplate from "@/app/components/templates/BlogTemplate";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Enable dynamic params to handle routes that aren't pre-generated
export const dynamicParams = true;

export async function generateStaticParams() {
  // Only generate params for the homepage and a few key pages
  // All other routes will be handled dynamically
  return [];
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const lastSegment = slug[slug.length - 1];

  // Check if it's a blog post
  if (slug[0] === "blog" && slug.length > 1) {
    const post = getPostBySlug(slug[1]);
    if (!post) {
      notFound();
    }
    return <BlogTemplate post={post} />;
  }

  // Check for regular page
  const page = getPageBySlug(lastSegment);
  if (!page) {
    notFound();
  }

  return <PageTemplate page={page} />;
}
