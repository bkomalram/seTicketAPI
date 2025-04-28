var express = require('express');
var router = express.Router();
var env = require("dotenv").config();
const crypto = require('crypto');

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

  function decrypt(text, key) {
    try {
        const [ivHex, encryptedHex, authTagHex] = text.split('-');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Invalid encryption format or corrupted data');
    }
  }

  const key = env.parsed.CRYPTO_SALT.slice(0, 32); // Must be 32 bytes for AES-256
  const decrypted = decrypt(id, key);

  res.render('qr', { title: 'Cambiar' , enviroment: env.parsed, ID: decrypted});

  return

});

router.get('/estadoBillete', function(req, res, next) {  
  res.render('estadoBillete', { title: 'Estado de Billetes', enviroment: env.parsed });
});

router.get('/admin-area', function(req, res, next) {  
  res.render('admin-area', { title: 'Gestión de Usuarios', enviroment: env.parsed });
});

module.exports = router;
