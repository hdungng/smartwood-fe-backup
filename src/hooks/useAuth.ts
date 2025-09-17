import { use } from 'react';

import AuthContext from 'contexts/JWTContext';

export default function useAuth() {
  const context = use(AuthContext);

  if (!context) throw new Error('context must be use inside provider');

  return context;
}
