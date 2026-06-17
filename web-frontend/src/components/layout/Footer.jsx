import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-4">
      <div className="container-custom text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} EasyGo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
