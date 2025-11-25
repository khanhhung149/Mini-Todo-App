import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../utils/validation.js";


export const register = async(req, res) =>{
    try{
        const {error} = registerSchema.validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});

        const {username, password} =req.body;
        const existingUser = await User.findOne({username});
        if(existingUser) return res.status(400).json({message: 'Username already exists'});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword =await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password: hashedPassword
        });
        res.status(201).json({message: 'User registered successfully'});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
};

export const login = async (req,res) =>{
    try{
        const {error} = loginSchema.validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});

        const {username, password} = req.body;

        const user = await User.findOne({username});
        if(!user) return res.status(400).json({message: 'User not found'});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: 'Wrong password'});

        const JWT_SECRET = process.env.JWT_SECRET

        const token = jwt.sign({id: user._id}, JWT_SECRET,{expiresIn: '1d'});
        res.status(200).json({token, user:{id: user._id, username: user.username}});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}