import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    location: string;
  }>;
}

// Generate static params for all location pages
export async function generateStaticParams() {
  const db = getDb();
  const locations = db.prepare(`
    SELECT DISTINCT location_slug
    FROM location_pages
  `).all() as Array<{ location_slug: string }>;

  return locations.map(({ location_slug }) => ({
    location: location_slug,
  }));
}

// Get location page data
async function getLocationPage(locationSlug: string) {
  const db = getDb();
  const page = db.prepare(`
    SELECT p.id, p.slug, p.title, p.date, p.meta_title, p.meta_description, p.canonical_url, p.og_image,
           lp.id as location_id, lp.location_name, lp.location_slug, lp.tagline,
           lp.about_paragraph_1, lp.about_paragraph_2,
           lp.residential_intro, lp.commercial_intro, lp.closing_cta
    FROM pages_all p
    JOIN location_pages lp ON p.id = lp.page_id
    WHERE lp.location_slug = ?
  `).get(locationSlug) as any;

  if (!page) return null;

  // Get related services
  const relatedServices = db.prepare(`
    SELECT service_name FROM location_related_services
    WHERE location_page_id = ?
    ORDER BY display_order
  `).all(page.location_id) as Array<{ service_name: string }>;

  // Get nearby areas
  const nearbyAreas = db.prepare(`
    SELECT area_name, area_slug FROM location_nearby_areas
    WHERE location_page_id = ?
    ORDER BY display_order
  `).all(page.location_id) as Array<{ area_name: string; area_slug: string }>;

  // Get all residential services for this location
  const residentialServices = db.prepare(`
    SELECT service_name, service_type FROM service_pages
    WHERE location = ? AND service_type = 'residential'
    ORDER BY service_name
    LIMIT 20
  `).all(locationSlug) as Array<{ service_name: string; service_type: string }>;

  // Get all commercial services for this location
  const commercialServices = db.prepare(`
    SELECT service_name, service_type FROM service_pages
    WHERE location = ? AND service_type = 'commercial'
    ORDER BY service_name
    LIMIT 20
  `).all(locationSlug) as Array<{ service_name: string; service_type: string }>;

  return {
    ...page,
    relatedServices: relatedServices.map(s => s.service_name),
    nearbyAreas,
    residentialServices,
    commercialServices,
  };
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params;
  const page = await getLocationPage(location);

  if (!page) {
    return {
      title: "Location Not Found",
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
export default async function LocationPage({ params }: PageProps) {
  const { location } = await params;
  const page = await getLocationPage(location);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.tagline && (
          <p className="text-xl text-gray-600 mb-6">{page.tagline}</p>
        )}
      </div>

      {/* About Section */}
      <div className="mb-12 prose max-w-none">
        {page.about_paragraph_1 && (
          <p className="text-lg text-gray-700 mb-4">{page.about_paragraph_1}</p>
        )}
        {page.about_paragraph_2 && (
          <p className="text-lg text-gray-700">{page.about_paragraph_2}</p>
        )}
      </div>

      {/* Residential Services */}
      {page.residentialServices && page.residentialServices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Residential Electrical Services</h2>
          {page.residential_intro && (
            <p className="text-gray-700 mb-6">{page.residential_intro}</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.residentialServices.map((service: any, index: number) => {
              const serviceName = service.service_name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return (
                <Link
                  key={index}
                  href={`/service-areas/${location}/residential-${service.service_name}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                  {serviceName}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Commercial Services */}
      {page.commercialServices && page.commercialServices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Commercial Electrical Services</h2>
          {page.commercial_intro && (
            <p className="text-gray-700 mb-6">{page.commercial_intro}</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.commercialServices.map((service: any, index: number) => {
              const serviceName = service.service_name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return (
                <Link
                  key={index}
                  href={`/service-areas/${location}/commercial-${service.service_name}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                  {serviceName}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Closing CTA */}
      {page.closing_cta && (
        <div className="mb-12 bg-gray-100 p-6 rounded-lg">
          <p className="text-lg text-gray-700">{page.closing_cta}</p>
        </div>
      )}

      {/* Related Services */}
      {page.relatedServices && page.relatedServices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Services</h2>
          <ul className="list-disc list-inside space-y-2">
            {page.relatedServices.map((service: string, index: number) => (
              <li key={index} className="text-gray-700">{service}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Nearby Areas */}
      {page.nearbyAreas && page.nearbyAreas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Other Areas We Serve</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.nearbyAreas.map((area: any, index: number) => (
              <Link
                key={index}
                href={`/service-areas/${area.area_slug}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                {area.area_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Need Electrical Services in {page.location_name}?</h2>
        <p className="text-xl mb-6">Contact us today for a free estimate!</p>
        <a
          href="/contact-us"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Free Estimate
        </a>
      </div>
    </div>
  );
}
