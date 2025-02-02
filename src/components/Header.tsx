import { FC } from 'react';
import Navigation from './Navigation';

const Header: FC = () => {
  return (
    <header className="flex w-full py-4 justify-between items-center">
      <div className="container">
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
