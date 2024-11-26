require('dotenv').config()
var express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const DB = require ("../models/index")

router.get("/", (req,res)=>{
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    DB.User.findAll({
        where:{                
            esActivo:"SI",
            [DB.Sequelize.Op.or]:[
                {padreUsuario_id: req.jornada.id},
                {id:req.jornada.id}
            ]           
        },                    
        order:[
            ["id", 'ASC'],
        ]
    })
    .then((data)=>{            
        res.status(200).json({resultado:data,exitoso:true})       
    })
})

router.get("/token", (req,res)=>{
    const initialToken = {
        perfil:"Invitado",
        accesos:0
    }
    const generado = jwt.sign(initialToken,process.env.SALT,{ expiresIn: '1h' })
    res.status(200).json({
        token:generado
    })
})

router.get("/decode", (req,res)=>{
    try {
        var decodificado = jwt.verify(req.token,process.env.SALT)
        res.status(200).json(
            {
                resultado: decodificado,
                exitoso:true
            })
    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        })
    }
    
})

router.post("/log", (req,res)=>{
    const { usuario, password } = req.body
    
    DB.User.findOne({where:{nombre:usuario,esActivo:'SI'}})
    .then((User)=>{
        if(!User){
            res.status(401).json({
                resultado: "Acceso denegado",
                exitoso:false
            }) 
        } else {
            User.validPassword(password).then(isCorrect=>{
                if (!isCorrect) {
                    res.status(401).json({
                        resultado: "Acceso denegado",
                        exitoso:false
                    })
                } else {                    
                    let objeto = {
                        accesos: User.dataValues.perfil=="ADMIN"? 2 : 1,                
                        perfil:User.dataValues.perfil,
                        usuario:User.dataValues.nombre,
                        padreUsuario_id: User.dataValues.padreUsuario_id,
                        porcentajeChance: User.dataValues.porcentajeComision,
                        porcentajeBillete: User.dataValues.porcentajeComisionBillete,
                        id:User.dataValues.id
                    }
                    User.ultimaConexion = Date.now()
                    User.save()
                    .then((Commit)=>{
                        res.status(200).json({
                            resultado:{ token: jwt.sign(objeto,process.env.SALT,{ expiresIn: '24h' }) },
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
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { password, newPassword } = req.body
    if (!password || !newPassword) {
        res.status(400).json({
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
                    res.status(401).json({
                        resultado: "Credenciales erradas",
                        request: req.body,
                        exitoso:false
                    })
                    return
                }
                /*Porceder con el cambio*/
                User.changePassword(newPassword)                
                .then((Commit)=>{
                    res.status(201).json({
                        resultado: Commit,
                        exitoso:true
                    })
                    return
                })
            })                        
        })        
    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        })
    }    
})

/**
 * Cambiar Porcentaje
 */
router.post("/changePercentage",(req,res)=>{
    /*Evalulando Accesos*/
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { porcentajeComision, userId } = req.body
    if (!porcentajeComision || !userId) {
        res.status(400).json({
            resultado: "Se requieren informacion del userId y porcentaje, para proceder.",
            exitoso: false
        })
        return
    }    
    /*Evaluando información*/
    try {
        DB.User.findOne({where:{id:userId,esActivo:'SI'}})
        .then((User)=>{
            console.log(User)
            /*Porceder con el cambio*/
            User.changePercentage(porcentajeComision)                
            .then((Commit)=>{
                res.status(201).json({
                    resultado: Commit,
                    exitoso:true
                })
                return
            })                        
        })        
    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        })
    }    
    })

/**
 * Crear Usuario
 */
 router.post("/", (req,res)=>{
    const { usuario, password, porcentajeComision, perfil } = req.body   
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    try {
        DB.User.create({
            padreUsuario_id: req.jornada.id,
            nombre: usuario,
            porcentajeComision:porcentajeComision,
            contrasena:password,
            perfil:perfil,
            ultimaConexion:null,
            esActivo:'SI'
        })
        .then((nuevoUsuario)=>{
            nuevoUsuario.save()
            res.status(200).json({
            resultado:nuevoUsuario,
            exitoso:true
        })
        })
        .catch(error =>{
            console.log(error)
        })  
    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        }) 
    }
           
})
module.exports = router;