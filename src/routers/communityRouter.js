// routes/community.routes.js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createCommunity,
  getAllCommunities,
  getAllMembers,
  getMyJoinedCommunities,
  getMyOwnedCommunities,
} from "../controllers/communityController.js";

const communityRouter = express.Router();

// Community routes
communityRouter.post("/", authMiddleware, createCommunity);
communityRouter.get("/", getAllCommunities);
communityRouter.get("/:id/members", authMiddleware, getAllMembers);
communityRouter.get("/me/owner", authMiddleware, getMyOwnedCommunities);
communityRouter.get("/me/member", authMiddleware, getMyJoinedCommunities);

export default communityRouter;
