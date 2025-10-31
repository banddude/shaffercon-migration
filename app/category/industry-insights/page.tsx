import Link from "next/link";
import { getAllPosts } from "@/lib/pages";
import type { WordPressPost } from "@/types";

export default function IndustryInsightsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Industry Insights</h1>
        <p className="text-xl text-gray-600">
          Stay informed with the latest news and insights about EV charging infrastructure,
          electrical services, and industry trends.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: WordPressPost, index: number) => {
          // Use existing images from WordPress content
          const heroImages = [
            "https://shaffercon.com/wp-content/uploads/2019/11/tesla-renewable-energy-640x471.jpg",
            "https://shaffercon.com/wp-content/uploads/2019/10/IMG_1633-640x471.jpeg",
            "https://shaffercon.com/wp-content/uploads/2019/11/3-640x480.jpg",
          ];
          const heroImage = heroImages[index % heroImages.length];

          return (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/blog/${post.slug}`} className="no-underline">
                <div className="aspect-video w-full overflow-hidden bg-gray-200">
                  <img
                    src={heroImage}
                    alt={post.title.rendered}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 hover:text-brand-blue">
                    {post.title.rendered}
                  </h2>
                  <div
                    className="text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="text-brand-blue font-semibold">Read more →</span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
