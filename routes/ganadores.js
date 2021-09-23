const express = require("express")
const router = express.Router()

const con = require("../modules/database")

/*Chances*/

router.post("/actualizar", async (req,res)=>{
    const { sorteoId, numeroGanador1er, numeroGanador2do, numeroGanador3er} = req.body
    var respuesta = { primerPremio: false, segundoPremio: false, tercerPremio: false, chances1er: false , chances2do: false, chances3er: false}
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    /* 
        1 - 'CHANCE_GANADOR',
        2 - 'CUATRO_NUMEROS',
        3 - 'TRES_PRIMEROS',
        4 - 'TRES_ULTIMOS',
        5 - 'DOS_PRIMEROS',
        6 - 'DOS_ULTIMOS',
        7 - 'ULTIMO_NUMERO'
    */

    //Limpia Ganadores
    var accion = "CALL rLimpiaGanadores(?);" 
    var parametros = [sorteoId]

    await con.query(accion,parametros)
    
    
    //Primer Premio
    for (let index = 8; index > 1; index--) {  
        
        switch (index) {
            case 8:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er.substr(3,4),4,1]
                break;            
            case 7:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er.substr(2,4),3,2]
                break;
            case 6:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er.substr(0,2),1,2]
                break;
            case 5:
                /*Especial Primer Premio - Dos primeras y Ultimo número*/
                var accion = "CALL rActualizaEspecial1erPremio(?,?,?);" 
                var parametros = [sorteoId,numeroGanador1er.substr(0,2),numeroGanador1er.substr(3,4)]
                break;
            case 4:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er.substr(1,3),2,3]
                break;
            case 3:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er.substr(0,3),1,3]
                break;
            case 2:
                var accion = "CALL rActualizaGanadores1erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador1er,1,4]
                break;
            default:
                break;
        }
            console.log(accion,parametros)
            await con.query(accion,parametros)            
    }
    
    
    respuesta.primerPremio = true

    //Segundo Premio
    for (let index = 5; index > 1; index--) {        
        switch (index) {
            case 5:
                var accion = "CALL rActualizaGanadores2doPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador2do.substr(2,2),3,2]
                break;
            case 4:
                var accion = "CALL rActualizaGanadores2doPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador2do.substr(1,3),2,3]
                break;
            case 3:
                var accion = "CALL rActualizaGanadores2doPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador2do.substr(0,3),1,3]
                break;
            case 2:
                var accion = "CALL rActualizaGanadores2doPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador2do,1,4]
                break;
            default:
                break;
        }

        await con.query(accion,parametros)
    }
    respuesta.segundoPremio = true

    //Tercer Premio    
    for (let index = 5; index > 1; index--) {        
        switch (index) {
            case 5:
                var accion = "CALL rActualizaGanadores3erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador3er.substr(2,2),3,2]
                break;
            case 4:
                var accion = "CALL rActualizaGanadores3erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador3er.substr(1,3),2,3]
                break;
            case 3:
                var accion = "CALL rActualizaGanadores3erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador3er.substr(0,3),1,3]
                break;
            case 2:
                var accion = "CALL rActualizaGanadores3erPremio(?,?,?,?,?);" 
                var parametros = [sorteoId,index,numeroGanador3er,1,4]
                break;
            default:
                break;
        }

        await con.query(accion,parametros)
    }
    respuesta.tercerPremio = true
    

    //Chances 1er
    var accion = "CALL rActualizaGanadores1erPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador1er.substr(2,2)]

    await con.query(accion,parametros)
    respuesta.chances1er = true
    
    //Chances 2do
    var accion = "CALL rActualizaGanadores2doPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador2do.substr(2,2)]

    await con.query(accion,parametros)
    respuesta.chances2do = true

    //Chances 3er
    var accion = "CALL rActualizaGanadores3erPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador3er.substr(2,2)]

    await con.query(accion,parametros)
    respuesta.chances3er = true

    res.json(respuesta)
})

router.get("/billete/:sorteoId", (req,res)=>{
    const {sorteoId} = req.params
    const accion = `
    SELECT * FROM 
    tsorteotiquetes TIQ
	LEFT JOIN tSorteoTiquetesRegistros REG on TIQ.ID = REG.TIQUETE_ID        
	WHERE REG.TIPO = 'BILLETE'
    AND TIQ.SORTEO_ID = ?
	AND TIQ.GANADOR = 'SI'
    AND REG.GANADOR = 'SI';
    `
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[sorteoId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
})

router.get("/chance/:sorteoId", (req,res)=>{
    const {sorteoId} = req.params
    const accion = `
    SELECT * FROM 
    tsorteotiquetes TIQ
	LEFT JOIN tSorteoTiquetesRegistros REG on TIQ.ID = REG.TIQUETE_ID        
	WHERE REG.TIPO = 'CHANCE'
    AND TIQ.SORTEO_ID = ?
	AND TIQ.GANADOR = 'SI'
    AND REG.GANADOR = 'SI';
    `
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query(accion,[sorteoId],function (err,rows,fields) {
        if (!err) {
            res.json({termino:true,resultado:rows})
        } else {
            console.log(err)
        }
    })
})

router.post("/cambiar", (req,res)=>{
    const { tiqueteId } = req.body

    const accion = `
    CALL rCambiarTiquete(?);
    `        
    con.query(accion,[tiqueteId])
    
    res.json({ termino: true})
})


module.exports = router