import type { WordPressPage } from "@/types";
import ServiceAreaLinks from "@/app/components/ServiceAreaLinks";

interface PageTemplateProps {
  page: WordPressPage;
}

export default function PageTemplate({ page }: PageTemplateProps) {
  // Check if this is a service area main page (e.g., "altadena", "santa-monica")
  // Service area pages don't have slashes and are not in a subdirectory
  const isServiceAreaPage = page.slug && !page.slug.includes('/');

  return (
    <article>
      <div
        className="wp-content"
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />

      {isServiceAreaPage && (
        <ServiceAreaLinks location={page.slug} />
      )}
    </article>
  );
}
