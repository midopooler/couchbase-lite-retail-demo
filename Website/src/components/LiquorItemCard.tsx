// LiquorItemCard component matching iOS design
import React from 'react';
import { Minus, Plus, Package } from 'lucide-react';
import { LiquorItem } from '../types';

interface LiquorItemCardProps {
  item: LiquorItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const LiquorItemCard: React.FC<LiquorItemCardProps> = ({
  item,
  onIncrement,
  onDecrement
}) => {
  return (
    <div className="ios-card p-4 space-y-3">
      {/* Product Image */}
      <div className="relative">
        <img
          src={item.imageURL}
          alt={item.name}
          className="w-full h-32 object-cover rounded-lg bg-gray-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=${encodeURIComponent(item.name.slice(0, 10))}`;
          }}
        />
        
        {/* Low stock indicator */}
        {item.quantity < 5 && item.quantity > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        )}
        
        {/* Out of stock indicator */}
        {item.quantity === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {item.type}
          </span>
          <span className="font-bold text-green-600">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quantity Control - iOS Style */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Qty:</span>
          <span className="font-semibold text-gray-900">{item.quantity}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Decrement Button */}
          <button
            onClick={() => onDecrement(item.id)}
            disabled={item.quantity === 0}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${item.quantity === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300'
              }
            `}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          {/* Current Quantity Display */}
          <div className="w-12 text-center">
            <span className="text-lg font-bold text-gray-900">
              {item.quantity}
            </span>
          </div>
          
          {/* Increment Button */}
          <button
            onClick={() => onIncrement(item.id)}
            className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-300 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total Value */}
      {item.quantity > 0 && (
        <div className="text-right text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
