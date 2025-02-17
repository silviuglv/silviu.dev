import Link from 'next/link';
import type { FC } from 'react';

type BlogPostsProps = {
  data: { title: string; date: string; slug: string }[];
};

const BlogPosts: FC<BlogPostsProps> = (props) => {
  const { data } = props;

  const sorted = data.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-full flex flex-col">
      <div className="hidden md:flex gap-2 font-medium text-muted-foreground text-sm py-2">
        <span className="flex-auto md:flex-[0_0_120px]">Date</span>
        <span className="flex-auto">Title</span>
      </div>
      {sorted.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="flex flex-col md:flex-row gap-2 no-underline py-3 group items-start leading-5"
        >
          <span className="flex-auto md:flex-[0_0_120px] text-muted-foreground text-sm mt-0.5">
            {Intl.DateTimeFormat('en-GB', {
              dateStyle: 'short',
            }).format(new Date(post.date))}
          </span>
          <span className="flex-auto text-primary group-hover:underline underline-offset-2">
            {post.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BlogPosts;
