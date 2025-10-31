import { getAllServiceAreaPages } from "@/lib/pages";
import Link from "next/link";

interface ServiceAreaLinksProps {
  location: string;
}

export default function ServiceAreaLinks({ location }: ServiceAreaLinksProps) {
  const services = getAllServiceAreaPages(location);

  // Helper function to format service name from slug
  const formatServiceName = (slug: string): string => {
    // Extract the service part after residential- or commercial-
    const parts = slug.split('/');
    const servicePart = parts[parts.length - 1];
    const nameWithoutPrefix = servicePart.replace(/^(residential|commercial)-/, '');

    // Convert dashes to spaces and capitalize each word
    return nameWithoutPrefix
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="service-area-links">
      {services.residential.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Residential Services in {location.charAt(0).toUpperCase() + location.slice(1)}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {services.residential.map((service) => (
              <li key={service.slug}>
                <Link href={`/${service.slug}`} className="text-blue-600 hover:underline">
                  {formatServiceName(service.slug)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {services.commercial.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Commercial Services in {location.charAt(0).toUpperCase() + location.slice(1)}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {services.commercial.map((service) => (
              <li key={service.slug}>
                <Link href={`/${service.slug}`} className="text-blue-600 hover:underline">
                  {formatServiceName(service.slug)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
