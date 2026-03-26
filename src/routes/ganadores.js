const express = require("express")
const router = express.Router()

const DB = require ("../models/index")

/*Ganadores*/

/*  Refactor v3.0
    Sequelize - ORM
    BK*/

    /*Limpia Ganadores*/
router.patch("/",(req,res)=>{    
    const { sorteoId } = req.body    
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }    
    DB.sequelize.query("UPDATE GameTicketRecords gtR LEFT JOIN GameTickets gT ON gT.Id = gtR.gameTicketId SET gT.ganador = 'NO', gT.valorganador = 0, gtR.ganador = 'NO', gtR.primer_premio = null, gtR.segundo_premio = null, gtR.tercer_premio = null, gtR.valorganador1er = 0, gtR.valorganador2do = 0, gtR.valorganador3ro = 0 WHERE gT.cambio = 'NO' and gT.game_id = "+sorteoId)
    .then((results, metadata) => {
        // Results will be an empty array and metadata will contain the number of affected rows.        
        res.json({
            resultado: results[0],
            exitoso:true            
        })
      });    
})

router.post("/", (req,res)=>{
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
    * Primer Premio
    * Refactor Sequelice 3.0
    */
   var p1,p2,p3,p4,p5,p6,p7
    for (let index = 8; index > 1; index--) {  
        
        switch (index) {
            case 8:                
                var montoPremio=1                
                /*                
                * ULTIMO NUMERO
                *
                * Para 7892
                * Javascript
                * "7892".substr(3,4) => "2"
                * 
                * SQL
                * SUBSTR("7892",4,1) => "2"
                *Armando sentencia                  
                               
                */
                var sentencia = `UPDATE GameTickets gT 
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI',
                gT.valorganador = 0,
                gTR.ganador = 'SI',
                gTR.primer_premio = 'ULTIMO_NUMERO',
                gTR.valorganador1er = gTR.cantidad *` +montoPremio+`              
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI' 
                AND gT.game_Id =` +sorteoId+`
                AND SUBSTR(gTR.NUMERO,4,1)  = '` + numeroGanador1er.substr(3,4)+`'`

                //Ejecuntando SQL
                try {
                    p1= DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                                
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }                                                                                              
                break;

            case 7:
                var montoPremio=3 
                /*                
                * DOS ULTIMOS
                * Pagan 3$
                *
                * Para 7892
                * Javascript
                * "7892".substr(2,4) => "92"
                * 
                * SQL
                * SUBSTR("7892",3,2) => "92"
                *
                * Armando sentencia
                */
                var sqlDosUltimos = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'DOS_ULTIMOS',                
                gTR.valorganador1er = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = '`+ numeroGanador1er.substr(2,4)+`'`                
                /*Ejecutando*/
                try {
                    p2 = DB.sequelize.query(sqlDosUltimos) 
                    .then((results, metadata) => {                                                               
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }                                
                break;
            case 6:               
                var montoPremio=3 
                /*                
                * DOS PRIMEROS
                * Pagan 3$
                *
                * Para 7892
                * Javascript
                * "7892".substr(0,2) => "78"
                * 
                * SQL
                * SUBSTR("7892",1,2) => "78"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'DOS_PRIMEROS',                
                gTR.valorganador1er = gTR.cantidad * `+montoPremio+ `
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,2)  = '`+ numeroGanador1er.substr(0,2)+`'`
                /*Ejecutando*/
                try {
                    p3 = DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                               
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }
                break;
            case 5:
                /*Especial Primer Premio - Dos primeras y Ultimo número*/                
                var montoPremio=4 
                /*                
                * 'DOS_PRIMEROS_ULTIMO_NUMERO'
                * Pagan 4$
                *
                * Para 7892
                * Javascript
                * "7892".substr(0,2) => "78"
                * "7892".substr(3,4) => "2"
                * 
                * SQL
                * SUBSTR("7892",1,2) => "78"
                * SUBSTR("7892",4,1) => "2"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'DOS_PRIMEROS_ULTIMO_NUMERO',                
                gTR.valorganador1er = gTR.cantidad * `+montoPremio+ `
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,2)  = '`+ numeroGanador1er.substr(0,2)+`'
                AND SUBSTR(gTR.NUMERO,4,1)  = '`+ numeroGanador1er.substr(3,4)+`'`
                /*Ejecutando*/
                try {
                    p4 = DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                               
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }                           
                break;
            case 4:                
                var montoPremio= 50
                /*                
                * 'TRES_ULTIMOS'
                * Pagan 50$
                *
                * Para 7892
                * Javascript
                * "7892".substr(1,3) => "892"
                * 
                * SQL
                * SUBSTR("7892",2,3) => "892"                
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'TRES_ULTIMOS',                
                gTR.valorganador1er = gTR.cantidad * `+montoPremio+ `
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,2,3)  = '`+ numeroGanador1er.substr(1,3)+`'`
                /*Ejecutando*/
                try {
                    p5 = DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                               
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }
               
                break;
            case 3:                                
                var montoPremio= 50
                /*                
                * 'TRES_PRIMEROS'
                * Pagan 50$
                *
                * Para 7892
                * Javascript
                * "7892".substr(0,3) => "892"
                * 
                * SQL
                * SUBSTR("7892",1,3) => "789"                
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'TRES_PRIMEROS',                
                gTR.valorganador1er = gTR.cantidad * `+montoPremio+ `
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,1,3)  = '`+ numeroGanador1er.substr(0,3)+`'` 
                /*Ejecutando*/
                try {
                    p6 = DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                              
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }
                break;
            case 2:                
                var montoPremio= 2000
                /*                
                * 'CUATRO_NUMEROS'
                * Pagan 2000$
                *
                * Para 7892
                * Javascript
                * "7892"
                * 
                * SQL
                * SUBSTR("7892",1,4) => "7892"                
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.primer_premio = 'CUATRO_NUMEROS',                
                gTR.valorganador1er = gTR.cantidad * `+montoPremio+ `
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,1,4)  = '`+ numeroGanador1er+`'` 
                /*Ejecutando*/
                try {
                    p7 = DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                                                               
                    })
                    .catch(function(reason) {
                        res.json({
                            resultado: reason,                        
                            exitoso:false            
                        })
                    });                    
                } catch (error) {
                    res.json({
                        resultado: error,
                        exitoso:false            
                    }) 
                    return
                }
                break;
            default:
                break;
        }            
    }
    /*Refactor Sequelice 3.0 - Completo - 19022022*/
    /**
     * Si requieres meter extraordinario, ponlo aquí, para que lo evalue saliendo del BILLETE
     */
    
    respuesta.primerPremio = true
    
    /*
    * Segundo Premio
    * Refactor Sequelice 3.0
    */
   var p8,p9,p10,p11
   var indexSegundoPremio = 5
   if (numeroGanador2do.substr(0,2) == "XX") {
    //Si las dos primeras posiciones son XX, no se ejecuta el segundo premio
    indexSegundoPremio = 1  
   }

    for (let index = indexSegundoPremio; index > 1; index--) {        
        switch (index) {
            case 5:                
                var montoPremio= 2
                /*                
                * DOS ULTIMOS
                * Pagan 2$
                *
                * Para 7892
                * Javascript
                * "7892".substr(2,4) => "92"
                * 
                * SQL
                * SUBSTR("7892",3,2) => "92"
                *
                * Armando sentencia
                * 
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.segundo_premio = 'DOS_ULTIMOS',
                gTR.valorganador2do = gTR.cantidad *`+montoPremio+`                
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = '`+ numeroGanador2do.substr(2,4)+`'` 
                
                /*Ejecutando*/
                p8 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                })                  
                break;
            case 4:                
                var montoPremio= 20
                /*                
                * TRES_ULTIMOS
                * Pagan 20$
                *
                * Para 7892
                * Javascript
                * "7892".substr(1,3) => "892"
                * 
                * SQL
                * SUBSTR("7892",2,3) => "892"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.segundo_premio = 'TRES_ULTIMOS',                
                gTR.valorganador2do = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,2,3)  = '`+ numeroGanador2do.substr(1,3)+`'` 
                
                /*Ejecutando*/
                p9 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                }); 
                break;                
            case 3:                
                var montoPremio= 20
                /*                
                * TRES_PRIMEROS
                * Pagan 20$
                *
                * Para 7892
                * Javascript
                * "7892".substr(0,3) => "789"
                * 
                * SQL
                * SUBSTR("7892",1,3) => "789"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.segundo_premio = 'TRES_PRIMEROS',                
                gTR.valorganador2do = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,3)  = '`+ numeroGanador2do.substr(0,3)+`'` 
                
                /*Ejecutando*/
                p10 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                }); 
                break;
            case 2:                
                var montoPremio= 600
                /*                
                * CUATRO_NUMEROS
                * Pagan 600$
                *
                * Para 7892
                * Javascript
                * "7892"
                * 
                * SQL
                * SUBSTR("7892",1,4) => "789"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.segundo_premio = 'CUATRO_NUMEROS',                
                gTR.valorganador2do = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,4)  = '`+ numeroGanador2do+`'` 
                
                /*Ejecutando*/
                p11 =DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                }); 
                break;
            default:
                break;
        }        
    }
    respuesta.segundoPremio = true

    /*
    * Segundo Premio
    * Refactor Sequelice 3.0 - 20022022
    */


    /*
    * Tercer Premio
    * Refactor Sequelice 3.0 
    */

    //Tercer Premio    
    var p12,p13,p14,p15

    var indexTercerPremio = 5
   if (numeroGanador2do.substr(0,2) == "XX") {
    //Si las dos primeras posiciones son XX, no se ejecuta el tercer premio
    indexTercerPremio = 1  
   }

    for (let index = indexTercerPremio; index > 1; index--) {        
        switch (index) {
            case 5:                
                var montoPremio= 1
                /*                
                * DOS_ULTIMOS
                * Pagan 1$
                *
                * Para 7892
                * Javascript
                * "7892".substr(2,2) => "92"
                * 
                * SQL
                * SUBSTR("7892",3,2) => "92"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.tercer_premio = 'DOS_ULTIMOS',                
                gTR.valorganador3ro = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = '`+ numeroGanador3er.substr(2,2)+`'` 
                
                /*Ejecutando*/
                p12 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                });
                break;
            case 4:                
                var montoPremio= 10
                /*                
                * TRES_ULTIMOS
                * Pagan 10$
                *
                * Para 7892
                * Javascript
                * "7892".substr(1,3) => "892"
                * 
                * SQL
                * SUBSTR("7892",2,3) => "892"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.tercer_premio = 'TRES_ULTIMOS',                
                gTR.valorganador3ro = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,2,3)  = '`+ numeroGanador3er.substr(1,3)+`'` 
                
                /*Ejecutando*/
                p13 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                });
                break;
            case 3:                
                var montoPremio= 10
                /*                
                * TRES_PRIMEROS
                * Pagan 10$
                *
                * Para 7892
                * Javascript
                * "7892".substr(0,3) => "789"
                * 
                * SQL
                * SUBSTR("7892",1,3) => "789"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.tercer_premio = 'TRES_PRIMEROS',                
                gTR.valorganador3ro = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,3)  = '`+ numeroGanador3er.substr(0,3)+`'` 
                
                /*Ejecutando*/
                p14 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                });
                break;
            case 2:                
                var montoPremio= 300
                /*                
                * CUATRO_NUMEROS
                * Pagan 300$
                *
                * Para 7892
                * Javascript
                * "7892"
                * 
                * SQL
                * SUBSTR("7892",1,4) => "7892"
                *
                * Armando sentencia
                */
                var sentencia = `UPDATE GameTickets gT
                LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
                SET gT.ganador = 'SI', 
                gT.valorganador = 0, 
                gTR.ganador = 'SI', 
                gTR.tercer_premio = 'CUATRO_NUMEROS',                
                gTR.valorganador3ro = gTR.cantidad *`+montoPremio+`
                WHERE gTR.tipo = 'BILLETE'
                AND gT.esValido = 'SI'
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,4)  = '`+ numeroGanador3er+`'` 
                
                /*Ejecutando*/
                p15 = DB.sequelize.query(sentencia)
                .then((results, metadata) => {                                        
                })
                .catch(function(reason) {
                    res.json({
                        resultado: reason,                        
                        exitoso:false            
                    })
                    return
                });
                break;
            default:
                break;
        }
        
    }
    respuesta.tercerPremio = true

    /*
    * Tercer Premio
    * Refactor Sequelice 3.0 - 20022022
    */
    
    /**
     * Chances Primer Premio
     * Refactor Sequelice 3.0 
     */
    //Chances 1er
    var accion = "CALL rActualizaGanadores1erPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador1er.substr(2,2)]
    var montoPremio= 14
    /*                
    * CHANCE_GANADOR
    * Pagan 14$
    *
    * Para 7892
    * Javascript
    * "7892".substr(2,2) => "92"
    *     
    *
    * Armando sentencia
    */
    var sentencia = `UPDATE GameTickets gT
    LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI', 
    gT.valorganador = 0, 
    gTR.ganador = 'SI', 
    gTR.primer_premio = 'CHANCE_GANADOR',                
    gTR.valorganador1er = gTR.cantidad *`+montoPremio+`
    WHERE gTR.tipo = 'CHANCE'
    AND gT.esValido = 'SI'
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = '`+ numeroGanador1er.substr(2,2)+`'` 
    
    /*Ejecutando*/
    const p16 = DB.sequelize.query(sentencia)
    .then((results, metadata) => {                            
    })
    .catch(function(reason) {
        res.json({
            resultado: reason,                        
            exitoso:false            
        })
        return
    });
    
    respuesta.chances1er = true
    
    //Chances 2do
    var accion = "CALL rActualizaGanadores2doPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador2do.substr(2,2)]
    var montoPremio= 3
    /*                
    * CHANCE_GANADOR
    * Pagan 3$
    *
    * Para 7892
    * Javascript
    * "7892".substr(2,2) => "92"
    *     
    *
    * Armando sentencia
    */
    var sentencia = `UPDATE GameTickets gT
    LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI', 
    gT.valorganador = 0, 
    gTR.ganador = 'SI', 
    gTR.segundo_premio = 'CHANCE_GANADOR',                
    gTR.valorganador2do = gTR.cantidad *`+montoPremio+`
    WHERE gTR.tipo = 'CHANCE'
    AND gT.esValido = 'SI'
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = '`+ numeroGanador2do.substr(2,2)+`'` 
    
    /*Ejecutando*/
    const p17 = DB.sequelize.query(sentencia)
    .then((results, metadata) => {                            
    })
    .catch(function(reason) {
        res.json({
            resultado: reason,                        
            exitoso:false            
        })
        return
    });
    
    respuesta.chances2do = true

    //Chances 3er
    var accion = "CALL rActualizaGanadores3erPremioChance(?,?);" 
    var parametros = [sorteoId,numeroGanador3er.substr(2,2)]
    var montoPremio= 2
    /*                
    * CHANCE_GANADOR
    * Pagan 2$
    *
    * Para 7892
    * Javascript
    * "7892".substr(2,2) => "92"
    *     
    *
    * Armando sentencia
    */
    var sentencia = `UPDATE GameTickets gT
    LEFT JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI', 
    gT.valorganador = 0, 
    gTR.ganador = 'SI', 
    gTR.tercer_premio = 'CHANCE_GANADOR',                
    gTR.valorganador3ro = gTR.cantidad *`+montoPremio+`
    WHERE gTR.tipo = 'CHANCE'
    AND gT.esValido = 'SI'
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = '`+ numeroGanador3er.substr(2,2)+`'` 
    
    /*Ejecutando*/
    const p18 = DB.sequelize.query(sentencia)
    .then((results, metadata) => {                            
    })
    .catch(function(reason) {
        res.json({
            resultado: reason,                        
            exitoso:false            
        })
        return
    });
    
    respuesta.chances3er = true
    
    Promise.all([p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18]).then((values) => {
        res.json({
            resultado: respuesta,
            exitoso:true            
        });
      })
      .catch(function(reason) {
        console.log(reason)
        res.json({
            resultado: respuesta,                        
            exitoso:false            
        })
        return
    });         
})

router.get("/", (req,res)=>{
    
    //const {sorteoId} = req.params
    const {accion,only} = req.query    
    
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    if (accion == "chance") {
        var whereCondition = {                                                
            ganador: "SI",
            tipo: "CHANCE"
        }
    } else if(accion == "billete") {
        var whereCondition = {                                                
            ganador: "SI",
            tipo: "BILLETE"
        }
    }
    else {
        var whereCondition = {                                                
            ganador: "SI"
        }
    }

    if (only) {       
        var whereGameCondition = {                                                
            cambio: "NO",
            esValido: "SI",
            userId: only.split(",")
        } 
    } else {
        var whereGameCondition = {                                                
            cambio: "NO",
            esValido: "SI"
        } 
    }
    
    
    try {              
        DB.GameTicketRecord.findAll({  
            where:whereCondition,
            include:[{
                model:DB.GameTicket,                
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                where:whereGameCondition,
                attributes:[] //Nada de GameTicket en la respuesta
            }                            
            ],                        
            attributes:[                
                [DB.sequelize.col("GameTicket.game_id"),'gameId'],                
                [DB.sequelize.fn('sum', DB.sequelize.literal('GameTicketRecord.valorganador1er + GameTicketRecord.valorganador2do + GameTicketRecord.valorganador3ro')), 'total'],                 
            ],
            group:['GameTicket.game_id'],            
        })
        .then((LeftJoin)=>{ 
            
            
            newResponse = []
            promises = []
            LeftJoin.forEach(element => {               
                promises.push(DB.Game.findOne({
                    where: DB.sequelize.literal('id = '+ element.dataValues.gameId)                    
                })
                .then((Juego)=>{
                    let elemento = {}
                    elemento.gameId = element.dataValues.gameId                    
                    elemento.gameName = Juego.nombre
                    elemento.total = element.dataValues.total
                    newResponse.push(elemento)
                    return
                }))
            });            
            Promise.all(promises).then((values) => {
                res.status(200).json({resultado:newResponse,exitoso:true}) 
              });                        
        })
        
    } catch (error) {        
        res.status(400).json({resultado:error,exitoso:false}) 
        return
    }

})

router.get("/:sorteoId", (req,res)=>{
    
    const {sorteoId} = req.params
    const {accion, only} = req.query    
      
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    if (accion == "chance") {
        var whereCondition = {                                                
            ganador: "SI",
            tipo: "CHANCE"
        }
    } else if(accion == "billete") {
        var whereCondition = {                                                
            ganador: "SI",
            tipo: "BILLETE"
        }
    }
    else {
        var whereCondition = {                                                
            ganador: "SI"
        }
    }


    if (only) {            
        var leftwhereCondition = {                                    
            game_id:sorteoId,
            userId: only.split(","),
            cambio: "NO",
            esValido: "SI"
        }
    } else {
        var leftwhereCondition = {                                    
            game_id:sorteoId,
            cambio: "NO",
            esValido: "SI"
        }
    }
    
    try {              
        DB.GameTicketRecord.findAll({  
            where:whereCondition,
            include:[{
                model:DB.GameTicket,                
                required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                where:leftwhereCondition,
                attributes:[] //Nada de GameTicket en la respuesta
            }                            
            ],            
            order:[
                ["numero", 'ASC'],
            ]
        })
        .then((LeftJoin)=>{            
            res.status(200).json({resultado:LeftJoin,exitoso:true})  
            return     
        })
        
    } catch (error) {        
        res.status(400).json({resultado:error,exitoso:false}) 
        return
    }

})


/**
 * Continua aquí, sigue con ticket, luego configuracion.
 */

router.put("/", (req,res)=>{
    const { tiqueteId } = req.body

    try {

        if (req.jornada.accesos == 0) {
            res.json({
                resultado: "Privilegios insuficientes",
                exitoso:false
            })
            return
        }

        DB.GameTicket.update({            
            cambio: "SI"
        },{ 
            where: {id:tiqueteId,esValido:'SI'}
        })        
        .then((Result)=>{
            if(!Result){
                res.status(404).json({
                    resultado: null,                        
                    exitoso:false
                })                    
            } else {
                res.status(200).json({
                    resultado: Result,                        
                    exitoso:true
                })  
            }
            return                            
        })
    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        })
    }
})

router.post("/calcular", async (req,res)=>{

    const { sorteoId, numeroGanador1er, numeroGanador2do, numeroGanador3er} = req.body
    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    const [rows] = await DB.sequelize.query(
    "CALL sp_actualiza_ganadores(?,?,?,?,@ok,@msg); SELECT @ok AS ok, @msg AS message;",
    { replacements: [sorteoId, numeroGanador1er, numeroGanador2do, numeroGanador3er], type: DB.sequelize.QueryTypes.SELECT }
    );
    // rows contiene ok/message después de la ejecución
    res.json({ resultado: rows, exitoso: true });
})


module.exports = router