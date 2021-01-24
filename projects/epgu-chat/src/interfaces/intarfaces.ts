export interface LibDropdownInterface {
  id: number;
  text: string;
}

export interface FilterInterface extends LibDropdownInterface {
  value: string | number | boolean;
}
