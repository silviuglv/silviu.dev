import BlogPosts from "components/BlogPosts";
import { queryPosts } from "libs/content";

export const metadata = {
  title: "Blog",
};

export default async function Blog() {
  const data = await queryPosts({
    devMode: process.env.NODE_ENV === "development",
  });

  const posts = data.map((blog) => ({
    title: blog.frontmatter.title,
    date: blog.frontmatter.date,
    slug: blog.filename,
  }));

  return (
    <section className="py-16">
      <div className="container">
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <h1>Blog</h1>
          <BlogPosts data={posts} />
        </div>
      </div>
    </section>
  );
}
