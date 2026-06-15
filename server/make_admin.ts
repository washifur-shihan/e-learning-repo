import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './models/user.model';

dotenv.config();

const dbUrl: string = process.env.DB_URL || '';

const makeAdmin = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log(`Database connected successfully to ${mongoose.connection.host}`);
        
        const user = await userModel.findOne({ email: 'washifur.mail@gmail.com' });
        if (!user) {
            console.log("User not found with email: washifur.mail@gmail.com");
        } else {
            user.role = 'admin';
            await user.save();
            console.log("Successfully upgraded washifur.mail@gmail.com to admin!");
        }

        process.exit(0);
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

makeAdmin();
