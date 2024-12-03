const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');
const { sendVerificationEmail } = require('../utilities/emailService');

// Register User
module.exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password } = req.body;
        const isUserAlready = await userModel.findOne({ email });

        if (isUserAlready) {
            return res.status(400).json({
                status: 'error',
                message: 'This email is already registered. Please login or use a different email',
                action: 'registration_failed'
            });
        }

        const hashedPassword = await userModel.hashPassword(password);
        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword
        });

        // Generate verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Generate auth token for immediate login
        const token = user.generateAuthToken();

        // Set token in cookie
        res.cookie('token', token);

        // Send verification email
        await sendVerificationEmail(user.email, verificationCode);

        res.status(201).json({
            message: 'Registration successful. Please check your email for verification code.',
            token,  // Include token in response
            user: {
                _id: user._id,
                email: user.email,
                fullname: user.fullname,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};
// Verify Email
module.exports.verifyEmail = async (req, res) => {
    try {
        const { code, email } = req.body;

        // First find the user with verification code
        const user = await userModel.findOne({
            email: email,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification code'
            });
        }

        // Update the user directly
        user.isEmailVerified = true;
        user.verificationCode = undefined;  // Use undefined instead of null
        user.verificationCodeExpires = undefined;  // Use undefined instead of null

        await user.save();  // Save the changes

        res.status(200).json({
            message: 'Email verified successfully',
            isEmailVerified: true
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Email verification failed. Please try again.',
            error: error.message
        });
    }
};

// Login User
module.exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Make sure we're getting the latest user data
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Add a console log to debug verification status
        console.log('User email verification status:', user.isEmailVerified);

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                message: 'Please verify your email before logging in',
                isEmailVerified: false
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();
        res.cookie('token', token);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullname: user.fullname,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};
// Get User Profile
module.exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                fullname: user.fullname,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile.',
            error: error.message
        });
    }
};

// Logout User
module.exports.logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            await blackListTokenModel.create({ token });
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed. Please try again.',
            error: error.message
        });
    }
};

// Resend Verification Email
module.exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified'
            });
        }

        const verificationCode = user.generateVerificationCode();
        await user.save();

        await sendVerificationEmail(user.email, verificationCode);

        res.status(200).json({
            message: 'Verification code resent successfully'
        });
    } catch (error) {
        console.error('Resend verification code error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to resend verification code. Please try again.',
            error: error.message
        });
    }
};
