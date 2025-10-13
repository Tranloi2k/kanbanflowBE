const { USER_ROLES, isRoleHigherOrEqual } = require("../constants/roles");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

/**
 * Check if user has project admin permissions
 * User must be either:
 * 1. System admin/super_admin
 * 2. Project admin (member with admin role)
 * 3. Project lead (legacy)
 */
const requireProjectAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    // System admins can access any project
    if (isRoleHigherOrEqual(req.user.role, USER_ROLES.ADMIN)) {
      return next();
    }

    // Check project membership with admin role
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        role: "admin"
      }
    });

    // Check if user is project lead (legacy support)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { leadId: true }
    });

    if (!projectMember && project?.leadId !== userId) {
      throw new ApiError(403, "You must be a project admin to perform this action");
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    
    console.error("Project admin check error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * Check if user has project member permissions
 * User must be either:
 * 1. System admin/super_admin
 * 2. Project member (any role)
 * 3. Project lead (legacy)
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    // System admins can access any project
    if (isRoleHigherOrEqual(req.user.role, USER_ROLES.ADMIN)) {
      return next();
    }

    // Check project membership
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId
      }
    });

    // Check if user is project lead (legacy support)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { leadId: true }
    });

    if (!projectMember && project?.leadId !== userId) {
      throw new ApiError(403, "You must be a project member to access this resource");
    }

    // Store project membership info for use in controllers
    req.projectMembership = {
      role: projectMember?.role || (project?.leadId === userId ? 'lead' : null),
      isAdmin: projectMember?.role === 'admin' || project?.leadId === userId,
      isMember: !!projectMember || project?.leadId === userId
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    
    console.error("Project member check error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * Check if user can modify their own resource or is admin
 */
const requireSelfOrAdmin = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  
  if (req.user.id === userId || isRoleHigherOrEqual(req.user.role, USER_ROLES.ADMIN)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: "You can only modify your own resources or must be an admin"
  });
};

module.exports = {
  requireProjectAdmin,
  requireProjectMember,
  requireSelfOrAdmin
};