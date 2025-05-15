import { Snowflake } from "@theinternetfolks/snowflake";
import { Community } from "../models/models.community.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { User } from "../models/models.user.js";
import { Role } from "../models/models.role.js";
import { Member } from "../models/models.memberSchema.js";

/**
 * Create community
 * POST /v1/community
 */
export const createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res
        .status(400)
        .json(errorResponse("Name is required", "VALIDATION_ERROR"));
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Check if community with slug exists
    const existingCommunity = await Community.findOne({ slug });
    if (existingCommunity) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Community with this slug already exists",
            "RESOURCE_EXISTS"
          )
        );
    }

    // Create community
    const communityId = Snowflake.generate();
    const community = await Community.create({
      _id: communityId,
      name,
      slug,
      owner: userId,
    });

    // Find Community Admin role
    const adminRole = await Role.findOne({ name: "Community Admin" });
    if (!adminRole) {
      return res
        .status(500)
        .json(errorResponse("Admin role not found", "INTERNAL_SERVER_ERROR"));
    }

    // Add owner as Community Admin
    await Member.create({
      _id: Snowflake.generate(),
      community: communityId,
      user: userId,
      role: adminRole._id,
    });

    return res.status(201).json(
      successResponse({
        id: community._id,
        name: community.name,
        slug: community.slug,
        owner: community.owner,
        created_at: community.created_at,
        updated_at: community.updated_at,
      })
    );
  } catch (error) {
    console.error("Create community error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get all communities
 * GET /v1/community
 */
export const getAllCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get communities with pagination
    const communities = await Community.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Community.countDocuments();
    const pages = Math.ceil(total / limit);

    // Format response with owner details
    const formattedCommunities = await Promise.all(
      communities.map(async (community) => {
        const owner = await User.findById(community.owner).select("_id name");

        return {
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: owner._id,
            name: owner.name,
          },
          created_at: community.created_at,
          updated_at: community.updated_at,
        };
      })
    );

    return res.status(200).json(
      successResponse(formattedCommunities, {
        total,
        pages,
        page,
      })
    );
  } catch (error) {
    console.error("Get all communities error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get all members of a community
 * GET /v1/community/:id/members
 */
export const getAllMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Default page size
    const skip = (page - 1) * limit;

    const community = await Community.findById(id);
    if (!community) {
      return res
        .status(404)
        .json(errorResponse("Community not found", "RESOURCE_NOT_FOUND"));
    }

    const members = await Member.find({ community: id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Member.countDocuments({ community: id });
    const pages = Math.ceil(total / limit);

    // Format response with user and role details
    const formattedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await User.findById(member.user).select("_id name");

        const role = await Role.findById(member.role).select("_id name");

        return {
          id: member._id,
          community: member.community,
          user: {
            id: user._id,
            name: user.name,
          },
          role: {
            id: role._id,
            name: role.name,
          },
          created_at: member.created_at,
        };
      })
    );

    return res.status(200).json(
      successResponse(formattedMembers, {
        total,
        pages,
        page,
      })
    );
  } catch (error) {
    console.error("Get all members error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get communities owned by current user
 * GET /v1/community/me/owner
 */
export const getMyOwnedCommunities = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Default page size
    const skip = (page - 1) * limit;

    // Get owned communities with pagination
    const communities = await Community.find({ owner: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Community.countDocuments({ owner: userId });
    const pages = Math.ceil(total / limit);

    // Format response (owner is not expanded as it's the current user)
    const formattedCommunities = communities.map((community) => ({
      id: community._id,
      name: community.name,
      slug: community.slug,
      owner: community.owner,
      created_at: community.created_at,
      updated_at: community.updated_at,
    }));

    return res.status(200).json(
      successResponse(formattedCommunities, {
        total,
        pages,
        page,
      })
    );
  } catch (error) {
    console.error("Get my owned communities error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get communities where current user is a member
 * GET /v1/community/me/member
 */
export const getMyJoinedCommunities = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Default page size
    const skip = (page - 1) * limit;

    const memberships = await Member.find({ user: userId })
      .select("community")
      .distinct("community");

    const communities = await Community.find({ _id: { $in: memberships } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = memberships.length;
    const pages = Math.ceil(total / limit);

    const formattedCommunities = await Promise.all(
      communities.map(async (community) => {
        // Find owner's details (only id and name)
        const owner = await User.findById(community.owner).select("_id name");

        return {
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: owner._id,
            name: owner.name,
          },
          created_at: community.created_at,
          updated_at: community.updated_at,
        };
      })
    );

    return res.status(200).json(
      successResponse(formattedCommunities, {
        total,
        pages,
        page,
      })
    );
  } catch (error) {
    console.error("Get my joined communities error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};
