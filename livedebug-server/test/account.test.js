const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const app = require('../app');
const User = require('../models/user');
const Account = require('../models/account');

const jwt = require('../helpers/token');

chai.use(chaiHttp);

let token = '';
let foreignToken = '';

let accountNumber_1 = '';
let accountNumber_2 = '';

before(done => {
  let newUser = {
    email: 'dimitri@mail.com',
    password: 'dmtrxw',
  }

  User.create(newUser)
   .then(user => {
     let signUser = {
        id: user._id,
        email: user.email
     };

     token = jwt.sign(signUser);
   })
   .catch(err => {
     throw err
   })


   let semmi = {
     email: 'semmi@mail.com',
     password: 'semsem',
   }

   User.create(semmi)
    .then(user => {
      let signUser = {
         id: user._id,
         email: user.email
      };

      foreignToken = jwt.sign(signUser);
      done()
    })
    .catch(err => {
      throw err
    })
})

after(done => {
  Account
   .deleteMany({}, () => { });

  User
   .deleteMany({}, () => { done() });
})

describe.only('Account', function() {
  describe('POST /accounts/new ', function() {
    it.only('should return status code 201 with response body created account', function(done) {
      let account = {
        balance: 350000
      }

      chai
       .request(app)
       .post('/accounts/new')
       .send(account)
       .set('token', token)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(201);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('balance');
         expect(res.body).to.have.property('userId');
         expect(res.body).to.have.property('accountNumber');

         expect(res.body.balance).to.be.equal(350000);
         expect(res.body.accountNumber.length).to.be.equal(10);

         accountNumber_1 = res.body.accountNumber;

         done();
       })
    })

    it('should return status code 201 with response body created account and balance 500000', function(done) {

      chai
       .request(app)
       .post('/accounts/new')
       .send()
       .set('token', token)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(201);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('balance');
         expect(res.body).to.have.property('userId');
         expect(res.body).to.have.property('accountNumber');

         expect(res.body.balance).to.be.equal(500000);
         expect(res.body.accountNumber.length).to.be.equal(10);

         accountNumber_2 = res.body.accountNumber;

         done();
       })
    })
  })

  describe('GET /accounts/:accountNumber', function() {
    it('should return status 200 and get all data reference', function(done) {
      chai
       .request(app)
       .get(`/accounts/${accountNumber_1}`)
       .set('token', token)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(200);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('userId');
         expect(res.body.userId).to.have.property('_id');
         expect(res.body.userId).to.have.property('email');
         expect(res.body.userId).to.have.property('password');

         done();
       })
    })
  })

  describe('DELETE /accounts/:accountNumber', function() {
    it('should return status 200 and accountNumber should be deleted', function(done) {
      chai
       .request(app)
       .delete(`/accounts/${accountNumber_1}`)
       .set('token', token)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(200);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('deletedCount');

         expect(res.body.deletedCount).to.be.equal(1);

         done();
       })
    })

    it('should return status 403 and response error Forbidden', function(done) {
      chai
       .request(app)
       .delete(`/accounts/${accountNumber_2}`)
       .set('token', foreignToken)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(403);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('err');

         expect(res.body.err).to.be.equal('Forbidden');

         done();
       })
    })
  })
})
