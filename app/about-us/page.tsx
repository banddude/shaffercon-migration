import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

// Get about page data
async function getAboutPage() {
  const db = getDb();
  const page = db.prepare(`
    SELECT p.id, p.slug, p.title, p.date, p.meta_title, p.meta_description, p.canonical_url, p.og_image
    FROM pages_all p
    WHERE p.slug = 'about-us'
  `).get() as any;

  if (!page) return null;

  const sections = db.prepare(`
    SELECT section_type, heading, content
    FROM page_sections
    WHERE page_id = ?
    ORDER BY section_order
  `).all(page.id) as Array<{
    section_type: string;
    heading: string;
    content: string;
  }>;

  return {
    ...page,
    sections,
  };
}

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();

  if (!page) {
    return {
      title: "About Us",
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || '',
    openGraph: page.og_image
      ? {
          images: [page.og_image],
        }
      : undefined,
  };
}

// Page component
export default async function AboutPage() {
  const page = await getAboutPage();

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

      {page.sections && page.sections.map((section: any, index: number) => (
        <div key={index} className="mb-8">
          {section.heading && (
            <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
          )}
          {section.content && (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
          )}
        </div>
      ))}

      {/* CTA */}
      <div className="bg-blue-600 text-white p-8 rounded-lg text-center mt-12">
        <h2 className="text-3xl font-bold mb-4">Work With Us</h2>
        <p className="text-xl mb-6">Ready to start your next project?</p>
        <a
          href="/contact-us"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
