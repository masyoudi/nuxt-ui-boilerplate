export type MultiSelectItemValue = {
  label: string;
  value: number | string;
  disabled?: boolean;
  onSelect?(e?: Event): void;
  [key: string]: any;
};

export type MultiSelectItem = MultiSelectItemValue & {
  children?: MultiSelectItem[];
};
