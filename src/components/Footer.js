import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Your Company Name. All rights
          reserved.
        </p>
        <p className="text-xs mt-2">
          Built with ❤️ using Next.js and Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
