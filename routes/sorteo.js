const express = require("express")
const router = express.Router()

const con = require("../modules/database")
const DB = require ("../models/index")

/*Funciones*/
async function updateChanceQuantity(recordObject) {
    /*Select the object*/
    let recordDatabase = await DB.GameState.findOne({
        where: {
            game_id:sorteoId,
            usuario_id:req.jornada.id,
            chance: chance         
        }
    })
    /*Update the record with the new quantity*/
    console.log("Old quantity: "+recordDatabase.cantidad)
    recordDatabase.cantidad = recordDatabase.cantidad + recordObject.cantidad
    console.log("New quantity: "+recordDatabase.cantidad)
    recordDatabase.save()                
}

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
            resultado: "Se requieren el nombre del sorteo, para proceder.",
            exitoso: false
        })
        return
    } 
    try {
        DB.Game.create({
            usuario_id: req.jornada.id,
            nombre: nombreSorteo,
            fecha: Date.now(),
            esActivo: "SI"
        })
        .then((Game)=>{
            Game.save()
            .then((Commit)=>{
                res.status(201).json({resultado:Commit,exitoso:true})
            })        
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
                esActivo: "SI"
            }
        })
        .then((Game)=>{
            res.status(200).json({resultado:Game,exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error buscando todos los sorteos",error:error},exitoso:false})
    }    
})


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
        DB.Game.findAll({
            where:{         
                esActivo: "SI"
            }
        })
        .then((Game)=>{
            let objectSorteo = Game.find(element => element.id == sorteoId);
            res.status(200).json({resultado:objectSorteo,exitoso:true})       
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
    const {ord,all} = req.query
    /*Optional ordenado = cantidad|chance| defecto chance*/    
    var ordenado = ["chance","cantidad"].indexOf(ord)==-1?"chance":ord    
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
            usuario_id: req.jornada.id
        }
    } else if (all) {            
        var objectWhere = {         
            game_id: sorteoId
        }
    } else {
        var objectWhere = {         
            game_id: sorteoId,
            usuario_id: req.jornada.id
        }
    }    
    
    try {
        DB.GameState.findAll({
            where:objectWhere,
            order:[
                [ordenado, 'DESC'],
            ]
        })
        .then((GameState)=>{
            res.status(201).json({resultado:GameState,exitoso:true})       
        })        
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
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    var objectWhere = {
        vendedor_id:req.jornada.id,
        game_id:sorteoId
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
                attributes:[]
            }                            
            ],
            attributes:[
                'numero',
                [DB.sequelize.fn('sum', DB.sequelize.col('cantidad')), 'cantidad'],                
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'dineroVenta'],
                [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorganador')), 'dineroPremio'],
            ],
            group:['numero']
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

router.get("/configuracion", (req,res)=>{
    
    const accion = `
    SELECT * FROM tConfiguracion
    `
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
})

router.post("/configuracion", (req,res)=>{
    const { nombre, precioChance, precioBillete, impresion, sorteoId } = req.body

    const accion = "CALL rActualizaConfiguracion(?,?,?,?,?)" 

    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[nombre,precioChance,precioBillete,impresion,sorteoId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true})
        } else {
            console.log(err)
        }
    })
})

module.exports = router