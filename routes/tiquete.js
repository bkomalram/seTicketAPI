const express = require("express")
const router = express.Router()

const con = require("../modules/database")
const DB = require ("../models/index")

/*Tiquete*/
router.post("/", async (req,res)=>{
    const { sorteoId, valor, registros } = req.body

    const accion = `
    CALL rCrearTiquete(?,?,?,?);
    `        
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }    

    try {
        /*Create GameTicket Instance*/
        const headerTicket = await DB.GameTicket.create({
            game_id: sorteoId,
            fecha: new Date(),
            vendedor_id: req.jornada.id,
            ganador: 'NO',
            valorcompra: valor,
            valorganador: 0.00,
            cambio: 'NO',
            esValido: 'SI'
        })

        /*Create GameTicketRecords Instances*/
        /*@@{ tipo,  numero, cantidad, valor, precio }*/
        registros.forEach( async element => {
            await DB.GameTicketRecord.create({
                gameTicketId: headerTicket.id,
                tipo: element.tipo,
                numero: element.numero,
                cantidad: element.cantidad,
                precio_unidad: element.precio,
                valorcompra: element.valor,
                ganador: 'NO',
                primer_premio: null,
                segundo_premio: null,
                tercer_premio: null,
                valorganador: 0.00
            })
            /*Optional execution Update GameState*/
            if (element.tipo == "CHANCE"){
                /*Select the object*/
                let recordDatabase = await DB.GameState.findOne({
                    where: {
                        game_id:sorteoId,
                        usuario_id:req.jornada.id,
                        chance: element.numero         
                    }
                })
                /*Update the record with the new quantity*/                
                recordDatabase.cantidad = recordDatabase.cantidad + element.cantidad                
                recordDatabase.save()
            }                
        })

        res.status(201).json({resultado:headerTicket,exitoso:true})  
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    }    

})

/*
    Refactor v3.0
    Sequelize - ORM
    BK
    @@Se mueven todos los endpoints relacionado con tiquete a su propio API
*/
router.get("/:tiqueteId", (req,res)=>{
    const {tiqueteId} = req.params

    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }   

    try {              
        DB.GameTicketRecord.findAll({
            where:{                
                gameTicketId:tiqueteId
            },
            include:[{
                model:DB.GameTicket,                
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                attributes:[
                    ["valorcompra","total"]
                ] //Nada de GameTicket en la respuesta
            }                            
            ],            
            order:[
                ["numero", 'ASC'],
            ]
        })
        .then((LeftJoin)=>{            
            res.status(200).json({resultado:LeftJoin,exitoso:true})       
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    } 
})

/*
Refactor v3.0
    Sequelize - ORM
    BK
    @@Se incluye GameTicket.total en la respuesta del endpoint anterior para remover este
router.get("/tiquete/total/:tiqueteId", (req,res)=>{
    const {tiqueteId} = req.params
    const accion = `
    SELECT SUM(VALOR) TOTAL FROM tSorteoTiquetesRegistros
    WHERE Tiquete_ID = ? 
    `
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[tiqueteId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows[0]})
        } else {
            console.log(err)
        }
    })
})*/


/*
Refactor v3.0
    Sequelize - ORM
    BK
    @@Se incluye en el endpoint anterior
router.post("/tiquete", (req,res)=>{
    const { tiqueteId, tipo,  numero, cantidad, valor, precio } = req.body

    const accion = `
    CALL rAgregarRegistros(?,?,?,?,?,?);
    `
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }        
    con.query(accion,[tiqueteId, tipo, numero, cantidad, valor, precio],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true})
        } else {
            console.log(err)
        }
    })
})*/


module.exports = router