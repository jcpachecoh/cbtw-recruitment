import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white p-4 text-center fixed bottom-0 w-full">
      <p>&copy; {new Date().getFullYear()} CBTW. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
