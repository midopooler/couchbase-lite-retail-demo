// Main Inventory View Component - Matching iOS LiquorApp design
import React from 'react';
import { RefreshCw, Database } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { LiquorItemCard } from './LiquorItemCard';
import { InventoryStats } from './InventoryStats';
import { SearchBar } from './SearchBar';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export const InventoryView: React.FC = () => {
  const {
    liquorItems,
    loading,
    error,
    stats,
    searchText,
    setSearchText,
    loadItems,
    incrementQuantity,
    decrementQuantity,
    clearError
  } = useInventory();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - iOS style */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Liquor Inventory
                </h1>
                <p className="text-sm text-gray-500">
                  Powered by Couchbase
                </p>
              </div>
            </div>
            
            <button
              onClick={loadItems}
              disabled={loading}
              className="ios-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={clearError}
            type="error"
          />
        )}

        {/* Search Bar */}
        <SearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder="Search by name or type..."
        />

        {/* Statistics */}
        <InventoryStats stats={stats} />

        {/* Loading State */}
        {loading && liquorItems.length === 0 && (
          <LoadingSpinner text="Loading inventory..." />
        )}

        {/* Empty State */}
        {!loading && liquorItems.length === 0 && !error && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchText ? 'No items found' : 'No inventory items'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchText 
                ? `No items match "${searchText}". Try a different search.`
                : 'Your inventory is empty. Add some items to get started.'
              }
            </p>
            
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="ios-button"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Inventory Grid - iOS style 2-column layout */}
        {!loading && liquorItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchText ? `Search Results (${liquorItems.length})` : `All Items (${liquorItems.length})`}
              </h2>
              
              {/* Sort options could go here */}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liquorItems.map((item) => (
                <LiquorItemCard
                  key={item.id}
                  item={item}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>LiquorApp Frontend • Built with React & Couchbase</p>
          <p className="mt-1">Synchronized with iOS and Android apps</p>
        </div>
      </div>
    </div>
  );
};
