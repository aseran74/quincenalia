import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
// Ajusta los imports según tu estructura
// Si no existen, crea componentes vacíos para ThemeToggleButton, NotificationDropdown, UserDropdown, IconMenu, IconClose, IconDots
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "../header/NotificationDropdown";
import UserDropdown from "../header/UserDropdown";
import { IconMenu, IconClose, IconDots } from "./Icons";
import { useSidebar } from "../../context/SidebarContext";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex-grow flex items-center justify-between px-4 lg:px-6">
        {/* --- Lado Izquierdo del Header --- */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleSidebarToggle}
            aria-label="Toggle Sidebar"
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            {isMobileOpen ? <IconClose /> : <IconMenu />}
          </button>
          <div className="hidden lg:block">
            <SearchInput inputRef={inputRef} />
          </div>
        </div>
        {/* --- Logo en el centro (solo en móvil) --- */}
        <div className="lg:hidden">
          <Link to="/" aria-label="Go to Homepage">
            <img className="dark:hidden w-20" src="/logo.svg" alt="Logo" />
            <img className="hidden dark:block w-20" src="/logo-dark.svg" alt="Logo" />
          </Link>
        </div>
        {/* --- Lado Derecho del Header --- */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
            <UserDropdown />
          </div>
          <button
            onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
            aria-label="Toggle Application Menu"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            <IconDots />
          </button>
        </div>
      </div>
      {/* Menú desplegable para móvil */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${
          isApplicationMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-center gap-4 p-4">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

const SearchInput = ({ inputRef }: { inputRef: React.RefObject<HTMLInputElement> }) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <div className="relative">
      {/* Icono de búsqueda SVG */}
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar o escribir comando..."
        className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pl-10 pr-14 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
      />
      {/* Botón de atajo visual */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-mono select-none">Ctrl+K</span>
    </div>
  </form>
);

export default AppHeader; 