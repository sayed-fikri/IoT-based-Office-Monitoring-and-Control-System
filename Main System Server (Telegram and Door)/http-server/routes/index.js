var express = require('express');
var router = express.Router();

// Emptied the record
var pi2web = null;
var web2pi = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/piup', function(req, res, next) {
  console.log(req.body);
  pi2web = req.query;
  res.setHeader('Content-Type','application/json');
  res.send(JSON.stringify({"status":"ok"}));
});

router.get('/pidn', function(req, res, next) {
  res.setHeader('Content-Type','application/json');
  if(web2pi==null){
    res.send(JSON.stringify({"status":"none"}));
    return;
  }
  res.send(JSON.stringify(web2pi));
});

router.get('/webup', function(req, res, next) {
  console.log(req.query);
  web2pi = req.query;
  res.setHeader('Content-Type','application/json');
  res.send(JSON.stringify({"status":"ok"}));
});

router.get('/webdn', function(req, res, next) {
  res.setHeader('Content-Type','application/json');
  if(pi2web==null){
    res.send(JSON.stringify({"status":"none"}));
    return;
  }

  res.send(JSON.stringify(wpi2web));
});


module.exports = router;