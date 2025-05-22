
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
}

export const VideoPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}: VideoPaginationProps) => {
  const isMobile = useIsMobile();
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Function to determine which page numbers to show
  const getPageNumbers = () => {
    // Show fewer siblings on mobile
    const effectiveSiblings = isMobile ? 0 : siblings;
    
    const leftSiblingIndex = Math.max(currentPage - effectiveSiblings, 1);
    const rightSiblingIndex = Math.min(
      currentPage + effectiveSiblings,
      totalPages
    );

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    // Always show first and last page
    const pageNumbers = [];

    // First page
    pageNumbers.push(1);

    // Left dots if needed
    if (showLeftDots) pageNumbers.push('leftDots');
    
    // Pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }

    // Right dots if needed
    if (showRightDots) pageNumbers.push('rightDots');
    
    // Last page if more than one page
    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers;
  };

  return (
    <Pagination className="my-6">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }}
            />
          </PaginationItem>
        )}

        {getPageNumbers().map((pageNumber, i) => {
          // Handle ellipsis
          if (pageNumber === 'leftDots' || pageNumber === 'rightDots') {
            return (
              <PaginationItem key={`${pageNumber}-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          // Handle numbered pages
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Number(pageNumber));
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
