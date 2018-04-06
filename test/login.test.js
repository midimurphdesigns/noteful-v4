'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const seedUsers = require('../db/seed/users.json');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Login', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.insertMany(seedUsers);
    // const testUser = seedUsers[0];
    // return User.hashPassword(testUser.password)
    //   .then(digest =>
    //     User.create({
    //       _id: testUser._id,
    //       username: testUser.username,
    //       password: digest,
    //     }));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('Noteful /api/login', function () {
    describe('POST', function () {

      it('should return a valid auth token', function () {
        const { _id: id, username, fullname } = seedUsers[0];

        return chai.request(app)
          .post('/api/login')
          .send({ username, password: 'password' })
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.authToken).to.be.a('string');

            const payload = jwt.verify(res.body.authToken, JWT_SECRET);

            expect(payload.user).to.not.have.property('password');
            expect(payload.user).to.deep.equal({ id, username, fullname });
          });
      });

      it('Should reject requests with no credentials', function () {
        return chai.request(app)
          .post('/api/login')
          .send({ username: '', password: '' })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal('Bad Request');
          });
      });

      it('Should reject requests with incorrect usernames', function () {
        return chai.request(app)
          .post('/api/login')
          .send({ username: 'wrongUsername', password: '' })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal('Bad Request');
          });
      });

      it('Should reject requests with incorrect passwords', function () {
        return chai.request(app)
          .post('/api/login')
          .send({ username: '', password: 'wrongPassword' })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal('Bad Request');
          });
      });

    });
  });


});