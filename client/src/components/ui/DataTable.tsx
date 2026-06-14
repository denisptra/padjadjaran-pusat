import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Pagination from './Pagination';

interface DataTableProps {
  columns: {
    key: string;
    label: React.ReactNode;
    render?: (value: any, row: any, index: number) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
  showNumber?: boolean;
  startIndex?: number;
  clientPagination?: boolean;
  rowsPerPage?: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  isLoading = false, 
  emptyMessage = "Tidak ada data ditemukan.",
  onRowClick,
  className,
  showNumber = true,
  startIndex = 0,
  clientPagination = true,
  rowsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 if data changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const finalColumns = useMemo(() => {
    if (!showNumber) return columns;
    const noColumn = {
      key: '_no',
      label: 'No.',
      align: 'center' as const,
      className: 'w-12 text-gray-500',
      render: (_: any, __: any, index: number) => {
        const baseIndex = clientPagination ? (currentPage - 1) * rowsPerPage : startIndex;
        return baseIndex + index + 1;
      }
    };
    
    if (columns.length > 0 && (columns[0].key === 'select' || columns[0].key.includes('checkbox'))) {
      return [columns[0], noColumn, ...columns.slice(1)];
    }
    return [noColumn, ...columns];
  }, [columns, showNumber, clientPagination, currentPage, rowsPerPage, startIndex]);

  const displayData = useMemo(() => {
    if (!clientPagination) return data;
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, clientPagination, currentPage, rowsPerPage]);

  const totalPages = clientPagination ? Math.ceil(data.length / rowsPerPage) : 1;

  return (
    <div className={cn("w-full overflow-hidden border border-gray-200 rounded-md", className)}>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {finalColumns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn(
                    "px-5 py-3.5 text-[13px] font-medium text-gray-500 normal-case tracking-normal whitespace-nowrap",
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              Array.from({ length: Math.min(5, rowsPerPage) }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {finalColumns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length > 0 ? (
              displayData.map((row, i) => (
                <tr 
                  key={i} 
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {finalColumns.map((col) => (
                    <td 
                      key={col.key} 
                      className={cn(
                        "px-5 py-4 text-[13px] text-gray-700 font-normal",
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row[col.key], row, i) : row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={finalColumns.length} className="px-5 py-12 text-center text-[13px] text-gray-400 font-normal">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {clientPagination && totalPages > 1 && !isLoading && (
        <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            className="mt-0"
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;


