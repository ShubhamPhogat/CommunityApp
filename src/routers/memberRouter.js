// routes/member.routes.js
import express from "express";
import { addMember, removeMember } from "../controllers/memberController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const memberRouter = express.Router();

// Member routes
memberRouter.post("/", authMiddleware, addMember);
memberRouter.delete("/:communityId/:memberId", authMiddleware, removeMember);

export default memberRouter;
