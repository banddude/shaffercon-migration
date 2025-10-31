import type { WordPressPost } from "@/types";

interface BlogTemplateProps {
  post: WordPressPost;
}

export default function BlogTemplate({ post }: BlogTemplateProps) {
  // Use a hero image from WordPress content
  const heroImage = "https://shaffercon.com/wp-content/uploads/2019/11/tesla-renewable-energy-640x471.jpg";

  return (
    <article>
      <div className="aspect-video w-full overflow-hidden bg-gray-200 rounded-lg mb-8">
        <img
          src={heroImage}
          alt={post.title.rendered}
          className="w-full h-full object-cover"
        />
      </div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
        <div className="text-gray-600">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>
      <div
        className="wp-content"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
}
