// Couchbase Database Service for Web
// This will simulate the iOS DatabaseManager functionality

import { LiquorItem, ApiResponse } from '../types';

class DatabaseService {
  private databaseName = 'LiquorInventoryDB';
  private collectionName = 'liquor_items';
  private isInitialized = false;
  
  // Sample data matching iOS app with liquor bottle images
  private sampleData: LiquorItem[] = [
    {
      id: '1',
      name: 'Johnnie Walker Black Label',
      type: 'Whiskey',
      price: 45.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#2d1810" stroke="#1a0d08" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#d4af37"/>
          <text x="50" y="100" text-anchor="middle" fill="#d4af37" font-size="8" font-family="serif">JW</text>
          <text x="50" y="110" text-anchor="middle" fill="#d4af37" font-size="6" font-family="serif">BLACK</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '2',
      name: 'Grey Goose Vodka',
      type: 'Vodka',
      price: 55.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#f8f8ff" stroke="#e0e0e0" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#4169e1"/>
          <text x="50" y="100" text-anchor="middle" fill="#4169e1" font-size="7" font-family="serif">GREY</text>
          <text x="50" y="110" text-anchor="middle" fill="#4169e1" font-size="7" font-family="serif">GOOSE</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '3',
      name: 'Bacardi Superior Rum',
      type: 'Rum',
      price: 22.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#dc143c"/>
          <circle cx="50" cy="80" r="15" fill="#dc143c"/>
          <text x="50" y="120" text-anchor="middle" fill="#dc143c" font-size="6" font-family="serif">BACARDI</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '4',
      name: 'Tanqueray Gin',
      type: 'Gin',
      price: 29.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#228b22" stroke="#006400" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="100" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">TANQUERAY</text>
          <text x="50" y="110" text-anchor="middle" fill="#ffd700" font-size="8" font-family="serif">GIN</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '5',
      name: 'Patron Silver Tequila',
      type: 'Tequila',
      price: 49.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#f5f5dc" stroke="#ddd" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#8b4513"/>
          <text x="50" y="100" text-anchor="middle" fill="#8b4513" font-size="7" font-family="serif">PATRÓN</text>
          <text x="50" y="110" text-anchor="middle" fill="#8b4513" font-size="6" font-family="serif">SILVER</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '6',
      name: 'Hennessy VS Cognac',
      type: 'Cognac',
      price: 45.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#8b4513" stroke="#654321" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="100" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">HENNESSY</text>
          <text x="50" y="110" text-anchor="middle" fill="#ffd700" font-size="8" font-family="serif">VS</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '7',
      name: 'Macallan 12 Year',
      type: 'Whiskey',
      price: 89.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#4a4a4a" stroke="#333" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="95" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">MACALLAN</text>
          <text x="50" y="105" text-anchor="middle" fill="#ffd700" font-size="8" font-family="serif">12</text>
          <text x="50" y="115" text-anchor="middle" fill="#ffd700" font-size="5" font-family="serif">YEAR</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '8',
      name: 'Belvedere Vodka',
      type: 'Vodka',
      price: 39.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#87ceeb" stroke="#4682b4" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#1e90ff"/>
          <text x="50" y="100" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">BELVEDERE</text>
          <text x="50" y="110" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">VODKA</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '9',
      name: 'Captain Morgan Spiced Rum',
      type: 'Rum',
      price: 19.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#8b4513" stroke="#654321" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="95" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">CAPTAIN</text>
          <text x="50" y="105" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">MORGAN</text>
          <text x="50" y="115" text-anchor="middle" fill="#ffd700" font-size="5" font-family="serif">SPICED</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '10',
      name: 'Bombay Sapphire Gin',
      type: 'Gin',
      price: 24.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#4169e1" stroke="#1e90ff" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#87ceeb"/>
          <text x="50" y="95" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">BOMBAY</text>
          <text x="50" y="105" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">SAPPHIRE</text>
          <text x="50" y="115" text-anchor="middle" fill="#ffffff" font-size="5" font-family="serif">GIN</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '11',
      name: 'Don Julio Blanco',
      type: 'Tequila',
      price: 52.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#f5f5dc" stroke="#deb887" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#daa520"/>
          <text x="50" y="95" text-anchor="middle" fill="#8b4513" font-size="6" font-family="serif">DON JULIO</text>
          <text x="50" y="105" text-anchor="middle" fill="#8b4513" font-size="6" font-family="serif">BLANCO</text>
          <text x="50" y="115" text-anchor="middle" fill="#8b4513" font-size="5" font-family="serif">TEQUILA</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '12',
      name: 'Remy Martin VSOP',
      type: 'Cognac',
      price: 64.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#cd853f" stroke="#8b4513" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="95" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">RÉMY</text>
          <text x="50" y="105" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">MARTIN</text>
          <text x="50" y="115" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">VSOP</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '13',
      name: "Jack Daniel's Old No. 7",
      type: 'Whiskey',
      price: 25.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#000000" stroke="#333" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffffff"/>
          <text x="50" y="90" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">JACK</text>
          <text x="50" y="100" text-anchor="middle" fill="#ffffff" font-size="6" font-family="serif">DANIEL'S</text>
          <text x="50" y="110" text-anchor="middle" fill="#ffffff" font-size="8" font-family="serif">No.7</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '14',
      name: 'Absolut Original Vodka',
      type: 'Vodka',
      price: 19.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#4169e1"/>
          <text x="50" y="100" text-anchor="middle" fill="#4169e1" font-size="7" font-family="serif">ABSOLUT</text>
          <text x="50" y="110" text-anchor="middle" fill="#4169e1" font-size="6" font-family="serif">VODKA</text>
        </svg>
      `),
      quantity: 0
    },
    {
      id: '15',
      name: 'Mount Gay Eclipse Rum',
      type: 'Rum',
      price: 24.99,
      imageURL: 'data:image/svg+xml;base64,' + btoa(`
        <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="50" height="140" rx="5" fill="#d2691e" stroke="#8b4513" stroke-width="2"/>
          <rect x="20" y="15" width="60" height="15" rx="3" fill="#ffd700"/>
          <text x="50" y="90" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">MOUNT</text>
          <text x="50" y="100" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">GAY</text>
          <text x="50" y="110" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">ECLIPSE</text>
          <text x="50" y="120" text-anchor="middle" fill="#ffd700" font-size="5" font-family="serif">RUM</text>
        </svg>
      `),
      quantity: 0
    }
  ];

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🗃️ Initializing LiquorApp Database...');
      
      // For now, use localStorage as the database
      // Later we'll integrate Couchbase Lite for Web
      const storedData = localStorage.getItem(`${this.databaseName}_${this.collectionName}`);
      
      if (!storedData) {
        console.log('📦 Seeding sample data...');
        await this.seedSampleData();
      } else {
        console.log('✅ Database already contains data');
      }
      
      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }

  private async seedSampleData(): Promise<void> {
    try {
      localStorage.setItem(
        `${this.databaseName}_${this.collectionName}`,
        JSON.stringify(this.sampleData)
      );
      console.log(`✅ Seeded ${this.sampleData.length} sample liquor items`);
    } catch (error) {
      console.error('❌ Failed to seed sample data:', error);
    }
  }

  async getAllLiquorItems(): Promise<ApiResponse<LiquorItem[]>> {
    try {
      const storedData = localStorage.getItem(`${this.databaseName}_${this.collectionName}`);
      
      if (!storedData) {
        return { success: false, error: 'No data found' };
      }

      const items: LiquorItem[] = JSON.parse(storedData);
      console.log(`📊 Retrieved ${items.length} liquor items from database`);
      
      return { success: true, data: items };
    } catch (error) {
      console.error('❌ Failed to get liquor items:', error);
      return { success: false, error: 'Failed to retrieve items' };
    }
  }

  async updateItemQuantity(id: string, newQuantity: number): Promise<ApiResponse<LiquorItem>> {
    try {
      const itemsResponse = await this.getAllLiquorItems();
      if (!itemsResponse.success || !itemsResponse.data) {
        return { success: false, error: 'Failed to get items' };
      }

      const items = itemsResponse.data;
      const itemIndex = items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found' };
      }

      items[itemIndex].quantity = newQuantity;
      
      localStorage.setItem(
        `${this.databaseName}_${this.collectionName}`,
        JSON.stringify(items)
      );

      console.log(`📦 Updated ${items[itemIndex].name} quantity to ${newQuantity}`);
      
      return { success: true, data: items[itemIndex] };
    } catch (error) {
      console.error('❌ Failed to update item quantity:', error);
      return { success: false, error: 'Failed to update quantity' };
    }
  }

  async searchLiquor(searchText: string): Promise<ApiResponse<LiquorItem[]>> {
    try {
      const itemsResponse = await this.getAllLiquorItems();
      if (!itemsResponse.success || !itemsResponse.data) {
        return { success: false, error: 'Failed to get items' };
      }

      const filteredItems = itemsResponse.data.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.type.toLowerCase().includes(searchText.toLowerCase())
      );

      return { success: true, data: filteredItems };
    } catch (error) {
      console.error('❌ Failed to search liquor:', error);
      return { success: false, error: 'Search failed' };
    }
  }

  async addLiquorItem(item: Omit<LiquorItem, 'id'>): Promise<ApiResponse<LiquorItem>> {
    try {
      const itemsResponse = await this.getAllLiquorItems();
      if (!itemsResponse.success || !itemsResponse.data) {
        return { success: false, error: 'Failed to get items' };
      }

      const items = itemsResponse.data;
      const newItem: LiquorItem = {
        ...item,
        id: Date.now().toString() // Simple ID generation
      };

      items.push(newItem);
      
      localStorage.setItem(
        `${this.databaseName}_${this.collectionName}`,
        JSON.stringify(items)
      );

      console.log(`➕ Added new liquor item: ${newItem.name}`);
      
      return { success: true, data: newItem };
    } catch (error) {
      console.error('❌ Failed to add liquor item:', error);
      return { success: false, error: 'Failed to add item' };
    }
  }

  // Future: Couchbase Lite integration
  async setupCouchbaseSync(): Promise<void> {
    console.log('🔄 Couchbase sync setup will be implemented later');
    // This is where we'll add Couchbase App Services integration
  }
}

export const databaseService = new DatabaseService();
