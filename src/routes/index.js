var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/cuentas', function(req, res, next) {
  res.render('cuentas', { title: 'cuentas' });
});

router.get('/ventas', function(req, res, next) {  
  res.render('index', { title: 'Venta' });
});

module.exports = router;
