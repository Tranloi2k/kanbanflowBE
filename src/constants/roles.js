/**
 * User Roles Constants
 * Centralized role management for the application
 */

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  SUPER_ADMIN: 'super_admin'
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 4,
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.MODERATOR]: 2,
  [USER_ROLES.USER]: 1
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'manage_system',
    'manage_users',
    'manage_projects',
    'manage_content',
    'view_analytics'
  ],
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_projects',
    'manage_content',
    'view_analytics'
  ],
  [USER_ROLES.MODERATOR]: [
    'manage_content',
    'view_analytics'
  ],
  [USER_ROLES.USER]: [
    'create_projects',
    'join_projects',
    'create_issues'
  ]
};

// Helper functions
const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

const isRoleHigherOrEqual = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  isValidRole,
  hasPermission,
  isRoleHigherOrEqual,
  getRoleLevel
};