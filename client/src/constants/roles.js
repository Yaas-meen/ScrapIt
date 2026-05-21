export const ROLES = Object.freeze({
  USER:      'user',
  ADMIN:     'admin',
  COLLECTOR: 'collector',
});

export const ROLE_LABELS = Object.freeze({
  user:      'User',
  admin:     'Admin',
  collector: 'Collector',
});

export const ROLE_LOGIN_PATHS = Object.freeze({
  user:      '/login',
  admin:     '/admin/login',
  collector: '/collector/login',
});

export const ROLE_HOME_PATHS = Object.freeze({
  user:      '/dashboard',
  admin:     '/admin/dashboard',
  collector: '/collector/dashboard',
});

export const isValidRole = (role) => Object.values(ROLES).includes(role);