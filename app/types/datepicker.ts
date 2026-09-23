import type { PopoverProps } from '#ui/components/Popover.vue';

export type DatepickerValue = Date | string | number;

export type DatepickerPopoverProps = Omit<
  PopoverProps<'click'>,
  | 'open'
  | 'defaultOpen'
  | 'mode'
  | 'reference'
  | 'class'
  | 'openDelay'
  | 'closeDelay'
  | 'enableTouch'
>;
