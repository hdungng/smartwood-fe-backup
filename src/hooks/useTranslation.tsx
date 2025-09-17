import { useIntl } from 'react-intl';

export const useTranslation = () => {
  const intl = useIntl();

  const handleTranslate = (id: string, values?: Record<string, any>) => {
    if (!id) return '';

    // If values are provided, format the message with them
    if (values) {
      return intl.formatMessage({ id }, values);
    }

    // Otherwise, just return the message by id
    return intl.formatMessage({ id });
  };

  return {
    t: handleTranslate
  };
};
