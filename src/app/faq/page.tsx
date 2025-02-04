import FAQList from 'components/FAQList';
import { FAQFrontmatter, queryMdx } from 'libs/mdx';

export default async function FAQ() {
  const data = await queryMdx<FAQFrontmatter>('src/content/faq/*.{mdx,md}');

  const faq = data.map((faq) => ({
    question: faq.frontmatter.question,
    content: faq.content,
    slug: faq.filename,
  }));

  return (
    <section className="py-16">
      <div className="container">
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <h1>FAQ</h1>
          <p>Find out more about me, my opinions, and personal preferences.</p>
          <FAQList data={faq} />
        </div>
      </div>
    </section>
  );
}
