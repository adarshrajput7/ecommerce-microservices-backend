import express from 'express'
import authController from '../controllers/user.controller.js'
import validators from '../middlewares/validator.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const routes = express.Router();

// POST auth register
routes.post('/register', validators.registerUserValidations, authController.registerUser);
//Login
// routes.post('/login', validators.loginUserValidations, authController.loginUser);

//User login
routes.post('/login',validators.loginUserValidations,
    (req, res) => authController.loginUser(req, res, 'user'));
//seller login ke liye
routes.post('/seller/login',validators.loginUserValidations,
    (req, res) => authController.loginUser(req, res, 'seller'));

//Get logged in user data
routes.get('/me',authMiddleware.authMiddleware,authController.getCurrentUser);
//logout
routes.get('/logout',authController.logoutUser);
//Get user addresses
routes.get('/users/me/addresses', authMiddleware.authMiddleware, authController.getUserAddresses);
//add user address
routes.post('/users/me/addresses', validators.addUserAddressValidations, authMiddleware.authMiddleware, authController.addUserAddress);
//delete user address
routes.delete('/users/me/addresses/:addressId', authMiddleware.authMiddleware, authController.deleteUserAddress);




 export default routes;
