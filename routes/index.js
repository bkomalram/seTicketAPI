var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/ganadores', function(req, res, next) {
  res.render('ganadores', { title: 'Ganadores' });
});

router.get('/cuentas', function(req, res, next) {
  res.render('cuentas', { title: 'cuentas' });
});

router.get('/ventas', function(req, res, next) {  
  res.render('index', { title: 'Venta' });
});

router.get('/tiquete/:ID', function(req, res, next) {  
  const {ID} = req.params
  res.render('qr', { ID: ID });
});

module.exports = router;
