import React from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPagesCapped = Math.max(1, totalPages);

  return (
    <div className="py-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between text-sm gap-4 bg-card rounded-b-xl">
      <span className="text-muted-foreground w-full sm:w-auto text-center sm:text-left">
        Menampilkan {startItem} hingga {endItem} dari {totalItems} data
      </span>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || totalItems === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPagesCapped }).map((_, i) => (
            <button
              key={i}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
              }`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPagesCapped))}
          disabled={currentPage === totalPagesCapped || totalItems === 0}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
