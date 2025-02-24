import { queryPosts } from "libs/content";

export default async function sitemap() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  const posts = await queryPosts({ devMode: false });

  const blogs = posts.map((post) => {
    return {
      url: `${BASE_URL}/blog/${post.filename}`,
      lastModified: post.frontmatter.date.toISOString().split("T")[0],
    };
  });

  const routes = ["", "/blog", "/faq"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
