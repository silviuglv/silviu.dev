import BlogPosts from "components/BlogPosts";
import SocialLinks from "components/SocialLinks";
import { queryPosts } from "libs/content";

export default async function Home() {
  const data = await queryPosts({
    devMode: process.env.NODE_ENV === "development",
    limit: 10,
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
          <h1>Silviu Glăvan</h1>
          <p className="text-lg">
            <em>Software Engineer</em>
          </p>
          <p className="mb-4">
            I&apos;m a self-taught developer from Romania 🇷🇴, sharing my
            thoughts on TypeScript, React, GraphQL, and Serverless.
          </p>
          <h2>Latest posts</h2>
          <BlogPosts data={posts} />
          <h2>Let&apos;s connect</h2>
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
