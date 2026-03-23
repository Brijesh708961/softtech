import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blogs", href: "/blogs" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLightPage = location.pathname === "/blogs";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const scrolled = isScrolled || isLightPage;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/src/assets/common/navbar1.png"
              alt="Dreamers Softtech Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col leading-none">
              <span
                className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                Dreamers <span className="text-[#C89A3D]">Softtech</span>
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                  scrolled ? "text-gray-400" : "text-white/50"
                }`}
              >
                {/* LLP */}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? scrolled
                        ? "text-[#C89A3D]"
                        : "text-[#C89A3D]"
                      : scrolled
                        ? "text-gray-600 hover:text-[#C89A3D] hover:bg-[#C89A3D]/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                  {/* Active underline dot */}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C89A3D]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop CTA */}
            <Link
              to="/contact"
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-[#C89A3D] hover:bg-[#b78930] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow hover:shadow-lg hover:shadow-[#C89A3D]/25"
            >
              Contact Us
            </Link>

            {/* Mobile menu button */}
            <button
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white border-t border-gray-100 rounded-b-2xl shadow-xl px-4 py-5 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#C89A3D]/10 text-[#C89A3D]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#C89A3D]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89A3D]" />
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-gray-100 mt-2">
              <Link
                to="/contact"
                className="flex items-center justify-center w-full px-6 py-3 bg-[#C89A3D] text-white rounded-xl font-semibold text-sm hover:bg-[#b78930] transition-all duration-200 shadow"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
