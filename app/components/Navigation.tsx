"use client";

import Link from "next/link";
import { useState } from "react";
import menuData from "@/data/menu-structure.json";
import siteConfig from "@/data/site-config.json";
import type { MenuData, SiteConfig } from "@/types";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const menu = menuData as MenuData;
  const config = siteConfig as SiteConfig;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-brand-blue no-underline hover:no-underline">
            {config.siteName}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menu.primaryMenu.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-brand-blue font-medium no-underline"
                >
                  {item.label}
                </Link>

                {/* Dropdown for Service Areas */}
                {item.children && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Phone Number */}
            <a
              href={`tel:${config.contact.phone}`}
              className="bg-brand-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 no-underline"
            >
              {config.contact.phone}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            {menu.primaryMenu.map((item) => (
              <div key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-brand-blue no-underline"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block py-1 text-sm text-gray-600 hover:text-brand-blue no-underline"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
