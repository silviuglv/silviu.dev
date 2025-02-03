import BlogPosts from 'components/BlogPosts';
import { queryMdx } from 'libs/mdx';

export default async function Home() {
  const data = await queryMdx<{ title: string; date: string }>(
    'src/content/blog/*.{mdx,md}'
  );

  const posts = data.map((blog) => ({
    title: blog.frontmatter.title,
    date: blog.frontmatter.date,
    slug: blog.filename,
  }));

  return (
    <section className="py-16">
      <div className="container">
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <h1>Silviu Glăvan</h1>
          <p className="text-lg">
            <em>Software Engineer</em>
          </p>
          <p className="mb-4">
            I&apos;m a self-taught developer from Romania 🇷🇴, sharing my
            thoughts on JavaScript, TypeScript, React, and Serverless.
          </p>
          <h2>Latest posts</h2>
          <BlogPosts data={posts} />
        </div>
      </div>
    </section>
  );
}
