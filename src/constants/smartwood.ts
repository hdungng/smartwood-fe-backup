import { SelectionOption } from "types/common";

export const SMARTWOOD_SELECTIONS = ['Smartwood.No1', 'Smartwood.No2'].map((buyer, index) => ({
    label: buyer,
    value: index + 1
  })) as SelectionOption[];
  