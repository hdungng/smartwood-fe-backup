import { SelectionOption } from 'types/common';
import { stringHelper } from './string-helper';

export const optionHelpers = {
  enumToSelectOptions(e: Dynamic, hasAll = true, formatWhitespace = true): SelectionOption[] {
    const enumValues = Object.values(e).filter((x) => typeof x === 'string') as Dynamic[];
    const selectOptions: SelectionOption[] = [];

    for (let index = 0; index < enumValues.length; index++) {
      selectOptions.push({
        label: formatWhitespace ? stringHelper.insertWhitespacePascal(enumValues[index]) : enumValues[index],
        value: e[enumValues[index]]
      });
    }
    return selectOptions;
  },
  enumStringToSelectOptions(e: Dynamic, formatWhitespace = true): SelectionOption[] {
    const enumKeys = Object.keys(e) as Dynamic[];
    const selectOptions: SelectionOption[] = [];

    for (let index = 0; index < enumKeys.length; index++) {
      selectOptions.push({
        label: formatWhitespace ? stringHelper.insertWhitespacePascal(enumKeys[index]) : enumKeys[index],
        value: e[enumKeys[index]]
      });
    }
    return selectOptions;
  }
};
