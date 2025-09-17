import { use } from 'react';

import { DialogContext } from 'contexts/DialogContext';

export const useDialog = () => {
  const context = use(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }

  return context;
};
