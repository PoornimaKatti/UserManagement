const OTP = require('../models/otp.model');
const { Op } = require('sequelize');
const userService = require('./user.service');
const validator = require('validator');


exports.saveOTP = async (otpData) => {
    try {
        const otp = await OTP.create({
            otp: otpData.otp,
            expiry_time: otpData.expiry_time,
            user_id: otpData.user_id,
        });
        return otp;
    } catch (error) {
        throw new Error(`Error saving OTP: ${error.message}`);
    }
};

exports.generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
};

exports.verifyOTP = async (identify, otp) => {
    try {
        let user;
        if (validator.isEmail(identify)) {
            user = await userService.getUser({ email: identify });
        } else {
            user = await userService.getUser({ phone_number: identify });
        }

        if (!user) {
            return { valid: false, message: 'Email or phone number not found.' };
        }
        const user_id = user.user_id;
        const otpRecord = await OTP.findOne({
            where: {
                user_id: user_id,
                otp: otp,
                expiry_time: {
                    [Op.gt]: new Date()
                }
            },
            order: [['createdAt', 'Desc']]
        });

        if (!otpRecord) {
            return {message: 'Invalid or expired OTP.' };
        }

        return { valid: true };
    } catch (error) {

        console.error('Error verifying OTP:', error);
        throw new Error(`Error verifying OTP: ${error.message}`);
    }
};