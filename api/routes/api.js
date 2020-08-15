const express = require('express')
const router = express.Router()
const albumsController = require('../controllers/photo.controller')

router.get('/health', albumsController.healthCheck);
router.post('/photos/list', albumsController.listPhotos);
router.put('/photos', albumsController.uploadPhotos);
router.delete('/photos/:Album/:FileName', albumsController.deletePhoto);
router.get('/photos/:Album/:FileName', albumsController.readFile);
router.delete('/photos', albumsController.deletePhotos)

module.exports = router