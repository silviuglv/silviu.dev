import { getMdx, queryMdx } from "./mdx";

export type BlogPostFrontmatter = {
  title: string;
  date: string;
  draft?: boolean;
};

type QueryPostsOptions = {
  limit?: number;
  devMode?: boolean;
};

export async function queryPosts(options: QueryPostsOptions) {
  let allPosts = await queryMdx<BlogPostFrontmatter>(
    "src/content/blog/*.{mdx,md}"
  );

  if (!options.devMode) {
    allPosts = allPosts.filter((post) => !post.frontmatter.draft);
  }

  const posts = allPosts
    .map((post) => {
      return {
        ...post,
        frontmatter: {
          ...post.frontmatter,
          date: new Date(post.frontmatter.date),
        },
      };
    })
    .sort((a, b) => {
      return b.frontmatter.date.getTime() - a.frontmatter.date.getTime();
    });

  return options.limit ? posts.slice(0, options.limit) : posts;
}

export async function getPost(slug: string) {
  return await getMdx<BlogPostFrontmatter>(`src/content/blog/${slug}.{md,mdx}`);
}
