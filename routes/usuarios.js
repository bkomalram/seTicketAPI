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
    .then((userData)=>{
        if(!userData){
            res.json({
                resultado: "Acceso denegado",
                exitoso:false
            }) 
        } else {
            userData.validPassword(password).then(isCorrect=>{
                if (!isCorrect) {
                    res.json({
                        resultado: "Acceso denegado",
                        exitoso:false
                    })
                } else {                    
                    let objeto = {
                        accesos: userData.dataValues.perfil=="ADMIN"? 2 : 1,                
                        perfil:userData.dataValues.perfil,
                        usuario:userData.dataValues.nombre,
                        id:userData.dataValues.id
                    }
                    res.json({
                        resultado:{ token: jwt.sign(objeto,process.env.SALT,{ expiresIn: '1h' }) },
                        exitoso:true
                    })
                }
            })            
        }                        
    })   
    .catch(error =>{
        console.log(error)
    })     
})



module.exports = router;