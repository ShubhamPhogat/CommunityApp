//express server
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import findConfig from "find-config";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import roleRouter from "./routers/roleRouter.js";
import communityRouter from "./routers/communityRouter.js";
import memberRouter from "./routers/memberRouter.js";
import connectToMongoDB from "./Db.js";

dotenv.config({ path: findConfig("/.env") });
const app = express();
const PORT = 8000;
connectToMongoDB();
//middleware
app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//routes

// API Routes
app.use("/v1/auth", authRouter);
app.use("/v1/role", roleRouter);
app.use("/v1/community", communityRouter);
app.use("/v1/member", memberRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
