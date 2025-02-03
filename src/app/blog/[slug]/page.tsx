import { BlogPostFrontmatter, getMdx } from 'libs/mdx';
import { notFound } from 'next/navigation';

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost(props: BlogPostProps) {
  const params = await props.params;
  const data = await getMdx<BlogPostFrontmatter>(
    `src/content/blog/${params.slug}.{md,mdx}`
  );

  if (!data) {
    notFound();
  }

  return (
    <section className="py-16">
      <div className="container">
        <article className="prose dark:prose-invert prose-sm max-w-none prose-code:text-[0.875rem]">
          <h1>{data.frontmatter.title}</h1>
          <p className="text-gray-400">
            {Intl.DateTimeFormat('en-GB', {
              dateStyle: 'short',
            }).format(new Date(data.frontmatter.date))}
          </p>
          {data.content}
        </article>
      </div>
    </section>
  );
}
