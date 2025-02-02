import BlogPosts from 'components/BlogPosts';

export default async function Home() {
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
          <BlogPosts
            data={[
              {
                title: 'How to use the new Next.js 13.4 App Directory',
                date: '12-04-2024',
                slug: 'next-13-4-app-directory',
              },
              {
                title: 'A Complete Guide to Serverless with AWS Lambda',
                date: '18-03-2024',
                slug: 'serverless-aws-lambda-guide',
              },
              {
                title: 'Best Practices for CI/CD in Modern Web Applications',
                date: '05-02-2024',
                slug: 'ci-cd-best-practices',
              },
              {
                title: 'Optimizing Serverless Performance: Tips & Tricks',
                date: '22-01-2024',
                slug: 'serverless-performance-tips',
              },
              {
                title: 'Understanding Edge Functions in Next.js',
                date: '30-03-2024',
                slug: 'next-js-edge-functions',
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
