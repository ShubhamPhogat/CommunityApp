import { Snowflake } from "@theinternetfolks/snowflake";
import { Role } from "../models/models.role.js";
import { errorResponse, successResponse } from "../utils/response.js";

/**
 * Create role
 * POST /v1/role
 */
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json(errorResponse("Name is required", "VALIDATION_ERROR"));
    }

    // Check if role exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res
        .status(400)
        .json(errorResponse("Role already exists", "RESOURCE_EXISTS"));
    }

    // Create role
    const role = await Role.create({
      _id: Snowflake.generate(),
      name,
    });

    return res.status(201).json(
      successResponse({
        id: role._id,
        name: role.name,
        created_at: role.created_at,
        updated_at: role.updated_at,
      })
    );
  } catch (error) {
    console.error("Create role error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get all roles
 * GET /v1/role
 */
export const getAllRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get roles with pagination
    const roles = await Role.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Role.countDocuments();
    const pages = Math.ceil(total / limit);

    // Format response
    const formattedRoles = roles.map((role) => ({
      id: role._id,
      name: role.name,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));

    return res.status(200).json(
      successResponse(formattedRoles, {
        total,
        pages,
        page,
      })
    );
  } catch (error) {
    console.error("Get all roles error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};
