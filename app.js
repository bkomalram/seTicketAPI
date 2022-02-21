require('dotenv').config()
const jwt = require('jsonwebtoken')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
var chanceRouter = require('./src/routes/chance');
var sorteoRouter = require('./src/routes/sorteo');
var ganadoresRouter = require('./src/routes/ganadores');
var tiqueteRouter = require('./src/routes/tiquete');
var usuariosRouter = require('./src/routes/usuarios');
var configuracionRouter = require('./src/routes/configuracion');

/*Utility*/
function verificaToken(req,res,next) {  
  if (['/usuarios/token','/ganadores/cambiar'].indexOf(req.originalUrl) >= 0){
    console.log("No requiere JWT")
    next()
  }    
  const bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ")
      const token = bearer[1]
      req.token = token
      req.jornada = jwt.verify(req.token,process.env.SALT)      
      next()
  } else {
      res.json({
          respuesta:"Acceso Denegado",
          exitoso: false
      })
  }
}

var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(verificaToken)



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chances', chanceRouter);
app.use('/sorteo', sorteoRouter);
app.use('/tiquete', tiqueteRouter);
app.use('/ganadores', ganadoresRouter);
app.use('/usuarios', usuariosRouter);
app.use('/configuracion', configuracionRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("Error_:"+err.message)
  if(err.message=="jwt expired")
  res.json({respuesta:"La sesión caduco. Ingresa nuevamente", exitoso:false})
  else
  res.json({respuesta:"Ocurrio un error", exitoso:false})
});

module.exports = app;
