'use strict';

// Note: the following example uses failWithError: true which is unique to the Noteful app. 
// The failWithError option configures the middleware to throw an error instead of automatically returning a 401 response.
// The error is then caught by the error handling middleware on server.js and returned as JSON.

const express = require('express');
const passport = require('passport');
const router = express.Router();

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/login', localAuth, function (req, res) {
  return res.json(req.user);
});

module.exports = router;