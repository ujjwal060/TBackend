

const express = require('express');
const router = express.Router();
const SpeciesSelectcontroller = require('../controllers/SpeciesSelectcontroller');

const upload = SpeciesSelectcontroller.upload;

router.post('/addSpecies', upload.single('speciesImage'), SpeciesSelectcontroller.addSpecies);
router.get('/getSpecies/:shopId',SpeciesSelectcontroller.getSpeciesById)
router.delete('/deleteSpecies/:id',SpeciesSelectcontroller.deleteSpecies)
module.exports = router;
