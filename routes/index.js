var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(req.oidc.isAuthenticated() ? 'Logged In' : 'Logged Out');
});

module.exports = router;
