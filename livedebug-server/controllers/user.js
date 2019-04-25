const User = require('../models/user');
const regis = require('../helpers/register');
const jwt = require('../helpers/token');

class UserController {
  static register(req, res) {
    // console.log(req.body, '====')
    let user = {
      email: req.body.email,
      password: req.body.password,
      verificationCode: req.body.verificationCode,
      isVerified: req.body.isVerified
    };

    User.create(user)
    
    .then(newuser => {
      // console.log(user, '***')
      res.status(201).json(newuser);
    })
    .catch(err => {
      // console.log(err)
      if (err.errors.email) {
        res.status(409).json({ err: err.errors.email.reason });
      } else if(err.errors.password) {
        res.status(409).json({ err: err.errors.password.message });
      } else {
        res.status(500).json(err);
      }
    })
  }

  static login(req, res) {
    console.log(req.body)
    User
      .findOne({
        email: req.body.email
      })
     .then(user => {
       console.log(user,'***')
       if (user) {
         if (regis.checkPassword(req.body.password, user.password)) {
           let signUser = {
              id: user._id,
              email: user.email
           };

           let token = jwt.sign(signUser);
           res.status(200).json({
             token: token,
             _id: user._id,
             email: user.email
           })
         }
       } else {
         res.status(500).json({ err: "User not found" });
       }
     })
     .catch(err => {
       res.status(500).json(err);
     })
  }

  static verify(req, res) {
    // console.log(req.body,'*****')
    User
     .findOneAndUpdate({
       email: req.body.email,
       verificationCode: req.body.verificationCode
     }, {
       $set: { isVerified: true }
     })
     .then(user => {
       console.log(user)
       if(user) {
        //  console.log(user,'--------')
         res.status(200).json(user);
       } else {
         res.status(400).json({ err: 'Verification code not match'})
       }
     })
     .catch(err => {
       console.log(err,'mana ini errornya')
       res.status(500).json(err);
     })
  }
}

module.exports = UserController
