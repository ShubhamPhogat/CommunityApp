import { Snowflake } from "@theinternetfolks/snowflake";
import { Community } from "../models/models.community.js";
import { Member } from "../models/models.memberSchema.js";
import { Role } from "../models/models.role.js";
import { User } from "../models/models.user.js";
import { errorResponse, successResponse } from "../utils/response.js";

/**
 * Check if user has permission to manage members
 * @param {String} userId - User ID
 * @param {String} communityId - Community ID
 * @param {Boolean} moderatorAllowed - Whether moderators are allowed for this action
 * @returns {Promise<Boolean>} - Whether user has permission
 */
export const hasPermission = async (
  userId,
  communityId,
  moderatorAllowed = false
) => {
  try {
    // First check if user is the community owner
    const community = await Community.findById(communityId);
    if (community && community.owner === userId) {
      return true;
    }

    // Check if user is an admin or moderator
    const adminRole = await Role.findOne({ name: "Community Admin" });
    const modRole = await Role.findOne({ name: "Community Moderator" });

    const allowedRoles = [adminRole._id];
    if (moderatorAllowed && modRole) {
      allowedRoles.push(modRole._id);
    }

    const membership = await Member.findOne({
      community: communityId,
      user: userId,
      role: { $in: allowedRoles },
    });

    return !!membership;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
};

/**
 * Add member to community
 * POST /v1/member
 */
export const addMember = async (req, res) => {
  try {
    const { community: communityId, user: userId, role: roleId } = req.body;

    const currentUserId = req.user._id;
    // Validation
    if (!communityId || !userId || !roleId) {
      return res
        .status(400)
        .json(errorResponse("All fields are required", "VALIDATION_ERROR"));
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json(errorResponse("Community not found", "RESOURCE_NOT_FOUND"));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(errorResponse("User not found", "RESOURCE_NOT_FOUND"));
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res
        .status(404)
        .json(errorResponse("Role not found", "RESOURCE_NOT_FOUND"));
    }

    // Check if user has permission (only Community Admin can add members)
    const hasAccess = await hasPermission(currentUserId, communityId, false);
    if (!hasAccess) {
      return res
        .status(403)
        .json(
          errorResponse(
            "You are not allowed to perform this action",
            "NOT_ALLOWED_ACCESS"
          )
        );
    }

    // Check if user is already a member
    const existingMember = await Member.findOne({
      community: communityId,
      user: userId,
    });
    if (existingMember) {
      return res
        .status(400)
        .json(errorResponse("User is already a member", "RESOURCE_EXISTS"));
    }

    // Add member
    const member = await Member.create({
      _id: Snowflake.generate(),
      community: communityId,
      user: userId,
      role: roleId,
    });

    return res.status(201).json(
      successResponse({
        id: member._id,
        community: member.community,
        user: member.user,
        role: member.role,
        created_at: member.created_at,
      })
    );
  } catch (error) {
    console.error("Add member error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Remove member from community
 * DELETE /v1/member/:id
 */
export const removeMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params; // Get both IDs from params
    const currentUserId = req.user._id;

    // Find member
    const member = await Member.findOne({
      _id: memberId,
      community: communityId,
    }).populate("community");

    if (!member) {
      return res
        .status(404)
        .json(errorResponse("Member not found", "RESOURCE_NOT_FOUND"));
    }

    // Check if user has permission (Community Admin or Moderator can remove members)
    const hasAccess = await hasPermission(
      currentUserId,
      communityId,
      true // Assuming this means admin access required
    );

    if (!hasAccess) {
      return res
        .status(403)
        .json(
          errorResponse(
            "You are not allowed to perform this action",
            "NOT_ALLOWED_ACCESS"
          )
        );
    }

    // Prevent removing the community owner
    if (member.user.toString() === member.community.owner.toString()) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Cannot remove the community owner",
            "NOT_ALLOWED_ACCESS"
          )
        );
    }

    // Remove member
    await Member.findByIdAndDelete(member._id);

    return res.status(200).json(successResponse({ id: member._id }));
  } catch (error) {
    console.error("Remove member error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};
