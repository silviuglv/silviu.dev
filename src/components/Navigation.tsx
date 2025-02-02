import { FC } from 'react';
import NavigationLink from './NavigationLink';

const Navigation: FC = () => {
  return (
    <nav className="w-full">
      <menu className="flex gap-6 items-center justify-start">
        <li>
          <NavigationLink href="/">~ home</NavigationLink>
        </li>
        <li>
          <NavigationLink href="/blog">/blog</NavigationLink>
        </li>
        <li>
          <NavigationLink href="/faq">/faq</NavigationLink>
        </li>
        <li>
          <NavigationLink href="/contact">/contact</NavigationLink>
        </li>
      </menu>
    </nav>
  );
};

export default Navigation;
