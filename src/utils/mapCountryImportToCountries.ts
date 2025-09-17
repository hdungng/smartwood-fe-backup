import { CODE_COUNTRY_IMPORT } from 'constants/code';
import countries from 'data/countries';
type DynamicOption = {
  id: number;
  code: string;
  data: { key: string; value: string }[];
};
interface CountryType {
  code: string;
  label: string;
  phone: string;
  suggested?: boolean;
}
export function mapCountryImportToCountries(options: DynamicOption[]): CountryType[] {
  const item = options.find((o) => o.code === CODE_COUNTRY_IMPORT);
  if (!item) return [];

  return item.data.map(({ key, value }) => {
    const country = countries.find((c) => c.code === value);
    return {
      code: value,
      label: key,
      phone: country?.phone ?? '',
      suggested: country?.suggested
    };
  });
}
