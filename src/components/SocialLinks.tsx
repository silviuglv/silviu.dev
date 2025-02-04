import Link from 'next/link';
import type { FC, PropsWithChildren } from 'react';

const LinkItem: FC<PropsWithChildren<{ href: string; name: string }>> = (
  props
) => {
  const { name, href, children } = props;

  return (
    <li className="p-0 flex flex-col gap-1">
      <Link href={href} target="_blank" rel="noreferrer">
        {children}
      </Link>
      <span className="text-muted-foreground">{name}</span>
    </li>
  );
};

const SocialLinks: FC = () => {
  return (
    <div className="w-full">
      <ul className="w-full p-0 m-0 list-none grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
        <LinkItem href="https://github.com/silviuglv" name="GitHub">
          silviuglv
        </LinkItem>
        <LinkItem href="https://www.linkedin.com/in/silviuglv" name="LinkedIn">
          silviuglv
        </LinkItem>
        <LinkItem href="mailto:silviuglv@gmail.com" name="Email">
          silviuglv@gmail.com
        </LinkItem>
      </ul>
    </div>
  );
};

export default SocialLinks;
