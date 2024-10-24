var express = require('express');
var router = express.Router();
var env = require("dotenv").config();

/* GET home page. */
router.get('/', function(req, res, next) {  
  res.render('login', { title: 'Login', enviroment: env.parsed });
});

router.get('/generar', function(req, res, next) {
  res.render('ganadores', { title: 'Ganadores', enviroment: env.parsed });
});

router.get('/balance', function(req, res, next) {
  res.render('balance', { title: 'Balances', enviroment: env.parsed });
});

router.get('/cuentas', function(req, res, next) {
  res.render('cuentas', { title: 'Cuentas', enviroment: env.parsed });
});

router.get('/ventas', function(req, res, next) {  
  res.render('index', { title: 'Venta' , enviroment: env.parsed });
});

router.get('/cambiar', function(req, res, next) {  
  const {id} = req.query
  res.render('qr', { title: 'Cambiar' , enviroment: env.parsed, ID: id});
});

module.exports = router;
