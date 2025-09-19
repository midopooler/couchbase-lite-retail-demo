// Inventory Statistics Component - iOS inspired design
import React from 'react';
import { Package, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import { InventoryStats as StatsType } from '../types';

interface InventoryStatsProps {
  stats: StatsType;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Items */}
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalItems}</p>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-xl font-bold text-gray-900">
              ${stats.totalValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-xl font-bold text-gray-900">{stats.lowStockItems}</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-xl font-bold text-gray-900">
              {Object.keys(stats.categories).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
