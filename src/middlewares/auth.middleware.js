import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";
import { User } from "../models/models.user.js";

export default async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(errorResponse("Not authenticated", "NOT_AUTHENTICATED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json(errorResponse("Not authenticated", "NOT_AUTHENTICATED"));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json(errorResponse("Not authenticated", "NOT_AUTHENTICATED"));
  }
};
