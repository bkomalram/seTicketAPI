const express = require("express")
const router = express.Router()

const con = require("../modules/database")
const DB = require ("../models/index")

/*Tiquete*/
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
                //attributes:[] //Nada de GameTicket en la respuesta
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
})

router.post("/tiquete/crear", (req,res)=>{
    const { sorteoId, usuarioId, tipo, valor } = req.body

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

    con.query(accion,[sorteoId, usuarioId, tipo, valor],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows[0][0]})
        } else {
            console.log(err)
        }
    })
})

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
})


module.exports = router