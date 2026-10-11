import { type ComponentProps, forwardRef } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
export const BInput = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Input> & { label: string; error?: string }
>(({ label, error, id, ...props }, ref) => (
  <div className="field">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      ref={ref}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
    {error && (
      <p id={`${id}-error`} className="field-error">
        {error}
      </p>
    )}
  </div>
));
BInput.displayName = 'BInput';
