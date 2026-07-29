import type { TooltipOptions } from '~/directives/tooltip';

interface AppTooltipState extends Omit<TooltipOptions, 'getReference'> {
  open: boolean;
}

export function useStateAppTooltip() {
  return useState<AppTooltipState>('app:tooltip', () => ({
    open: false,
    text: '',
    arrow: true,
    delayDuration: 150
  }));
}
