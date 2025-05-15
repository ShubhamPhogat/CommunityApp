// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import { User } from "../models/models.user.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import bcryptjs from "bcryptjs";

/**
 * User signup
 * POST /v1/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json(errorResponse("All fields are required", "VALIDATION_ERROR"));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Password must be at least 6 characters",
            "VALIDATION_ERROR"
          )
        );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(errorResponse("Email already exists", "EMAIL_ALREADY_EXISTS"));
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await User.create({
      _id: Snowflake.generate(),
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, iss: new Date().toISOString() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json(
      successResponse({
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        token,
      })
    );
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * User signin
 * POST /v1/auth/signin
 */
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json(errorResponse("All fields are required", "VALIDATION_ERROR"));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json(errorResponse("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json(errorResponse("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, iss: new Date().toISOString() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json(
      successResponse({
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        token,
      })
    );
  } catch (error) {
    console.error("Signin error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};

/**
 * Get current user
 * GET /v1/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json(
      successResponse({
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      })
    );
  } catch (error) {
    console.error("Get me error:", error);
    return res
      .status(500)
      .json(errorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  }
};
