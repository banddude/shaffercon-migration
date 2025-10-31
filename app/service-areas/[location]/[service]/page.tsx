import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    location: string;
    service: string;
  }>;
}

// Generate static params for all service detail pages
export async function generateStaticParams() {
  const db = getDb();
  const services = db.prepare(`
    SELECT DISTINCT sp.location, sp.service_type, sp.service_name
    FROM service_pages sp
  `).all() as Array<{ location: string; service_type: string; service_name: string }>;

  return services.map(({ location, service_type, service_name }) => ({
    location,
    service: `${service_type}-${service_name}`,
  }));
}

// Get service page data
async function getServicePage(location: string, service: string) {
  const [serviceType, ...serviceNameParts] = service.split('-');
  const serviceName = serviceNameParts.join('-');

  const db = getDb();
  const page = db.prepare(`
    SELECT p.id, p.slug, p.title, p.date, p.meta_title, p.meta_description, p.canonical_url, p.og_image,
           sp.id as service_id, sp.location, sp.service_type, sp.service_name,
           sp.hero_intro, sp.closing_content
    FROM pages_all p
    JOIN service_pages sp ON p.id = sp.page_id
    WHERE sp.location = ? AND sp.service_type = ? AND sp.service_name = ?
  `).get(location, serviceType, serviceName) as any;

  if (!page) return null;

  // Get benefits
  const benefits = db.prepare(`
    SELECT heading, content FROM service_benefits
    WHERE service_page_id = ?
    ORDER BY benefit_order
  `).all(page.service_id) as Array<{ heading: string; content: string }>;

  // Get offerings
  const offerings = db.prepare(`
    SELECT offering FROM service_offerings
    WHERE service_page_id = ?
    ORDER BY offering_order
  `).all(page.service_id) as Array<{ offering: string }>;

  // Get FAQs
  const faqs = db.prepare(`
    SELECT question, answer FROM service_faqs
    WHERE service_page_id = ?
    ORDER BY faq_order
  `).all(page.service_id) as Array<{ question: string; answer: string }>;

  // Get related services
  const relatedServices = db.prepare(`
    SELECT service_name FROM service_related_services
    WHERE service_page_id = ?
    ORDER BY display_order
  `).all(page.service_id) as Array<{ service_name: string }>;

  // Get nearby areas
  const nearbyAreas = db.prepare(`
    SELECT area_name FROM service_nearby_areas
    WHERE service_page_id = ?
    ORDER BY display_order
  `).all(page.service_id) as Array<{ area_name: string }>;

  return {
    ...page,
    benefits,
    offerings: offerings.map(o => o.offering),
    faqs,
    relatedServices: relatedServices.map(s => s.service_name),
    nearbyAreas: nearbyAreas.map(a => a.area_name),
  };
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location, service } = await params;
  const page = await getServicePage(location, service);

  if (!page) {
    return {
      title: "Service Not Found",
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
export default async function ServiceDetailPage({ params }: PageProps) {
  const { location, service } = await params;
  const page = await getServicePage(location, service);

  if (!page) {
    notFound();
  }

  const locationName = location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.hero_intro && (
          <p className="text-lg text-gray-700">{page.hero_intro}</p>
        )}
      </div>

      {/* Benefits Section */}
      {page.benefits && page.benefits.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {page.benefits.map((benefit: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">{benefit.heading}</h3>
                <p className="text-gray-700">{benefit.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offerings Section */}
      {page.offerings && page.offerings.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Services Include</h2>
          <ul className="list-disc list-inside space-y-2">
            {page.offerings.map((offering: string, index: number) => (
              <li key={index} className="text-gray-700">{offering}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Closing Content */}
      {page.closing_content && (
        <div className="mb-12">
          <p className="text-lg text-gray-700">{page.closing_content}</p>
        </div>
      )}

      {/* FAQs Section */}
      {page.faqs && page.faqs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {page.faqs.map((faq: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Services */}
      {page.relatedServices && page.relatedServices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Related Services</h2>
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
          <h2 className="text-3xl font-bold mb-6">We Also Serve</h2>
          <ul className="list-disc list-inside space-y-2">
            {page.nearbyAreas.map((area: string, index: number) => (
              <li key={index} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6">Contact us today for a free consultation!</p>
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
