const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-2 sm:px-4 py-4 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto flex flex-col items-center">
        <span className="mb-1">© {new Date().getFullYear()} ContentKit AI Pro. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;