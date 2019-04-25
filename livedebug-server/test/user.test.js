const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');

chai.use(chaiHttp);

after(done => {
  User
   .deleteMany({}, () => {
     done();
   })
})

let verificationCode = '';

describe('Users', function() {
  describe('POST /register', function() {

    it('should return status code 201 with response body created user', function(done) {
      let user = {
        email: 'kosasih@mail.com',
        password: 'kosasihberjalankiankemari',
      }
      
      chai
       .request(app)
       .post(`/register`)
       .send(user)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(201);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('_id');
         expect(res.body).to.have.property('email');
         expect(res.body).to.have.property('password');
         expect(res.body).to.have.property('isVerified')
         expect(res.body).to.have.property('verificationCode');

         expect(res.body.email).to.be.equal('kosasih@mail.com');
         expect(res.body.email).to.not.be.equal('kosasihberjalankiankemari');
         expect(res.body.isVerified).to.equal(false);
         expect(res.body.verificationCode.length).to.equal(6);

         verificationCode = res.body.verificationCode;

         done();
       })
    })

    it('should return status code 409 with message "Email has been used"', function(done) {
      let user = {
        email: 'kosasih@mail.com',
        password: 'kosasihberjalankiankemari',
      }

      chai
       .request(app)
       .post(`/register`)
       .send(user)
       .end(function(err, res) {
         expect(err).to.be.null;
         expect(res).to.have.status(409);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('err');
         expect(res.body.err).to.be.equal('Email has been used');
         done();
       })
    })

    it('should return status code 409 with message "Password is required"', function(done) {
      let user = {
        email: 'johndoe@mail.com',
        password: null,
      }

      chai
       .request(app)
       .post(`/register`)
       .send(user)
       .end(function(err, res) {
         expect(err).to.be.null;
         expect(res).to.have.status(409);
         expect(res.body).to.be.an('object');
         expect(res.body).to.have.property('err');
         expect(res.body.err).to.be.equal('Password is required');
         done();
       })
    })
  })

  describe('GET /login', function() {
    it('should return status code 200 with logged in user: token, _id and email', function(done) {
      let user = {
        email: 'kosasih@mail.com',
        password: 'kosasihberjalankiankemari',
      }

      chai
       .request(app)
       .get('/login')
       .send(user)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(200);
         expect(res.body).to.have.property('token');
         expect(res.body).to.have.property('_id');
         expect(res.body).to.have.property('email');

         expect(res.body.password).to.not.be.equal('kosasihberjalankiankemari');
         done();
       })
    })
  })

  describe('POST /verify', function() {
    it('should return status code 200 and update isVerified to true if verificationCode match', function(done) {
      let userVerify = {
        email: 'kosasih@mail.com',
        verificationCode: verificationCode
      }

      chai
       .request(app)
       .post('/verify')
       .send(userVerify)
       .end(function(err, res) {
         expect(err).to.be.null;

         expect(res).to.have.status(200);
         expect(res.body).to.have.property('isVerified');
         expect(res.body.isVerified).to.be.equal(true);

         done();
       })
    })
  })
})
