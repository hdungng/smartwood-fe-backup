export const routing = {
  home: '/',
  businessPlan: {
    list: '/business-plan/list',
    create: (contractCode: string = ':contractCode') => `/business-plan/create/${contractCode}`,
    edit: (id: string | number = ':id') => `/business-plan/edit/${id}`,
    detail: (id: string | number = ':id') => `/business-plan/detail/${id}`,
    approval: '/business-plan/approval'
  },
  po: {
    list: '/po/list',
    create: '/po/create',
    view: (id: string | number = ':id') => `/po/view/${id}`,
    edit: (id: string | number = ':id') => `/po/edit/${id}`,
    approval: '/po/approval',
    businessPlan: '/po/business-plan'
  },
  contractPurchase: {
    list: '/contracts/purchase/list',
    create: `/contracts/purchase/create`,
    detail: (id: string | number = ':id') => `/contracts/purchase/view/${id}`,
    edit: (id: string | number = ':id') => `/contracts/purchase/edit/${id}`,
    approval: '/contracts/purchase/approval'
  },
  system: {
    authority: {
      root: '/system/authority',
      role: '/system/authority/role',
      permission: '/system/authority/permission',
    }
  }
};
