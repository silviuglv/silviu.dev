import { getPost } from "libs/content";
import { BlogPostFrontmatter, queryMdx } from "libs/mdx";
import { notFound } from "next/navigation";

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function generateMetadata(props: BlogPostProps) {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    return;
  }

  const { title, date } = post.frontmatter;

  // const ogImage = image
  //   ? image
  //   : `${BASE_URL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    // description,
    openGraph: {
      title,
      // description,
      type: "article",
      publishedTime: date,
      url: `${BASE_URL}/blog/${params.slug}`,
      images: [
        {
          // url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      // description,
      // images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const data = await queryMdx<BlogPostFrontmatter>(
    "src/content/blog/*.{mdx,md}"
  );

  return data.map((blog) => ({
    slug: blog.filename,
  }));
}

export default async function BlogPost(props: BlogPostProps) {
  const params = await props.params;
  const data = await getPost(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <section className="py-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: data.frontmatter.title,
            datePublished: data.frontmatter.date,
            dateModified: data.frontmatter.date,
            // description: post.metadata.summary,
            // image: post.metadata.image
            //   ? `${baseUrl}${post.metadata.image}`
            //   : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${BASE_URL}/blog/${params.slug}`,
            author: {
              "@type": "Person",
              name: "Silviu Glavan",
            },
          }),
        }}
      />
      <div className="container">
        <article className="prose prose-zinc dark:prose-invert mx-auto prose-code:text-[0.875rem]">
          <h1>{data.frontmatter.title}</h1>
          <p className="text-gray-400">
            {Intl.DateTimeFormat("en-GB", {
              dateStyle: "short",
            }).format(new Date(data.frontmatter.date))}
          </p>
          {data.content}
        </article>
      </div>
    </section>
  );
}
