import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const db = getDb();
  const posts = db.prepare(`
    SELECT slug FROM posts
  `).all() as Array<{ slug: string }>;

  return posts.map(({ slug }) => ({
    slug,
  }));
}

// Get blog post data
async function getBlogPost(slug: string) {
  const db = getDb();
  const post = db.prepare(`
    SELECT id, slug, title, date, markdown, meta_title, meta_description, canonical_url, og_image
    FROM posts
    WHERE slug = ?
  `).get(slug) as any;

  return post;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || '',
    openGraph: post.og_image
      ? {
          images: [post.og_image],
        }
      : undefined,
  };
}

// Page component
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const postDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-600">
            <time dateTime={post.date}>{postDate}</time>
          </div>
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.markdown || ''}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6">Contact us today to discuss your electrical needs!</p>
          <a
            href="/contact-us"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Contact Us
          </a>
        </div>
      </article>
    </div>
  );
}
