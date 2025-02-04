import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="full-w py-3">
      <div className="container">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Silviu-Andrei Glavan
        </p>
      </div>
    </footer>
  );
};

export default Footer;
