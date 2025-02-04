import { FC } from 'react';
import Navigation from './Navigation';
import { ThemeSwitch } from './ThemeSwitch';

const Header: FC = () => {
  return (
    <header className="w-full py-4">
      <div className="container flex flex-row md:flex-row md:items-center justify-between items-start gap-3">
        <Navigation />
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default Header;
