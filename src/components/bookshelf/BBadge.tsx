import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
export function BBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'good' | 'warning' | 'bad';
}) {
  return (
    <Badge variant="outline" className={`status-badge ${tone}`}>
      {children}
    </Badge>
  );
}
