

const express = require('express');
const router = express.Router();
const SpeciesSelectcontroller = require('../controllers/SpeciesSelectcontroller');

const upload = SpeciesSelectcontroller.upload;

router.post('/addSpecies', upload.single('speciesImage'), SpeciesSelectcontroller.addSpecies);
router.post('/getSpecies/:shopId',SpeciesSelectcontroller.getSpeciesById);
router.delete('/deleteSpecies/:id',SpeciesSelectcontroller.deleteSpecies);
router.post('/SpeciesCategories', upload.single('image'), SpeciesSelectcontroller.addSpeciesCategories);
router.get('/getSpeciesCategories/',SpeciesSelectcontroller.getSpeciesCategories);
router.put('/species/:id', upload.single('image'), SpeciesSelectcontroller.editSpecies);
router.put('/speciescategory/:id', upload.single('image'), SpeciesSelectcontroller.editSpeciesCategory);

module.exports = router;
