// Role constants and access mapping
export const ROLES = {
  ADMIN: "ADMIN",
  DEALER_MANAGER: "DEALER_MANAGER",
  DEALER_STAFF: "DEALER_STAFF",
  EVM_STAFF: "EVM_STAFF",
};

// Allowed roles per dashboard child route key
export const ROUTE_ACCESS = {
  car: [ROLES.ADMIN, ROLES.DEALER_MANAGER, ROLES.DEALER_STAFF, ROLES.EVM_STAFF],
  category: [ROLES.ADMIN, ROLES.EVM_STAFF],
  contract: [ROLES.ADMIN, ROLES.DEALER_MANAGER, ROLES.DEALER_STAFF],
  customer: [ROLES.ADMIN, ROLES.DEALER_MANAGER, ROLES.DEALER_STAFF],
  testDrive: [ROLES.ADMIN, ROLES.DEALER_MANAGER, ROLES.DEALER_STAFF],
  accounts: [ROLES.ADMIN],
};

export const hasAccess = (role, allowed) => {
  if (!allowed || !Array.isArray(allowed) || allowed.length === 0) return true;
  return allowed.includes(role);
};
