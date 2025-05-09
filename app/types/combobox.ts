export type ComboBoxValue = {
  label: string;
  value: number | string;
  [key: string]: string | number | Record<string, any> | any[];
};

export type ComboBoxItem = ComboBoxValue & {
  _children?: ComboBoxItem[];
};
