const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 w-full h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="h-full flex items-center justify-center pl-64"> {/* pl-64 to align with sidebar */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {currentYear} Bigirimana
        </p>
      </div>
    </footer>
  );
};

export default Footer;
