import express from "express";
import {protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser,getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const roter = express.Router();

roter.get("/profile/:username",protectRoute, getUserProfile)
roter.get("/suggested/",protectRoute, getSuggestedUsers)
roter.post("/follow/:id",protectRoute, followUnfollowUser)
roter.post("/update/",protectRoute, updateUser)

export default roter;