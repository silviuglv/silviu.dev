import Link from 'next/link';
import type { FC } from 'react';

type BlogPostsProps = {
  data: { title: string; date: string; slug: string }[];
};

const BlogPosts: FC<BlogPostsProps> = (props) => {
  const { data } = props;

  return (
    <div className="w-full flex flex-col">
      <div className="hidden md:flex gap-2 font-medium text-gray-400 text-sm py-2">
        <span className="flex-auto md:flex-[0_0_120px]">Date</span>
        <span className="flex-auto">Title</span>
      </div>
      {data.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="flex flex-col md:flex-row gap-2 no-underline py-3 group items-start"
        >
          <span className="flex-auto md:flex-[0_0_120px] text-gray-400 text-sm">
            {post.date}
          </span>
          <span className="flex-auto text-gray-300 group-hover:underline underline-offset-2 group-hover:text-white">
            {post.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BlogPosts;
