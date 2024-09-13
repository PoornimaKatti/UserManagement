const userService = require('../service/user.service');
const Role = require('../models/role.model');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const config = require('../../config/env.config');
const jwt = require('jsonwebtoken');
const validator = require('validator');


exports.Register = async (req, res) => {
    const { user_name,phone_number, email, role_name, password } = req.body;
    if (!user_name || !phone_number || !email || !role_name || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (password.length !== 6) {
        return res.status(400).json({ message: 'Password must be exactly 6 characters long.' });
    }
    if (phone_number.length !== 10) {
        return res.status(400).json({
            message: 'Invalid phone_number. Please provide a valid 10 digit phone number.'});
    }
    try {
      const existingUser = await userService.getUser({email});
      if(existingUser){
        return res.status(400).json({message:"Email is already exist.Please provide new email."})
      }
      const existphone_number = await userService.getUser({phone_number});
      if(existphone_number){
        return res.status(400).json({message:"Phone number is already exist.Please provide new phone_number."})
      }
     
      let role = await Role.findOne({ where: { role_name } });
        if (!role) {
           return res.status(400).json({message:'Invalid role.'});
        }
        const user = await userService.createUser({
            user_name,
            phone_number,
            email,
            role_id:role.role_id,
            password,
        });
        res.status(201).json({
            message: 'User registered successfully',
            data: {
                user_id: user.user_id,
                role_name: role_name,
                role_id:role.role_id
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

exports.loginWithPassword = async (req, res) => {
    const { email,phone_number, password } = req.body;
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!password) {
        return res.status(400).json({ messsage: "Invalid password.Please provide valid password." })
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
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid password, please try again.' });
        }
        
        const auth_code = jwt.sign({ user_id: user.user_id,phone_number: user.phone_number}, config.JWT_SECRET, { expiresIn: '5m' });
        const user_name = user.user_name
        res.status(200).json({
            message: 'Login successfully.',
            data: {
                auth_code,
                user_name
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

exports.changePassword = async (req, res) => {
    const {email , old_password, new_password} = req.body;
    if(!email || !old_password || !new_password){
        return res.status(400).json('All fields are required.');
    }
    try {
        const user = await User.findOne({where:{ email }});
        if(!user){
            return res.status(400).send('User not found.');
        }
        const isMatch = await bcrypt.compare(old_password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Old password is incoorect.Please try again.'});
        }
        const hashedNewPassword = await bcrypt.hash(new_password , 10);
        await user.update({ password: hashedNewPassword});
        res.status(200).json({message:'Password changed successfully.'})
        
    } catch (error) {
        res.status(500).json({message: 'Error changing password.'})
    }
}
   
exports.refreshLoginToken = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ message: 'Auth code is required.Please provide valid auth_code.' });
    }
    const auth_code = authHeader.split(' ')[1];
    if(!auth_code){
        return res.status(400).json({ message: 'Auth code is missing.Please provide valid auth_code.' });
    }
    try {
        const decoded = jwt.verify(auth_code, config.JWT_SECRET);
        const newAuthCode = jwt.sign({ user_id: decoded.user_id , phone_number: decoded.phone_number}, config.JWT_SECRET, { expiresIn: '5m' });
        res.status(200).json({
            message: 'Token retrieved successfully.',
            data: {
                auth_code: newAuthCode
            }
        });
    } catch (error) {
        console.error('Error during token verification:', error.message);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
}

exports.loginWithAuthtoken = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ message: 'Auth code is required. Please provide a valid auth_code.' });
    }
    const auth_code = authHeader.split(' ')[1];
    if (!auth_code) {
        return res.status(400).json({ message: 'Auth code is missing. Please provide a valid auth_code.' });
    }
    try {
        const decoded = jwt.verify(auth_code, config.JWT_SECRET);
        const user = await userService.getUser({ user_id: decoded.user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please provide a valid auth_code.' });
        }
        const newAuthCode = jwt.sign({
            user_id: user.user_id,
            user_name: user.user_name,
            role_name: user.role_name
        }, config.JWT_SECRET, { expiresIn: '5m' });

        res.status(200).json({
            message: 'Login successfully.',
            data: {
                auth_code: newAuthCode,
                user: {
                    user_name: user.user_name,
                    role_name: user.role_name
                }
            }
        });
    } catch (error) {
        console.error('Error during token verification:', error.message);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};