const validator = require('validator');
const userService = require('../service/user.service.js');
const otpService = require('../service/otp.service.js');
const sendOTP = require('../utils/email.utils.js');
const jwt = require('jsonwebtoken');
const env = require('../../config/env.config.js');

exports.sendOTP = async (req, res) => {
    const { email, phone_number } = req.body;
    try {
        if (!email && !phone_number) {
            return res.status(400).json({
                message: 'Please provide a valid email or phone number.',
            });
        }
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Invalid email format. Please provide a valid email.',
            });
        }
        if (phone_number) {
            if (!validator.isMobilePhone(phone_number, 'any')) {
                return res.status(400).json({
                    message: 'Invalid phone number. Please provide a valid phone number.',
                });
            }
            if (phone_number.length !== 10) {
                return res.status(400).json({
                    message: 'Invalid phone_number. Please provide a valid 10 digit phone number.'
                });
            }
        }
        let user;
        if (email) {
            user = await userService.getUser({ email });
            if (!user) {
                return res.status(404).json({
                    message:'Email not found.Please provide valid email.'
                })
            }
        } 
        else if (phone_number) {
            user = await userService.getUser({ phone_number });
            if (!user) {
                return res.status(404).json({
                    message:'Phone number not found. Please provide valid phone number.'
                })
            }
        }
        const user_id = user.user_id;
        const otp = otpService.generateOTP(4);
        const otpExpiryTime = new Date(Date.now() + 5 * 60000);
        await otpService.saveOTP({
            user_id,
            otp,
            expiry_time: otpExpiryTime,
        });
        if (email) {
            await sendOTP(email, otp); 
        }
    
            res.status(200).json({
                message: 'OTP sent successfully',
                data: {
                    user_id,
                    otp,
                    expiry_time: otpExpiryTime.toISOString(),
                },
            });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            message: 'Something went wrong. Please try again later.',
        });
    }
};


exports.loginWithOTP = async (req, res) => {
    const { email, phone_number, otp } = req.body;
    if (!otp || otp.length !== 4) {
        return res.status(400).json({
            message: 'Invalid OTP format. Please check the OTP format.',
        });
    }
    try {
        let user;
        if (email) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    message: 'Invalid email format. Please check the email format.'
                });
            }
            user = await userService.getUser({ email });
            if (!user) {
                return res.status(404).json({
                    message: 'Email not found. Please provide a valid email.'
                });
            }
        }
        else if (phone_number) {
            if (!validator.isMobilePhone(phone_number, 'any')) {
                return res.status(400).json({
                    message: 'Invalid phone number format. Please check the phone number format.'
                });
            }
            if (phone_number.length !== 10) {
                return res.status(400).json({
                    message: 'Invalid phone number length. It should be 10 digits.'
                });
            }
            user = await userService.getUser({ phone_number });
            if (!user) {
                return res.status(404).json({
                    message: 'Phone number not found. Please provide a valid phone number.'
                });
            }
        }
        if (!email && !phone_number) {
            return res.status(400).json({
                message: 'Either email or phone number must be provided.'
            });
        }
        const identify = email || phone_number;
        const isValidOTP = await otpService.verifyOTP(identify, otp);
        if (!isValidOTP.valid) {
            return res.status(401).json({
                message: 'Invalid OTP. Please provide the correct OTP.',
            });
        }
        const auth_code = jwt.sign({user_id: user.user_id,phone_number: user.phone_number }, env.JWT_SECRET, { expiresIn: '5m' });
        return res.status(200).json({
            message: 'Login successful',
            data: {
                auth_code: auth_code
            }
        });
    } catch (error) {
        console.error('Error logging in with OTP:', error);
        return res.status(500).json({
            message: 'Something went wrong. Please try again later.',
        });
    }
};