import type { ComponentProps } from 'react';
import { Button } from '../ui/button';
export function BButton(props: ComponentProps<typeof Button>) {
  return <Button {...props} />;
}
