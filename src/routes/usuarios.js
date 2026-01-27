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
            ["nombre", 'ASC'],
        ]
    })
    .then(async (data)=>{          
        for (let user of data) {
            user.hijos = await user.getChild();
        }
        res.status(200).json({resultado:data,exitoso:true})       
    })
})

router.get("/:userId/hijos", async (req,res)=>{
    try {
        /*Evalulando Accesos*/
        if (req.jornada.accesos < 1) {
            return res.status(401).json({
                resultado: "Privilegios insuficientes",
                exitoso:false
            })
        }
        
        /*Obtener usuario*/
        const usuario = await DB.User.findOne({
            where:{
                id: req.params.userId,
                esActivo:'SI'
            }
        })

        if (!usuario) {
            return res.status(404).json({
                resultado: "Usuario no encontrado",
                exitoso:false
            })
        }

        /*Obtener hijos*/
        const hijos = await usuario.getHijos({
            where:{ esActivo:'SI' },
            order:[["nombre", 'ASC']]
        })

        res.status(200).json({
            resultado: hijos,
            lista:hijos.getChild(),
            exitoso:true
        })

    } catch (error) {
        console.error('Error al obtener hijos:', error);
        res.status(500).json({
            resultado: error.message,
            lista:'',
            exitoso:false
        })
    }
})

router.get("/token", (req,res)=>{
    const initialToken = {
        perfil:"Invitado",
        accesos:0
    }
    const generado = jwt.sign(initialToken,process.env.SALT,{ expiresIn: '2h' })
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

router.get("/renew", async (req, res) => {
  try {
    // Obtener datos del usuario actual
    const user = await DB.User.findOne({
      where: { 
        id: req.jornada.id,
        esActivo: 'SI'
      }
    });

    if (!user) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Usuario no encontrado"
      });
    }

    // Crear objeto con datos del usuario
    const objeto = {
      accesos: req.jornada.accesos,
      perfil: user.perfil,
      usuario: user.nombre,
      padreUsuario_id: user.padreUsuario_id,
      porcentajeChance: user.porcentajeComision,
      porcentajeBillete: user.porcentajeComisionBillete,
      id: user.id,
      hijos: await user.getChild()
    };

    // Generar nuevo token
    const token = jwt.sign(objeto, process.env.SALT, { expiresIn: '24h' });

    // Actualizar última conexión
    user.ultimaConexion = Date.now();
    await user.save();

    res.status(200).json({
      exitoso: true,
      token: token
    });

  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al renovar el token"
    });
  }
})

router.post("/log", (req,res)=>{
    const { usuario, password } = req.body
    
    DB.User.findOne({where:{nombre:usuario,esActivo:'SI'}})
    .then((User)=>{
        var acceso
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
                    //Perfil
                    if (User.dataValues.perfil=="ADMIN") {
                       acceso = 3 
                    } else if(User.dataValues.perfil=="SUPERVISOR") {
                        acceso = 2
                    } else {
                        acceso = 1
                    }
                    //Obtener hijos
                    
                    let objeto = {
                        accesos: acceso,                
                        perfil:User.dataValues.perfil,
                        usuario:User.dataValues.nombre,
                        padreUsuario_id: User.dataValues.padreUsuario_id,
                        porcentajeChance: User.dataValues.porcentajeComision,
                        porcentajeBillete: User.dataValues.porcentajeComisionBillete,
                        id:User.dataValues.id
                    }
                    User.ultimaConexion = Date.now()
                    User.getChild()
                    .then(stringChild => {
                        // asignacion de hijos
                        objeto.hijos = stringChild
                        User.save()
                        .then((Commit)=>{
                            res.status(200).json({
                                resultado:{ token: jwt.sign(objeto,process.env.SALT,{ expiresIn: '24h' }) },
                                exitoso:true
                            })
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

router.post("/admin-changePassword",(req,res)=>{
    /*Evalulando Accesos*/
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { password, userId} = req.body
    if (!password || !userId) {
        res.status(400).json({
            resultado: "Se requieren las credenciales actuales y nuevas, para proceder.",
            exitoso: false
        })
        return
    }    
    /*Evaluando información*/
    try {
        DB.User.findOne({where:{id:userId,esActivo:'SI'}})
        .then((User)=>{
            /*Porceder con el cambio*/
            User.changePassword(password)                
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
    const { porcentajeComision, porcentajeComisionBillete, userId } = req.body
    if (!porcentajeComision || !porcentajeComisionBillete || !userId) {
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
            User.changePercentage(porcentajeComision,porcentajeComisionBillete)                
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


router.post("/changeName",(req,res)=>{
    /*Evalulando Accesos*/
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { name, userId } = req.body
    if (!name || !userId) {
        res.status(400).json({
            resultado: "Se requieren informacion del userId y nombre, para proceder.",
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
            User.changeName(name)                
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
    const { usuario, password, porcentajeComision,porcentajeComisionBillete, perfil } = req.body   
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
            porcentajeComisionBillete:porcentajeComisionBillete,
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