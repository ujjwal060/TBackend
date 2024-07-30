const user = require('../models/Authmodel');
const createError = require('../middleware/error')
const createSuccess = require('../middleware/success')

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
    res.status(500).send("error");
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

module.exports = { getVendor ,deleteVendor, getUser, deleteUser,approveVendor}