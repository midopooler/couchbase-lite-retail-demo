// React Hook for Inventory Management
// Matches the iOS app's inventory functionality

import { useState, useEffect, useCallback } from 'react';
import { LiquorItem } from '../types';
import { databaseService } from '../services/DatabaseService';

export const useInventory = () => {
  const [liquorItems, setLiquorItems] = useState<LiquorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  // Load all liquor items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await databaseService.getAllLiquorItems();
      
      if (response.success && response.data) {
        setLiquorItems(response.data);
        console.log(`📊 Loaded ${response.data.length} items`);
      } else {
        setError(response.error || 'Failed to load items');
      }
    } catch (err) {
      console.error('❌ Error loading items:', err);
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity (matching iOS increment/decrement functionality)
  const updateQuantity = useCallback(async (id: string, newQuantity: number) => {
    try {
      const response = await databaseService.updateItemQuantity(id, newQuantity);
      
      if (response.success && response.data) {
        // Update local state
        setLiquorItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
        console.log(`📦 Updated quantity for item ${id} to ${newQuantity}`);
      } else {
        setError(response.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('❌ Error updating quantity:', err);
      setError('Failed to update item quantity');
    }
  }, []);

  // Increment quantity
  const incrementQuantity = useCallback((id: string) => {
    const item = liquorItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  }, [liquorItems, updateQuantity]);

  // Decrement quantity
  const decrementQuantity = useCallback((id: string) => {
    const item = liquorItems.find(item => item.id === id);
    if (item && item.quantity > 0) {
      updateQuantity(id, item.quantity - 1);
    }
  }, [liquorItems, updateQuantity]);

  // Search items (matching iOS search functionality)
  const searchItems = useCallback(async (searchText: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchText.trim() === '') {
        await loadItems();
        return;
      }

      const response = await databaseService.searchLiquor(searchText);
      
      if (response.success && response.data) {
        setLiquorItems(response.data);
        console.log(`🔍 Search found ${response.data.length} items`);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('❌ Error searching items:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [loadItems]);

  // Add new item
  const addItem = useCallback(async (item: Omit<LiquorItem, 'id'>) => {
    try {
      const response = await databaseService.addLiquorItem(item);
      
      if (response.success && response.data) {
        setLiquorItems(prev => [...prev, response.data!]);
        console.log(`➕ Added new item: ${response.data.name}`);
      } else {
        setError(response.error || 'Failed to add item');
      }
    } catch (err) {
      console.error('❌ Error adding item:', err);
      setError('Failed to add item');
    }
  }, []);

  // Filtered items (for search)
  const filteredItems = searchText.trim() === '' 
    ? liquorItems 
    : liquorItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.type.toLowerCase().includes(searchText.toLowerCase())
      );

  // Inventory statistics
  const stats = {
    totalItems: liquorItems.length,
    totalValue: liquorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    lowStockItems: liquorItems.filter(item => item.quantity < 5).length,
    categories: liquorItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handle search text changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim() !== '') {
        searchItems(searchText);
      } else {
        loadItems();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchText, searchItems, loadItems]);

  return {
    // Data
    liquorItems: filteredItems,
    loading,
    error,
    stats,
    
    // Search
    searchText,
    setSearchText,
    
    // Actions
    loadItems,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    addItem,
    
    // Clear error
    clearError: () => setError(null)
  };
};
