import { useState, useRef, useCallback, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search programs, courses, institutions…',
  isLoading = false,
  initialValue = '',
}) => {
  const [value, setValue] = useState(initialValue);

  /* Sync if parent changes initialValue (e.g. URL navigation) */
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Fire onSearch after 300 ms of inactivity */
  const debouncedSearch = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(text.trim()), 300);
    },
    [onSearch],
  );

  /* Cleanup on unmount */
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    debouncedSearch(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch('');
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Loading spinner (shown only while fetching) */}
      {isLoading && (
        <span className="absolute left-3 flex items-center pointer-events-none text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      )}

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white py-2.5 ${isLoading ? 'pl-10' : 'pl-4'} pr-10 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors`}
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
