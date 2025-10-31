import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    landing: string;
  }>;
}

const SERVICE_LANDING_SLUGS = [
  'commercial-electric-vehicle-chargers',
  'commercial-service',
  'electrical-load-studies',
  'led-retrofit-services',
  'residential-ev-charger',
  'statewide-facilities-maintenance'
];

// Generate static params for service landing pages
export async function generateStaticParams() {
  return SERVICE_LANDING_SLUGS.map(slug => ({
    landing: slug,
  }));
}

// Get service landing page data
async function getServiceLandingPage(slug: string) {
  if (!SERVICE_LANDING_SLUGS.includes(slug)) {
    return null;
  }

  const db = getDb();
  const page = db.prepare(`
    SELECT p.id, p.slug, p.title, p.date, p.meta_title, p.meta_description, p.canonical_url, p.og_image,
           slp.id as landing_id, slp.page_title, slp.hero_text
    FROM pages_all p
    JOIN service_landing_pages slp ON p.id = slp.page_id
    WHERE p.slug = ?
  `).get(slug) as any;

  if (!page) return null;

  // Get sections
  const sections = db.prepare(`
    SELECT section_type, heading, subheading, content, table_data
    FROM service_landing_sections
    WHERE landing_page_id = ?
    ORDER BY section_order
  `).all(page.landing_id) as Array<{
    section_type: string;
    heading: string;
    subheading: string;
    content: string;
    table_data: string | null;
  }>;

  return {
    ...page,
    sections: sections.map(s => ({
      ...s,
      table_data: s.table_data ? JSON.parse(s.table_data) : null,
    })),
  };
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landing } = await params;
  const page = await getServiceLandingPage(landing);

  if (!page) {
    return {
      title: "Page Not Found",
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
export default async function ServiceLandingPage({ params }: PageProps) {
  const { landing } = await params;
  const page = await getServiceLandingPage(landing);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{page.page_title || page.title}</h1>
        {page.hero_text && (
          <p className="text-xl text-gray-600">{page.hero_text}</p>
        )}
      </div>

      {/* Dynamic Sections */}
      {page.sections && page.sections.map((section: any, index: number) => (
        <div key={index} className="mb-12">
          {section.section_type === 'info_card' && (
            <div className="bg-white p-6 rounded-lg shadow">
              {section.heading && (
                <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              )}
              {section.subheading && (
                <h3 className="text-xl font-semibold mb-4 text-gray-700">{section.subheading}</h3>
              )}
              {section.content && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
            </div>
          )}

          {section.section_type === 'content_block' && (
            <div>
              {section.heading && (
                <h2 className="text-3xl font-bold mb-4">{section.heading}</h2>
              )}
              {section.subheading && (
                <h3 className="text-xl font-semibold mb-4 text-gray-700">{section.subheading}</h3>
              )}
              {section.content && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
            </div>
          )}

          {section.section_type === 'comparison_table' && section.table_data && (
            <div className="overflow-x-auto">
              {section.heading && (
                <h2 className="text-3xl font-bold mb-6">{section.heading}</h2>
              )}
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    {section.table_data.headers.map((header: string, idx: number) => (
                      <th key={idx} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table_data.rows.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="px-6 py-4 text-sm text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.section_type === 'list' && section.content && (
            <div>
              {section.heading && (
                <h2 className="text-3xl font-bold mb-4">{section.heading}</h2>
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          )}
        </div>
      ))}

      {/* CTA */}
      <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6">Contact us today for a consultation!</p>
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
