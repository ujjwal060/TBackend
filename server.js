require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
require('./controllers/coronjob');
const Authroutes = require("./routes/Authroutes");
const ShopDetailsroute = require("./routes/ShopDetailsroute");
const SpeciesSelectroute = require("./routes/SpeciesSelectroute");
const Extensionroute = require("./routes/Extensionroute");
const order=require('./routes/orderRoutes');
const payment=require('./routes/paymentRoutes');
const adminauthRoute = require("./routes/adminauthRoute");
const vendorRoute = require("./routes/vendorRoute");
const user=require("./routes/userRoutes");
const subscription=require('./routes/subscriptionRoutes');
const contactUs=require('./routes/contactRoute')

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const createError = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;

const corsOptions = {
  origin: '*', // Allow requests from localhost:3001
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());


const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});


const upload = multer({ storage: storage });

// Routes
app.use("/api/auths", Authroutes);
app.use("/api/admin", adminauthRoute);
app.use("/api/ShopDetails", ShopDetailsroute);
app.use("/api/vendor", vendorRoute);
app.use("/api/species", SpeciesSelectroute);
app.use("/api/Extension", Extensionroute);
app.use("/api", order);
app.use('/api',payment );
app.use('/api',user );
app.use('/api',subscription );
app.use('/api',contactUs );




// Endpoint for uploading images
app.post("/api/upload", upload.single('productname'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost



:${PORT}/uploads/${req.file.filename}`
  });
});

// Serve static images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});




// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Node API app is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = app;
