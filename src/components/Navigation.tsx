'use client';

import { FC, PropsWithChildren } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationItem: FC<PropsWithChildren<{ href: string }>> = (props) => {
  const { href, children } = props;
  const pathname = usePathname();

  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={navigationMenuTriggerStyle()}
        active={isActive}
      >
        <Link href={href}>{children}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const Navigation: FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationItem href="/">~ home</NavigationItem>
        <NavigationItem href="/blog">/blog</NavigationItem>
        <NavigationItem href="/faq">/faq</NavigationItem>
        {/* <NavigationItem href="/contact">/contact</NavigationItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
