import type { FC, ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

type FAQListProps = {
  data: {
    question: string;
    content: ReactNode;
    slug: string;
  }[];
};

const FAQList: FC<FAQListProps> = (props) => {
  const { data } = props;

  return (
    <Accordion type="multiple" className="w-full">
      {data.map((item) => (
        <AccordionItem key={item.slug} value={item.slug}>
          <AccordionTrigger className="text-base">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQList;
