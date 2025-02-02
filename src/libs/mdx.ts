import fs from 'node:fs/promises';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import { glob } from 'glob';

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
          rehypePrism,
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
  path: string
) {
  const raw = await fs.readFile(path, 'utf-8');
  return await parseMdx<T>(raw);
}

export async function findMdx(source: string) {
  const paths = await glob(source);
  return await Promise.all(paths.map(getMdxFromPath));
}
