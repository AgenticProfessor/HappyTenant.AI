import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showCard?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 4, showCard = true }: TableSkeletonProps) {
  const TableContent = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(columns)].map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton
                  className="h-4"
                  style={{
                    width: `${60 + (colIndex % 3) * 20}%`
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (showCard) {
    return (
      <Card aria-busy="true" aria-live="polite">
        <TableContent />
      </Card>
    );
  }

  return (
    <div aria-busy="true" aria-live="polite">
      <TableContent />
    </div>
  );
}
