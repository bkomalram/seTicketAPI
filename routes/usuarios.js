require('dotenv').config()
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const DB = require ("../models/index")
const con = require("../modules/database")

router.get("/token", (req,res)=>{
    const initialToken = {
        perfil:"Invitado",
        accesos:0
    }
    const generado = jwt.sign(initialToken,process.env.SALT,{ expiresIn: '1h' })
    res.json({
        token:generado
    })
})

router.get("/decode", (req,res)=>{
    try {
        var decodificado = jwt.verify(req.token,process.env.SALT)
        res.json(decodificado)
    } catch (error) {
        res.json(error)
    }
    
})

router.post("/log", (req,res)=>{
    const { usuario, password } = req.body
    
    DB.User.findOne({where:{nombre:usuario,esActivo:'SI'}})
    .then((User)=>{
        if(!User){
            res.json({
                resultado: "Acceso denegado",
                exitoso:false
            }) 
        } else {
            User.validPassword(password).then(isCorrect=>{
                if (!isCorrect) {
                    res.json({
                        resultado: "Acceso denegado",
                        exitoso:false
                    })
                } else {                    
                    let objeto = {
                        accesos: User.dataValues.perfil=="ADMIN"? 2 : 1,                
                        perfil:User.dataValues.perfil,
                        usuario:User.dataValues.nombre,
                        id:User.dataValues.id
                    }
                    User.ultimaConexion = Date.now()
                    User.save()
                    .then((Commit)=>{
                        res.json({
                            resultado:{ token: jwt.sign(objeto,process.env.SALT,{ expiresIn: '1h' }) },
                            exitoso:true
                        })
                    })                    
                }
            })            
        }                        
    })   
    .catch(error =>{
        console.log(error)
    })     
})

router.post("/changePassword",(req,res)=>{
    /*Evalulando Accesos*/
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { password, newPassword } = req.body
    if (!password || !newPassword) {
        res.json({
            resultado: "Se requieren las credenciales actuales y nuevas, para proceder.",
            exitoso: false
        })
        return
    }    
    /*Evaluando información*/
    try {
        DB.User.findOne({where:{nombre:req.jornada.usuario,esActivo:'SI'}})
        .then((User)=>{
            console.log(User)
            User.validPassword(password)
            .then((Result)=>{
                if(!Result){
                    res.json({
                        resultado: "Credenciales erradas",
                        request: req.body,
                        exitoso:false
                    })
                    return
                }
                /*Porceder con el cambio*/
                User.changePassword(newPassword)                
                .then((Commit)=>{
                    res.json({
                        resultado: Commit,
                        exitoso:true
                    })
                    return
                })
            })                        
        })        
    } catch (error) {
        res.json({
            resultado: error,
            exitoso:false
        })
    }    
})


module.exports = router;