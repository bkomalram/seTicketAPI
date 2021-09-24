const express = require("express")
const router = express.Router()

const con = require("../modules/database")
const DB = require ("../models/index")

/*Sorteo*/
router.post("/crear", (req,res)=>{
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

router.post("/cerrar", (req,res)=>{
    const { sorteoId } = req.body
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    const accion = "CALL rCierraSorteo(?);"        

    con.query(accion,[sorteoId],function (err,rows,fields) {
        if (!err) {
            res.json({resultado:{mensaje:"Exito"},exitoso:true})
        } else {
            res.json({resultado:{mensaje:"Ocurrio un error cerrando sorteo"},exitoso:false})
        }
    })
})

router.get("/activos", (req,res)=>{    
    const accion = "SELECT * FROM tSorteos WHERE ESACTIVO = 'SI'" 
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }       

    con.query(accion,function (err,rows,fields) {
        if (!err) {            
            res.json({resultado:{registros:rows},exitoso:true})
        } else {
            res.json({resultado:{mensaje:"Ocurrio un error buscando lista de sorteos"},exitoso:false})
        }
    })
})

/*Chances*/
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

router.get("/chances/:sorteoId/:usuarioId/:ordenado", (req,res)=>{
    const {sorteoId, ordenado, usuarioId} = req.params
    const accion = ordenado == 1 ? "SELECT CHANCE, CANTIDAD FROM tSorteoEstado WHERE SORTEO_ID = ? AND USUARIO_ID = ? ORDER BY CANTIDAD DESC" : "SELECT CHANCE, CANTIDAD FROM tSorteoEstado WHERE SORTEO_ID = ? AND USUARIO_ID = ?"
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[sorteoId, usuarioId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
})

/*Billetes*/

router.get("/billetes/:sorteoId/:usuarioId", (req,res)=>{
    const {sorteoId, usuarioId} = req.params
    const accion = `
    SELECT NUMERO, SUM(CANTIDAD) CANTIDAD  FROM tSorteoTiquetes CABEZA
    LEFT JOIN tSorteoTiquetesRegistros CUERPO ON CUERPO.TIQUETE_ID = CABEZA.ID
    WHERE CABEZA.SORTEO_ID = ?
    AND CABEZA.VENDEDOR_ID = ?
    AND LENGTH(NUMERO)>3
    GROUP BY NUMERO
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
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
})

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

/*Tiquete*/

router.get("/tiquete/:tiqueteId", (req,res)=>{
    const {tiqueteId} = req.params
    const accion = `
    SELECT * FROM tSorteoTiquetesRegistros Registros
    LEFT JOIN tSorteoTiquetes Tiquetes on Tiquetes.Id = Registros.Tiquete_ID
    WHERE Registros.Tiquete_ID = ?
    ORDER BY NUMERO ASC
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
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
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