import BlogPosts from 'components/BlogPosts';
import { queryMdx } from 'libs/mdx';

export default async function Blog() {
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
          <h1>Blog</h1>
          <BlogPosts data={posts} />
        </div>
      </div>
    </section>
  );
}
