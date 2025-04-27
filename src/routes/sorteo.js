const express = require("express")
const router = express.Router()

const DB = require ("../models/index")
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');

/*Sorteo*/
router.post("/", (req,res)=>{
    const { nombreSorteo } = req.body
    if (req.jornada.accesos < 2) {
        res.status(401).json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /*Verificando que tenga todo*/
    const { password, newPassword } = req.body
    if (!nombreSorteo) {
        res.status(400).json({
            resultado: "Se requiere el nombre del sorteo, para proceder.",
            exitoso: false
        })
        return
    } 
    try {
        DB.Game.create({
            usuario_id: req.jornada.id,
            nombre: nombreSorteo,
            fecha: Date.now(),
            esActivo: "SI",
            enVenta: "SI"
        })
        .then((Game)=>{
            Game.save() 
            res.status(201).json({resultado:{mensaje:"Sorteo creado"},exitoso:true})                     
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error creando sorteo",error:error},exitoso:false})
    }            
})

router.patch("/", (req,res)=>{
    const { sorteoId } = req.body
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    /*Refactor v3.0
    Sequelize ORM
    BK*/
    try {
        DB.Game.update({            
            esActivo: "NO"
        },{ 
            where: { id: sorteoId }
        })
        .then((Game)=>{
            res.status(201).json({resultado:{mensaje:"Sorteo cerrado"},exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error cerrando sorteo",error:error},exitoso:false})
    }    
})

router.lock("/", (req,res)=>{
    const { sorteoId } = req.body
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    /*Refactor v3.0
    Sequelize ORM
    BK*/
    try {
        DB.Game.update({            
            enVenta: "NO"
        },{ 
            where: { id: sorteoId }
        })
        .then((Game)=>{
            res.status(201).json({resultado:{mensaje:"Venta detenida."},exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error deteniendo venta en sorteo",error:error},exitoso:false})
    }    
})

router.unlock("/", (req,res)=>{
    const { sorteoId } = req.body
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    /*Refactor v3.0
    Sequelize ORM
    BK*/
    try {
        DB.Game.update({            
            enVenta: "SI"
        },{ 
            where: { id: sorteoId }
        })
        .then((Game)=>{
            res.status(201).json({resultado:{mensaje:"Venta reactiva."},exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error reactivando la venta en sorteo",error:error},exitoso:false})
    }    
})

router.get("/", (req,res)=>{        
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }       

    /*Refactor v3.0
    Sequelize ORM
    BK
    url/sorteo POST Crear
    url/sorteo PATCH Cierra
    url/sorteo GET Obtiene todos
    url/sorteo/:id GET Obtiene especifico
    url/sorteo/:id/chances GET Obtiene Chances de sorteo especifico para usuario en sesion
    */
    try {
        DB.Game.findAll({
            where:{         
                usuario_id: [req.jornada.padreUsuario_id, req.jornada.id],
                esActivo: "SI"
            },
            order:[
                [DB.sequelize.literal('id'), 'DESC'],
            ]
        })
        .then((Game)=>{
            if (!Game[0]) {
                // Busca el sorteo del lider de su padre
                DB.User.findOne({where:{id:req.jornada.padreUsuario_id,esActivo:'SI'}})
                .then((data)=>{            
                    
                    //Buscar nuevamente si hay sorteo.
                    DB.Game.findAll({
                        where:{         
                            usuario_id: [data.padreUsuario_id],
                            esActivo: "SI"
                        },
                        order:[
                            [DB.sequelize.literal('id'), 'DESC'],
                        ]
                    })
                    .then((Game)=>{ res.status(200).json({resultado:Game,exitoso:true}) })   
                })
            } else {
                res.status(200).json({resultado:Game,exitoso:true})
            }     
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error buscando todos los sorteos",error:error},exitoso:false})
    }    
})

router.get("/ultimo-cerrado", (req,res)=>{        
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }       

    /*Refactor v3.0
    Sequelize ORM
    BK
    url/sorteo POST Crear
    url/sorteo PATCH Cierra
    url/sorteo GET Obtiene todos
    url/sorteo/:id GET Obtiene especifico
    url/sorteo/:id/chances GET Obtiene Chances de sorteo especifico para usuario en sesion
    */
    try {
        DB.Game.findAll({
            where:{         
                usuario_id: [req.jornada.padreUsuario_id, req.jornada.id],
                esActivo: "NO"
            },
            order:[
                [DB.sequelize.literal('id'), 'DESC'],
            ]
        })
        .then((Game)=>{
            if (!Game[0]) {
                // Busca el sorteo del lider de su padre
                DB.User.findOne({where:{id:req.jornada.padreUsuario_id,esActivo:'SI'}})
                .then((data)=>{            
                    
                    //Buscar nuevamente si hay sorteo.
                    DB.Game.findAll({
                        where:{         
                            usuario_id: [data.padreUsuario_id],
                            esActivo: "NO"
                        },
                        order:[
                            [DB.sequelize.literal('id'), 'DESC'],
                        ]
                    })
                    .then((Game)=>{ res.status(200).json({resultado:Game[0],exitoso:true}) })   
                })
            } else {
                res.status(200).json({resultado:Game[0],exitoso:true})
            }     
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error buscando todos los sorteos",error:error},exitoso:false})
    }    
})

router.get("/ultimo-sorteo", async (req, res) => {
    const usuarioId = 2; // Usuario fijo según lo que pediste

    try {
        const ultimoSorteo = await DB.Game.findOne({
            where: {
                usuario_id: usuarioId,
                esActivo: "SI"
            },
            order: [
                [DB.sequelize.literal('id'), 'DESC']
            ]
        });

        if (!ultimoSorteo) {
            return res.status(404).json({
                resultado: "No se encontró ningún sorteo activo para el usuario.",
                exitoso: false
            });
        }

        res.status(200).json({
            resultado: ultimoSorteo,
            exitoso: true
        });
    } catch (error) {
        res.status(500).json({
            resultado: {
                mensaje: "Ocurrió un error al buscar el último sorteo",
                error: error
            },
            exitoso: false
        });
    }
});



router.get("/:sorteoId", (req,res)=>{     
    
    const { sorteoId } = req.params

    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }       

    /*Refactor v3.0
    Sequelize ORM
    BK
    url/sorteo POST Crear
    url/sorteo PATCH Cierra
    url/sorteo GET Obtiene todos
    url/sorteo/:id GET Obtiene especifico
    url/sorteo/:id/chances GET Obtiene Chances de sorteo especifico para usuario en sesion
    */
    try {
        DB.Game.findOne({
            where: DB.sequelize.literal('id = '+ sorteoId +' and esActivo = "SI" and enVenta = "SI"' )                    
        })       
        .then((Game)=>{           
            res.status(200).json({resultado:Game,exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error buscando todos los sorteos",error:error},exitoso:false})
    }  
})

/*
    Refactor v3.0
    Sequelize - ORM
    BK*/
/*Chances*/
/*No es necesario hacer esto, se puede hacer cuando se crea el tickete y lo controlamos desde el Back 
@@ Se creo la función updateChanceQuantity linea 8 para Reemplazar esto.
router.post("/cantidad/chance", (req,res)=>{
    const { sorteoId, usuarioId, chance, cantidad } = req.body
    const accion = "CALL rActualizaCantidadChance(?,?,?,?);"   
    
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }    
        
    con.query(accion,[sorteoId,usuarioId,chance,cantidad],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows[1][0]})
        } else {
            console.log(err)
        }
    })
})
*/

    /*
    Refactor v3.0
    Sequelize - ORM
    BK
    Reemplazar
No es necesario calcular los totales de una lista de valores, podemos hacerlo desde API ahora.
Se reemplazará
router.get("/chances/total/:sorteoId/:usuarioId", (req,res)=>{
    const {sorteoId, usuarioId} = req.params
    const accion = `
    SELECT SUM(CABEZA.CANTIDAD) CANTIDAD, SUM(CABEZA.VALOR) PLATA  FROM tSorteoTiquetesRegistros CABEZA
    LEFT JOIN tSorteoTiquetes OJOS ON OJOS.ID = CABEZA.TIQUETE_ID
    LEFT JOIN tSorteos VOCA ON VOCA.ID = OJOS.SORTEO_ID
    WHERE VOCA.ID = ?
    AND OJOS.VENDEDOR_ID = ?
    AND LENGTH(CABEZA.NUMERO) < 3
    `    
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    con.query(accion,[sorteoId, usuarioId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows[0]})
        } else {
            console.log(err)
        }
    })
})
*/

    /*
    Refactor v3.0
    Sequelize - ORM
    BK*/
router.get("/:sorteoId/chances", (req,res)=>{    
    const {sorteoId} = req.params
    const {ord,all,only} = req.query
    /*Optional ordenado = cantidad|chance| defecto chance*/    
    var ordenado = ["numero","cantidad"].indexOf(ord)==-1?"numero":ord    
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }      
    /*Optional traer todos los chances cuando eres Administrador*/
    if (req.jornada.accesos < 2) {
        var objectWhere = {         
            game_id: sorteoId,
            userId: req.jornada.id,
            esValido: 'SI'
        }
    } else if (all) {            
        var objectWhere = {         
            game_id: sorteoId,
            esValido: 'SI'
        }
    } else if (only) {            
        var objectWhere = {         
            game_id: sorteoId,
            userId: only.split(","),
            esValido: 'SI'
        }
    } else if (req.jornada.accesos == 2) {   
        //Supervisor
        let tempList = req.jornada.id+','+req.jornada.hijos        
        var objectWhere = {         
            game_id: sorteoId,
            userId: tempList.split(","),
            esValido: 'SI'
        }
    } else {
        var objectWhere = {         
            game_id: sorteoId,
            esValido: 'SI'
            //userId: req.jornada.id
        }
    }    
    
    try {
        DB.GameTicketRecord.findAll({
            where:{                
                tipo:"CHANCE"
            },
            include:[{
                model:DB.GameTicket,
                where:objectWhere,
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                attributes:[],
                include:[{
                    model:DB.User,                    
                    required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                    attributes:[]
                }]
            }                            
            ],
            attributes:[
                'numero',
                //[DB.sequelize.col('GameTicket->User.nombre'),'vendedor'],               
                [DB.sequelize.fn('sum', DB.sequelize.col('cantidad')), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador1er')), 'dineroPremio1er'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador2do')), 'dineroPremio2do'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador3ro')), 'dineroPremio3ro'],
            ],
            group:['numero']            
        })
        .then((LeftJoin)=>{
            res.status(200).json({resultado:LeftJoin,exitoso:true})       
        })
        /*DB.GameState.findAll({
            where:objectWhere,
            order:[
                [ordenado, 'DESC'],
            ]
        })
        .then((GameState)=>{
            res.status(200).json({resultado:GameState,exitoso:true})       
        })*/       
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error buscando el estado de cuenta",error:error},exitoso:false})
    } 
    
})

/*Billetes*/
/*
    Refactor v3.0
    Sequelize - ORM
    BK
    */
router.get("/:sorteoId/billetes", (req,res)=>{
    const {sorteoId} = req.params
    const {ord,all,only} = req.query
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    if (req.jornada.accesos < 2) {
        var objectWhere = {         
            game_id: sorteoId,
            userId: req.jornada.id,
            esValido: 'SI'
        }
    } else if (all) {            
        var objectWhere = {         
            game_id: sorteoId,
            esValido: 'SI'
        }
    } else if (only) {            
        var objectWhere = {         
            game_id: sorteoId,
            userId: only.split(","),
            esValido: 'SI'
        }
    } else if (req.jornada.accesos == 2) {   
        //Supervisor
        let tempList = req.jornada.id+','+req.jornada.hijos        
        var objectWhere = {         
            game_id: sorteoId,
            userId: tempList.split(","),
            esValido: 'SI'
        }
    } else {
        var objectWhere = {         
            game_id: sorteoId,
            esValido: 'SI'
            //userId: req.jornada.id
        }
    }

    try {              
        DB.GameTicketRecord.findAll({
            where:{                
                tipo:"BILLETE"
            },
            include:[{
                model:DB.GameTicket,
                where:objectWhere,
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                attributes:[],
                include:[{
                    model:DB.User,                    
                    required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                    attributes:[]
                }]
            }                                        
            ],
            attributes:[
                'numero',
                //[DB.sequelize.col('GameTicket->User.nombre'),'vendedor'], 
                [DB.sequelize.fn('sum', DB.sequelize.col('cantidad')), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador1er')), 'dineroPremio1er'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador2do')), 'dineroPremio2do'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador3ro')), 'dineroPremio3ro'],
            ],
            group:['numero'],
            order:[
                [DB.sequelize.literal('cantidad'), 'DESC'],
            ]

        })
        .then((LeftJoin)=>{
            res.status(200).json({resultado:LeftJoin,exitoso:true})       
        })

        
    } catch (error) {
        res.status(400).json({resultado:[],exitoso:false}) 
    }    
})


router.get("/:sorteoId/billetes-publico", (req,res)=>{
    const {sorteoId} = req.params
    const {ord,all,only} = req.query

    var objectWhere = {         
        game_id: sorteoId,
        esValido: 'SI'
    }

    try {              
        DB.GameTicketRecord.findAll({
            where:{                
                tipo:"BILLETE"
            },
            include:[{
                model:DB.GameTicket,
                where:objectWhere,
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                attributes:[],
                include:[{
                    model:DB.User,                    
                    required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                    attributes:[]
                }]
            }                                        
            ],
            attributes:[
                'numero',
                //[DB.sequelize.col('GameTicket->User.nombre'),'vendedor'], 
                [DB.sequelize.literal('SUM(cantidad) - 1'), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador1er')), 'dineroPremio1er'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador2do')), 'dineroPremio2do'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador3ro')), 'dineroPremio3ro'],
            ],
            group:['numero'],
            having: DB.sequelize.literal('SUM(cantidad) - 1 > 0'),
            order:[
                [DB.sequelize.literal('cantidad'), 'DESC'],
            ]

        })
        .then((LeftJoin)=>{
            res.status(200).json({resultado:LeftJoin,exitoso:true})       
        })

        
    } catch (error) {
        res.status(400).json({resultado:[],exitoso:false}) 
    }    
})

/*

/*
    Refactor v3.0
    Sequelize - ORM
    BK
    Reemplazar
No es necesario calcular los totales de una lista de valores, podemos hacerlo desde API ahora.
Se reemplazó por el endpoint anterior a este url/sorteo/:sorteoId/billetes
router.get("/billetes/total/:sorteoId/:usuarioId", (req,res)=>{
    const {sorteoId, usuarioId} = req.params
    const accion = `
    SELECT SUM(CABEZA.CANTIDAD) CANTIDAD, SUM(CABEZA.VALOR) PLATA  FROM tSorteoTiquetesRegistros CABEZA
    LEFT JOIN tSorteoTiquetes OJOS ON OJOS.ID = CABEZA.TIQUETE_ID
    LEFT JOIN tSorteos VOCA ON VOCA.ID = OJOS.SORTEO_ID
    WHERE VOCA.ID = ?
    AND OJOS.VENDEDOR_ID = ?
    AND LENGTH(CABEZA.NUMERO) > 3
    `
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[sorteoId, usuarioId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows[0]})
        } else {
            console.log(err)
        }
    })
})
*/

/*Tiquete*/
/*
    Refactor v3.0
    Sequelize - ORM
    BK
    @@Se mueven todos los endpoints relacionado con tiquete a su propio API
*/

/*Configuracion*/
/*
    Refactor v3.0
    Sequelize - ORM
    BK
    @@Se mueven todos los endpoints relacionado con configuracion a su propio API
*/

module.exports = router