import { AlertCircle, BookOpen } from 'lucide-react';
import { ApiError } from '../../api/client';
import { BButton } from '../bookshelf/BButton';
export function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>We couldn’t complete that request</strong>
        <p>{error.message}</p>
        {error instanceof ApiError && error.requestId && (
          <small>Request ID: {error.requestId}</small>
        )}
        {retry && (
          <BButton variant="outline" className="mt-3" onClick={retry}>
            Try again
          </BButton>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <BookOpen size={28} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </header>
  );
}
