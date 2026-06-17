function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p>© {new Date().getFullYear()} EasyGo. Built for development and testing.</p>
      </div>
    </footer>
  );
}

export default Footer;
