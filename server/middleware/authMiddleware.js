import jwt from "jsonwebtoken";


export const verify = async(req,res,next) =>{
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) return res.status(401).json({message: 'No token, authorization denied'});

    try{
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
        res.status(401).json({ message: 'Token is not valid' });
    }
};