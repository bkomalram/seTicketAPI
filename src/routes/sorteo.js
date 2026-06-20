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
                    .then((Game)=>{ 
                        //Armare un array con los 4 primeros
                        //Game = Game.slice(0,4)
                        res.status(200).json({resultado:Game.slice(0,4),exitoso:true}) 
                    })   
                })
            } else {
                res.status(200).json({resultado:Game.slice(0,4),exitoso:true})
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
            group:['numero'],
            having: DB.sequelize.literal('SUM(cantidad) > 0')           
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
            having: DB.sequelize.literal('SUM(cantidad) > 0'),
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


router.get("/:sorteoId/billetes-publico", async (req,res)=>{
    const {sorteoId} = req.params
    const {ord,all,only} = req.query

    var objectWhere = {         
        game_id: sorteoId,
        esValido: 'SI'
    }


    var objValoresPremios = {
        primer: {
            "ULTIMO_NUMERO": 0,
            "DOS_ULTIMOS": 3,
            "DOS_PRIMEROS": 3,
            "DOS_PRIMEROS_ULTIMO_NUMERO": 0,
            "TRES_ULTIMOS": 50,
            "TRES_PRIMEROS": 50,
            "CUATRO_NUMEROS": 2500,
            "CHANCE_GANADOR": 14
          },
        segundo: {
            "DOS_ULTIMOS": 2,
            "TRES_ULTIMOS": 20,
            "TRES_PRIMEROS": 20,
            "CUATRO_NUMEROS": 700,
            "CHANCE_GANADOR": 3
          },
        tercero: {
            "DOS_ULTIMOS": 1,
            "TRES_ULTIMOS": 10,
            "TRES_PRIMEROS": 10,
            "CUATRO_NUMEROS": 300,
            "CHANCE_GANADOR": 2
          }
    }
    

    try {    
        
        // Primero obtenemos el valor de sacado-chance de la configuración
        const config = await DB.Config.findOne({
            where: {
                propiedad: 'sacado-billetes'
            }
        });

        const sacadoBilletes = config ? parseFloat(config.valor) : 0;

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
                'primer_premio',
                'segundo_premio',
                'tercer_premio',
                //[DB.sequelize.col('GameTicket->User.nombre'),'vendedor'], 
                [DB.sequelize.literal('SUM(cantidad) - '+ sacadoBilletes), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador1er')), 'dineroPremio1er'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador2do')), 'dineroPremio2do'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador3ro')), 'dineroPremio3ro'],
            ],
            group:['numero','primer_premio','segundo_premio','tercer_premio'],
            having: DB.sequelize.literal('SUM(cantidad) - '+sacadoBilletes+' > 0'),
            order:[
                [DB.sequelize.literal('cantidad'), 'DESC'],
            ]

        })
        .then((LeftJoin)=>{
            //res.status(200).json({resultado:LeftJoin,exitoso:true}) 
            
            // Procesar los resultados
            const processedResults = LeftJoin.map(record => {
                const item = record.toJSON();
                
                // Restar una instancia del valor del premio correspondiente
                if (item.primer_premio && objValoresPremios.primer[item.primer_premio]) {
                    item.dineroPremio1er -= objValoresPremios.primer[item.primer_premio];
                }
                if (item.segundo_premio && objValoresPremios.segundo[item.segundo_premio]) {
                    item.dineroPremio2do -= objValoresPremios.segundo[item.segundo_premio];
                }
                if (item.tercer_premio && objValoresPremios.tercero[item.tercer_premio]) {
                    item.dineroPremio3ro -= objValoresPremios.tercero[item.tercer_premio];
                }

                // Calcular el total de premios
                item.totalPremios = (
                    (item.dineroPremio1er || 0) + 
                    (item.dineroPremio2do || 0) + 
                    (item.dineroPremio3ro || 0)
                );

                return item;
            });

            // Calcular el total general de premios
            const totalGeneralPremios = processedResults.reduce((sum, item) => sum + item.totalPremios, 0);

            res.status(200).json({
                resultado: processedResults,
                totalGeneralPremios,
                exitoso: true
            });
        })

        
    } catch (error) {
        res.status(400).json({resultado:[],exitoso:false}) 
    }    
})

router.get("/:sorteoId/chances-publico", async (req,res)=>{    
    const {sorteoId} = req.params
    const {ord,all,only} = req.query    
    
    var objectWhere = {         
        game_id: sorteoId,
        esValido: 'SI'
    }

    const premiosChances = {
        primer: {
            "CHANCE_GANADOR": 14
        },
        segundo: {
            "CHANCE_GANADOR": 3
        },
        tercero: {
            "CHANCE_GANADOR": 2
        }
    }

    try {
        // Primero obtenemos el valor de sacado-chance de la configuración
        const config = await DB.Config.findOne({
            where: {
                propiedad: 'sacado-chance'
            }
        });

        const sacadoChance = config ? parseFloat(config.valor) : 0;

        const results = await DB.GameTicketRecord.findAll({
            where:{                
                tipo:"CHANCE"
            },
            include:[{
                model:DB.GameTicket,
                where:objectWhere,
                required:true,
                attributes:[],
                include:[{
                    model:DB.User,                    
                    required:true,
                    attributes:[]
                }]
            }],
            attributes:[
                'numero',
                'primer_premio',
                'segundo_premio',
                'tercer_premio',         
                [DB.sequelize.fn('sum', DB.sequelize.col('cantidad')), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador1er')), 'dineroPremio1er'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador2do')), 'dineroPremio2do'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador3ro')), 'dineroPremio3ro'],
            ],
            group:['numero']            
        });

        // Procesamos los resultados para aplicar el descuento
        const processedResults = results.map(record => {
            const item = record.toJSON();
            // Quiero restar el valor de la item.cantidad y el valor de sacadoChance
            if (item.cantidad) {
                //Si la cantidad es mayor a a sacadoChance
                if (item.cantidad > sacadoChance) {
                    item.cantidad -= sacadoChance;
                    // Buscar el valor del premio correspondiente
                    if (item.primer_premio && premiosChances.primer[item.primer_premio]) {
                        item.dineroPremio1er -= sacadoChance * premiosChances.primer[item.primer_premio];
                    }
                    if (item.segundo_premio && premiosChances.segundo[item.segundo_premio]) {
                        item.dineroPremio2do -= sacadoChance * premiosChances.segundo[item.segundo_premio];
                    }
                    if (item.tercer_premio && premiosChances.tercero[item.tercer_premio]) {
                        item.dineroPremio3ro -= sacadoChance * premiosChances.tercero[item.tercer_premio];
                    }
                } else {
                    // Si la cantidad es menor o igual a sacadoChance, lo dejamos en 0
                    item.cantidad = 0;
                    item.dineroPremio1er = 0;
                    item.dineroPremio2do = 0;
                    item.dineroPremio3ro = 0;
                }
            }   

            // Calculamos el total de premios con el descuento aplicado
            item.totalPremios = (
                (item.dineroPremio1er || 0) + 
                (item.dineroPremio2do || 0) + 
                (item.dineroPremio3ro || 0)
            );

            return item;
        });

        res.status(200).json({
            resultado: processedResults,
            exitoso: true
        });

    } catch (error) {
        res.status(500).json({
            resultado: {
                mensaje: "Ocurrio un error buscando el estado de cuenta",
                error: error
            },
            exitoso: false
        });
    } 
});

module.exports = router