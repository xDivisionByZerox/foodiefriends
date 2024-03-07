const express = require('express');
const { UserController, decodeFromToken } = require('../controllers/userController');
const RestaurantController = require('../controllers/restaurantController');
const ProfileController = require('../controllers/profileController');
const PairController = require('../controllers/pairController');

const router = express.Router();

router.post('/api/profile',ProfileController.createProfile);
router.get('/api/profile/:id',ProfileController.checkProfile);
router.put('/api/profile',ProfileController.updateProfile);

router.get('/api/filter',RestaurantController.checkFilter);
router.put('/api/filter',RestaurantController.createFilter);

router.post('/api/day',RestaurantController.createDay);
router.get('/api/day',RestaurantController.getDay);
router.put('/api/day',RestaurantController.updateDay);

router.put('/api/date',RestaurantController.createDate);
router.get('/api/date',RestaurantController.getDate);

module.exports = router;
