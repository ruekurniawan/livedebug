const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const register = require('../helpers/register');


const userSchema = new Schema({
  email: {
    type: String,
    required: [ true, 'Email is required' ],
    validate: [{
      validator: function(value) {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          throw 'Invalid email format'
        }
      },
    },
    {
      validator: function(value) {
        return User.find({
              _id: { $ne: this._id },
              email: value
           })
          .then( data => {
              if(data.length !== 0) {
                  throw 'Email has been used';
              }
          })
          .catch(err => {
              throw err;
          });
      }
    }]
  },
  password: {
    type: String,
    required: [ true, 'Password is required' ]
  },
  verificationCode: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
})

userSchema.pre('save', function(next) {
  this.password = register.hashPassword(this.password);
  // register.generateNum
  this.verificationCode = register.generateNum(6);
  next()
})

let User = mongoose.model('User', userSchema);

module.exports = User
