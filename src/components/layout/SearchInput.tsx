import React, { useRef } from 'react';

export const SearchInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar o escribir comando..."
          className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pl-10 pr-14 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-mono select-none">Ctrl+K</span>
      </div>
    </form>
  );
} 