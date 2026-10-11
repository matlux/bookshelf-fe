import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
export function BTable({
  headers,
  rows,
  caption,
}: {
  headers: { id: string; content: ReactNode }[];
  rows: { id: string; cells: { id: string; content: ReactNode }[] }[];
  caption: string;
}) {
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header.id}>{header.content}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {row.cells.map((cell) => (
              <TableCell key={cell.id}>{cell.content}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
