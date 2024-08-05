const user = require("../models/Authmodel");
const bcrypt = require("bcrypt");


const viewProfile=async(req,res)=>{
    try{
        const {id}=req.params;
        const result=await user.findById(id);
        res.json({
            status:200,
            msg:"get user details",
            data:result
        })    
    }catch(error){
        res.json({
      status:500,
      msg:error.message
    })
    }
}

const editProfile=async(req,res)=>{
    try{
        const {id}=req.params;
        const result = await user.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );
        if (!result) return res.status(404).send('User not found');
        res.json({
            status:200,
            msg:"Updated....!!",
            data:result
        })    
    }catch(error){
        res.json({
            status:500,
            msg:error.message
        })
    }
}

const changePassword=async(req,res)=>{
    try {
        const { oldPassword, newPassword } = req.body;
        const {id}=req.params;
        if (!oldPassword || !newPassword) {
            return res.status(400).send('Old password and new password are required');
        }
        const users = await user.findById(id);
        if (!users) return res.status(404).send('User not found');
    
        const isPasswordValid = await bcrypt.compare(oldPassword, users.password);
        if (!isPasswordValid) return res.status(400).send('Old password is incorrect');
    
        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
    
        await users.save();
        res.json({
            status:200,
            msg:"Password changed successfully"
        })
    }catch(error){
        res.json({
            status:500,
            msg:error.message
        })
    }
}

module.exports={viewProfile,editProfile,changePassword}