export type ListBoxItem = {
  id: number | string;
  label: string;
  [key: string]: string | number | Record<string, any> | any[];
};
