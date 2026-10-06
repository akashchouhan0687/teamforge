import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiscoverPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
}

export function DiscoverPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  baseUrl,
}: DiscoverPaginationProps) {
  if (totalPages <= 1) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Helper to generate page URL preserving existing search query params
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost:3000");
    url.searchParams.set("page", page.toString());
    return `${url.pathname}?${url.searchParams.toString()}`;
  };

  // Generate page numbers array (showing surrounding pages)
  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
        <span className="font-medium text-foreground">{endRecord}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span> students
      </div>

      <nav
        aria-label="Pagination"
        className="flex items-center gap-1 order-1 sm:order-2"
      >
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 gap-1 text-xs"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 gap-1 text-xs opacity-40 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled="true"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}

        {/* Page Number Buttons */}
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <Link
              key={p}
              href={getPageUrl(p)}
              className={cn(
                buttonVariants({
                  variant: isCurrent ? "default" : "outline",
                  size: "sm",
                }),
                "h-8 w-8 p-0 text-xs",
                isCurrent && "pointer-events-none"
              )}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </Link>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 gap-1 text-xs"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 gap-1 text-xs opacity-40 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled="true"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
