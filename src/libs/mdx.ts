import type { ReactElement } from "react";

import fs from "node:fs/promises";
import { glob } from "glob";
import path from "node:path";

import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";

type MDXContent<T extends Record<string, unknown>> = {
  frontmatter: T;
  content: ReactElement;
  filename: string;
  source: string;
};

async function parseMdx<TFrontmatter extends Record<string, unknown>>(
  raw: string
) {
  return compileMDX<TFrontmatter>({
    source: raw,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeCodeTitles,
          rehypeHighlight,
          rehypeSlug,
          rehypeAutolinkHeadings,
        ],
        remarkPlugins: [remarkGfm],
      },
    },
    components: {},
  });
}

export async function getMdxFromPath<T extends Record<string, unknown>>(
  source: string
): Promise<MDXContent<T>> {
  const raw = await fs.readFile(source, "utf-8");
  const parsed = await parseMdx<T>(raw);

  return {
    frontmatter: parsed.frontmatter,
    content: parsed.content,
    filename: path.basename(source, path.extname(source)),
    source: source,
  };
}

export async function queryMdx<T extends Record<string, unknown>>(
  source: string
): Promise<MDXContent<T>[]> {
  const paths = await glob(source);
  return await Promise.all(paths.map((p) => getMdxFromPath<T>(p)));
}

export async function getMdx<T extends Record<string, unknown>>(
  source: string
): Promise<MDXContent<T> | null> {
  const [path] = await glob(source);
  if (!path) return null;

  return await getMdxFromPath<T>(path);
}

export type BlogPostFrontmatter = {
  title: string;
  date: string;
};

export type FAQFrontmatter = {
  question: string;
};
