// Types matching the iOS LiquorApp structure

export interface LiquorItem {
  id: string;
  name: string;
  type: string;
  price: number;
  imageURL: string;
  quantity: number;
}

export interface DatabaseConfig {
  databaseName: string;
  collectionName: string;
}

export interface SearchFilters {
  searchText: string;
  type?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: Record<string, number>;
}
