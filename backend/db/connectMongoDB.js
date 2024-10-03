import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connect succes: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(`Error conect to mongoDB: ${error.message}`);
        process.exit(1);
        
    }
}

export default connectMongoDB;