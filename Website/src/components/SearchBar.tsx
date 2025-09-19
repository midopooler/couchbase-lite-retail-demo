// Search Bar Component - iOS inspired design
import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchChange,
  placeholder = "Search liquor items..."
}) => {
  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="ios-input pl-10 pr-10"
        />
        
        {searchText && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      
      {searchText && (
        <p className="text-sm text-gray-500 mt-2">
          Searching for "{searchText}"
        </p>
      )}
    </div>
  );
};
