import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from './Input';
import Button from './Button';

interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  action?: React.ReactNode;
}

const TableToolbar: React.FC<TableToolbarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  filters,
  action 
}) => {
  return (
    <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-gray-100 bg-white">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          placeholder="Pencarian data..."
          className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        {filters}
        {action}
      </div>
    </div>
  );
};

export default TableToolbar;
