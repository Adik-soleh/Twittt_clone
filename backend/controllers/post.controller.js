import Notication from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if(!user) return res.status(404).json({ message: "user tidka di temukan"})
        
        if(!text && !img) {
            return res.status(400).json({ error: "post image atau text!"});  
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user:userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.sttaus(500).json({ error: "Internal server error"});
        console.log("Error pada createPost controller: ", error);
        
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) {
            return res.status(404).json({error: "Post tidak di temukan"})
        }

        if(post.user.toString( ) !== req.user._id.toString()) {
            return res.status(401).json({error: "tidak memiliki akses untuk hapus"})
        }

        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "post berahsil di hapus"})
    } catch (error) {
        console.log("Terdapat eeror di controller deletePost: ", error);
        res.status(500).json({ error: "Server internal error :("})
        
    }
};

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text) {
            return res.status(400).json({ error: "Text harus di isi"});
        }
        const post = await Post.findById(postId)

        if(!post) {
            return res.status(404).json({error: "Post tidak dapat di temukan"})
        }

        const comment = {user: userId, text}

        post.comments.push(comment);
        await post.save();
        
        res.status(200).json(post);
    } catch (error) {
        console.log("Terdapat eeror di controller commentPost: ", error);
        res.status(500).json({ error: "Server internal error :("})
        
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;
        
        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).json({error: "Post tidak di temukan"})
        }
        
        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost) {
            // Unlike
            await Post.updateOne({_id:postId}, {$pull: {likes: userId}});
            await User.updateOne({_id:userId}, {$pull: {likedPost: postId}});

            const updateLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updateLikes);
        } else {
            // Like
        post.likes.push(userId);
        await User.updateOne({_id:userId}, {$push: {likedPost: postId}});
        await post.save();
        
        const notification = new Notication({
            from: userId,
            to: post.user,
            type: "like"
        })
        await notification.save();

        const updateLikes = post.likes;
        res.status(200).json(updateLikes);
    }
    } catch (error) {
       
        console.log("Terdapat eeror di controller likeUnlikePost: ", error);
        res.status(500).json({ error: "Server internal error :("})
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const post = await Post.find().sort({ createAt: -1}).populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        if(post.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(post);
    } catch (error) {
        console.log("Terdapat eeror di controller s: ", error);
        res.status(500).json({ error: "Server internal error :("})
        
    }
};

export const getLikesPost = async (req, res) => {

    const userId = req.params.id;

    try {
       const user = await User.findById(userId);
       if(!user) return res.status(404).json({error: "User tidak di temukan"});
       
       const likedPost = await Post.find({ _id: { $in: user.likedPost} })
       .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });
        
        res.status(200).json(likedPost);
    } catch (error) {
        
        console.log("Terdapat eeror di controller getLikesPost: ", error);
        res.status(500).json({ error: "Server internal error :("})
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(400).json({ error: "User tidak di temukan"});

        const following = user.following;

        const feadPost = await Post.find({ user: { $in: following} })
            .sort({ createdAt: -1})
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });
            
            res.status(200).json(feadPost);
    } catch (error) {
        console.log("Terdapat eeror di controller getfollowingPost: ", error);
        res.status(500).json({ error: "Server internal error :("})
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if(!user) return res.status(400).json({ error: "User tidak di temukan"});

        const post = await Post.find({ user: user._id}).sort({ createdAt: -1}).populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(post)
    } catch (error) {
        console.log("Terdapat eeror di controller getuserPost: ", error);
        res.status(500).json({ error: "Server internal error :("})
    }
}