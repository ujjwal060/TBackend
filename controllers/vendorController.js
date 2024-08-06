const user = require('../models/Authmodel');
const createError = require('../middleware/error')
const createSuccess = require('../middleware/success')
const bcrypt = require("bcrypt");


const getVendor = async (req, res) => {
  try {
    const {status}=req.body;
    let  result=[];
    if(status=='ALL' || status=='' ){
      result = await user.find({role:"vendor"});
    }else{
      result = await user.find({role:"vendor",status:status});
    }
    res.json({
      msg: 'get all vendor',
      status: 200,
      data: result
    })
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: err.message
  });
  }
}

const deleteVendor=async(req,res)=>{
    try{
        const {id} =req.params;
        const result = await user.findByIdAndDelete(id);
        res.json({
          msg: 'vendor deleted....!',
          status: 200,
        })
      } catch (error) {
        res.status(500).send("error");
    }
}


const getUser = async (req, res) => {
  try {
    const result = await user.find({role:"user"});
    res.json({
      msg: 'get all user',
      status: 200,
      data: result
    })
  } catch (error) {
    res.status(500).send("error");
  }
}


const deleteUser=async(req,res)=>{
  try{
      const {id} =req.params;
      const result = await user.findByIdAndDelete(id);
      res.json({
        msg: 'user deleted....!',
        status: 200,
      })
    } catch (error) {
      res.status(500).send("error");
  }
}

const approveVendor=async(req,res)=>{
  try{
    const {id,status}=req.body;
    const result=await user.findById(id);
    result.status=status
    result.save()
    if(status=='accepted'){
      return res.status(200).json({ message: "Vendor accepted" });
    }else{
      return res.status(200).json({ message: "Vendor rejected" });
    }
  }catch(error){
    return next(createError(500, "Something went wrong"));
  }
}


const viewProfile=async(req,res)=>{
  try{
      const {id}=req.params;
      const result=await user.findById(id);
      res.json({
          status:200,
          msg:"get Vendor details",
          data:result
      })    
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
  });
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
      if (!result) return res.status(404).send('Vendor not found');
      res.json({
          status:200,
          msg:"Updated....!!",
          data:result
      })    
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
  });
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
      if (!users) return res.status(404).send('Vendor not found');
  
      const isPasswordValid = await bcrypt.compare(oldPassword, users.password);
      if (!isPasswordValid) return res.status(400).send('Old password is incorrect');
  
      const hashedPassword = await bcrypt.hash(newPassword,10);
      users.password = hashedPassword;
  
      await users.save();
      res.json({
          status:200,
          msg:"Password changed successfully"
      })
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
  });
  }
}

module.exports = { getVendor ,deleteVendor, getUser, deleteUser,approveVendor,viewProfile,editProfile,changePassword}