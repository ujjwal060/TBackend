const express = require('express');
const router = express.Router();
const ExtensionController = require('../controllers/Extensioncontroller');

// Multer middleware for handling file uploads
const upload = ExtensionController.upload;

// POST route to add a new extension with image upload
router.post('/addExtension', upload.single('extensionImage'), ExtensionController.addExtension);
router.get('/getExtension/:shopId/:specie',ExtensionController.getExtension);
router.get('/getAll',ExtensionController.getAll);
router.delete('/deleteExten/:id',ExtensionController.deleteExtension);
router.post('/editeExten/:id', upload.single('extensionImage'), ExtensionController.editExtension);
router.post('/getByShop/:shopId',ExtensionController.getByShop);


module.exports = router;
