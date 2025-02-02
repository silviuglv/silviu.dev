'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC, PropsWithChildren } from 'react';

type NavigationLinkProps = PropsWithChildren<{
  href: string;
}>;

const NavigationLink: FC<NavigationLinkProps> = (props) => {
  const { href, children } = props;
  const pathname = usePathname();

  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`font-medium text-sm hover:text-gray-300 ${
        isActive ? 'text-gray-300' : 'text-gray-400'
      }`}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;
