const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const app = require('../app');
const User = require('../models/user');
const Account = require('../models/account');

const jwt = require('../helpers/token');

chai.use(chaiHttp);

let awtianToken = '';
let wikaToken = '';

let awtianAccount = '';
let wikaAccount = '';

let checkForHistory = '';

describe('Transactions', function() {
  beforeEach(done => {
    let newUser = {
      email: 'awtian@mail.com',
      password: 'awaw',
    }

    User.create(newUser)
     .then(user => {
       let signUser = {
          id: user._id,
          email: user.email
       };

       awtianToken = jwt.sign(signUser);

       let newAcc = { userId: user._id };

       return Account.create(newAcc)

     })
     .then(acc => {
        awtianAccount = acc.accountNumber
        done()
     })
     .catch(err => {
       throw err
     })
  })

  beforeEach(done => {
    let wika = {
      email: 'wika@mail.com',
      password: 'wikanyaa',
    }

    User.create(wika)
     .then(user => {
       let signUser = {
          id: user._id,
          email: user.email
       };

       wikaToken = jwt.sign(signUser);

       let newAcc = { userId: user._id };

       return Account.create(newAcc)

     })
     .then(acc => {
        wikaAccount = acc.accountNumber
        done()
     })
     .catch(err => {
       throw err
     })
  })

  afterEach(done => {
    Promise.all([Account.deleteMany({}), User.deleteMany({})]).then(() => done())
  })

  describe('POST /transactions', function() {

    it('should return status code 201 and create transactions', function(done) {
      chai
       .request(app)
       .post('/transactions')
       .set('token', awtianToken)
       .send({
         amount: 50000,
         accountNumber: awtianAccount,
         accountNumberTo: wikaAccount
       })
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(201);
         expect(res).to.be.an('object');
         expect(res.body).to.have.property('amount');
         expect(res.body).to.have.property('from');
         expect(res.body).to.have.property('to');

         expect(res.body.from).to.have.property('balance');
         expect(res.body.from).to.have.property('userId');
         expect(res.body.from.userId).to.be.an('object');
         expect(res.body.from.balance).to.be.equal(450000);

         done();
       })
    }),


    it('should return status code 400 and error message Insufficient balance', function(done) {

      chai
       .request(app)
       .post('/transactions')
       .set('token', wikaToken)
       .send({
         amount: 5000000,
         accountNumber: wikaAccount,
         accountNumberTo: awtianAccount
       })
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(400);
         expect(res).to.be.an('object');
         expect(res.body).to.have.property('err');
         expect(res.body.err).to.be.equal('Insufficient balance');

         done();
       })
    })
  })
})
