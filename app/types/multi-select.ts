export type MultiSelectItem<T = string | number> = {
  label: string;
  value: T;
  disabled?: boolean;
  onSelect?(e?: Event): void;
  children?: MultiSelectItem<T>[];
  [key: string]: any;
};
