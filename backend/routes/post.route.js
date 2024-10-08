import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { commentPost, createPost, deletePost, getAllPost, getFollowingPost, getLikesPost, getUserPost, likeUnlikePost } from "../controllers/post.controller.js"

const router = express.Router();

router.get("/all", protectRoute, getAllPost)
router.get("/following", protectRoute, getFollowingPost)
router.get("/likes/:id", protectRoute, getLikesPost)
router.get("/user/:username", protectRoute, getUserPost)
router.post("/create", protectRoute,createPost)
router.post("/like/:id", protectRoute,likeUnlikePost)
router.post("/comment/:id", protectRoute,commentPost)
router.delete("/:id", protectRoute, deletePost)

export default router;