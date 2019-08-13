const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util')

const config = require.main.require('./config');
const User = require.main.require('./api/models/user');

exports.users_signup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const securityPIN = req.body.securityPIN;
    console.log(req.body);


    //Checking email already registered
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    message: 'Email already exists'
                });
            }
        })
        .catch(err => { res.status(500).json({ message: "user not found", error: err }); });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "password hash error", error: err });
        } else {

            bcrypt.hash(securityPIN, 10, (err, hashedSecurityPIN) => {

                if (err) {
                    return res.status(500).json({ message: "pin hash error", error: err });
                } else {
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        name: name,
                        email: email,
                        password: hashedPassword,
                        securityPIN: hashedSecurityPIN,
                        registrationDate: new Date()
                    });

                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(200).json({
                                status: "success",
                                message: 'User created',
                                request: {
                                    type: 'POST',
                                    url: util.format("%s/users/login", config.baseUrl())
                                }
                            });
                        })
                        .catch(err => { res.status(500).json({ error: err }); });
                }

            });

        }
    });

}

exports.users_login = (req, res, next) => {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Auth failed user not found'
                });
            }

            //console.log(user);
            bcrypt.compare(password, user.password, (err, result) => {
                console.log(result);
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed password'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        _id: user._id
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24hr"
                        });

                    return res.status(200).json({
                        message: 'Auth sucessful',
                        user: user._id,
                        name: user.name,
                        token: token
                    });

                } else {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
            });
        })
        .catch(err => { res.status(500).json({ error: err }); });
}

exports.users_change_password = (req, res, next) => {
    console.log(req.body);
    
    id = req.body.id;
    password = req.body.password;
    newPassword = req.body.newPassword;

    User.findOne({ _id: id })
        .exec()
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'Auth failed password'
                        });
                    }
                    if (result) {

                        bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {

                            if (err) {
                                return res.status(500).json({ message: "pin hash error", error: err });
                            } else {
                                User.update({ _id: id }, { $set: {password: hashedNewPassword} })
                                    .exec()
                                    .then(result => {
                                        console.log(result);
                                        res.status(200).json({
                                            message: 'Password Changed successfully'
                                        });
                                    })
                                    .catch(err => { res.status(500).json({ message: "password update error", error: err }); });
                            }
                        });

                    } else {
                        return res.status(401).json({
                            message: 'Auth failed'
                        });
                    }
                });
            }

        })
        .catch(err => { res.status(500).json({ message: "user not found", error: err }); });
}

exports.users_logout = (req, res, next) => {
    const token = req.body.token;

}

exports.users_get_user = (req, res, next) => {
    const userId = req.params.userId;

    User.findOne({ _id: userId })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Auth failed' });
            } else {
                return res.status(200).json({ user: user });
            }
        })
        .catch(err => { res.status(500).json({ message: "User not found", error: err }) });
}