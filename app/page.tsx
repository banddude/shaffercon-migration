import homeData from "@/data/template_homepage.json";
import PageTemplate from "@/app/components/templates/PageTemplate";
import type { WordPressPage } from "@/types";

export default function Home() {
  const page = homeData[0] as WordPressPage;

  return <PageTemplate page={page} />;
}
