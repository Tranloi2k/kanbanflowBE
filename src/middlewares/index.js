/**
 * Centralized middleware exports
 * Import all authentication and authorization middlewares from here
 */

const { protect, authorize } = require("./auth");
const { requireProjectAdmin, requireProjectMember, requireSelfOrAdmin } = require("./projectAuth");
const { USER_ROLES } = require("../constants/roles");

// Common middleware combinations
const requireAuth = protect;
const requireAdmin = [protect, authorize(USER_ROLES.ADMIN)];
const requireSuperAdmin = [protect, authorize(USER_ROLES.SUPER_ADMIN)];
const requireAdminOrModerator = [protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MODERATOR)];

// Project-specific middleware combinations
const requireProjectAdminAccess = [protect, requireProjectAdmin];
const requireProjectMemberAccess = [protect, requireProjectMember];

// User-specific middleware combinations
const requireSelfOrAdminAccess = [protect, requireSelfOrAdmin];

module.exports = {
  // Basic auth
  protect,
  authorize,
  
  // Role-based access
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  requireAdminOrModerator,
  
  // Project-based access
  requireProjectAdmin,
  requireProjectMember,
  requireProjectAdminAccess,
  requireProjectMemberAccess,
  
  // Resource ownership access
  requireSelfOrAdmin,
  requireSelfOrAdminAccess,
  
  // Constants
  USER_ROLES
};