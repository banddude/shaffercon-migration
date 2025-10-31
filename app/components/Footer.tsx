import siteConfig from "@/data/site-config.json";
import type { SiteConfig } from "@/types";

export default function Footer() {
  const config = siteConfig as SiteConfig;

  return (
    <footer className="bg-[#4a7ba7] text-white py-12 mt-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h3 className="text-3xl font-normal text-center mb-12 tracking-wider">LET'S WORK TOGETHER</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">WORKING HOURS</h4>
            <p className="text-white mb-0">{config.contact.workingHours}</p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">LOCATION</h4>
            <p className="text-white mb-0">
              {config.contact.address.street}<br />
              {config.contact.address.city}, {config.contact.address.state} {config.contact.address.zip}
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">REACH OUT TO US</h4>
            <p className="text-white mb-1">
              Call or Text: <a href={`tel:${config.contact.phone}`} className="text-white hover:text-gray-200 no-underline">{config.contact.phone}</a>
            </p>
            <p className="text-white mb-0">
              Email: <a href={`mailto:${config.contact.email}`} className="text-white hover:text-gray-200 no-underline">{config.contact.email}</a>
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">Licenses</h4>
            {config.business.licenses.map((license, index) => (
              <p key={index} className="text-white mb-1">{license}</p>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 text-center border-t border-white/20">
          <p className="text-white text-sm mb-0">&copy; {new Date().getFullYear()} {config.siteName}</p>
        </div>
      </div>
    </footer>
  );
}
