const express = require("express");
const router = express.Router();
const Authcontroller = require("../controllers/Authcontroller");
const verifyToken = require("../middleware/verifyToken")


//routes(private)
router.get("/",verifyToken, Authcontroller.getAuth);
router.patch("/:id", verifyToken, Authcontroller.updateAuth);
router.delete("/delete/:id", Authcontroller.deleteAuth);

//routes(public)
router.post("/Register", Authcontroller.register);
router.post("/Login", Authcontroller.login);
router.post("/send-email", Authcontroller.sendEmail);
router.post("/verify-otp", Authcontroller.verifyOTP);
router.post("/reset-password", Authcontroller.ResetPassword);


module.exports = router;
