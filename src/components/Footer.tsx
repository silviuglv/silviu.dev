import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="text-sm py-3 text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Silviu-Andrei Glavan</p>
      </div>
    </footer>
  );
};

export default Footer;
