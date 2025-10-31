import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

// Get service areas page data
async function getServiceAreasPage() {
  const db = getDb();
  const page = db.prepare(`
    SELECT p.id, p.slug, p.title, p.date, p.meta_title, p.meta_description, p.canonical_url, p.og_image
    FROM pages_all p
    WHERE p.slug = 'service-areas'
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

  // Get all location pages
  const locations = db.prepare(`
    SELECT location_name, location_slug
    FROM location_pages
    ORDER BY location_name
  `).all() as Array<{
    location_name: string;
    location_slug: string;
  }>;

  return {
    ...page,
    sections,
    locations,
  };
}

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const page = await getServiceAreasPage();

  if (!page) {
    return {
      title: "Service Areas",
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
export default async function ServiceAreasPage() {
  const page = await getServiceAreasPage();

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

      {/* Locations Grid */}
      {page.locations && page.locations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Areas We Serve</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.locations.map((location: any, index: number) => (
              <Link
                key={index}
                href={`/service-areas/${location.location_slug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <h3 className="text-xl font-semibold text-gray-800">{location.location_name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-blue-600 text-white p-8 rounded-lg text-center mt-12">
        <h2 className="text-3xl font-bold mb-4">Need Service In Your Area?</h2>
        <p className="text-xl mb-6">Contact us to learn more about our services!</p>
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
