import mongoose from "mongoose";

const notificationScema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    type: {
        type: String,
        ref: 'User',
        require: true,
        enum:[ 'follow', 'like']
    },
    read: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const Notification = mongoose.model('Notification', notificationScema);

export default Notification;