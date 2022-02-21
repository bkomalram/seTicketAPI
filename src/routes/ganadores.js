const express = require("express")
const router = express.Router()

const con = require("../modules/database")
const DB = require ("../models/index")

/*Ganadores*/

/*  Refactor v3.0
    Sequelize - ORM
    BK*/

    /*Limpia Ganadores*/
router.patch("/",(req,res)=>{    
    const { sorteoId } = req.body       
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
                AND gT.game_Id =` +sorteoId+`
                AND SUBSTR(gTR.NUMERO,4,1)  = ` + numeroGanador1er.substr(3,4)

                //Ejecuntando SQL
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = `+ numeroGanador1er.substr(2,4)                
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sqlDosUltimos) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,2)  = `+ numeroGanador1er.substr(0,2)
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,2)  = `+ numeroGanador1er.substr(0,2)+`
                AND SUBSTR(gTR.NUMERO,4,1)  = `+ numeroGanador1er.substr(3,4)
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,2,3)  = `+ numeroGanador1er.substr(1,3)
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,1,3)  = `+ numeroGanador1er.substr(0,3)
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
                AND gT.game_Id = `+sorteoId+`                
                AND SUBSTR(gTR.NUMERO,1,4)  = `+ numeroGanador1er
                /*Ejecutando*/
                try {
                    DB.sequelize.query(sentencia) 
                    .then((results, metadata) => {                    
                        res.json({
                            resultado: results[0],
                            exitoso:true            
                        })                    
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
    for (let index = 5; index > 1; index--) {        
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = `+ numeroGanador2do.substr(2,4)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,2,3)  = `+ numeroGanador2do.substr(1,3)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,3)  = `+ numeroGanador2do.substr(0,3)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,4)  = `+ numeroGanador2do
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
    for (let index = 5; index > 1; index--) {        
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,3,2)  = `+ numeroGanador3er.substr(2,2)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,2,3)  = `+ numeroGanador3er.substr(1,3)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,3)  = `+ numeroGanador3er.substr(0,3)
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
                AND gT.game_Id = `+sorteoId+`
                AND SUBSTR(gTR.NUMERO,1,4)  = `+ numeroGanador3er
                
                /*Ejecutando*/
                DB.sequelize.query(sentencia)
                .then((results, metadata) => {                    
                    res.json({
                        resultado: results[0],                        
                        exitoso:true            
                    })
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
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = `+ numeroGanador1er.substr(2,2)
    
    /*Ejecutando*/
    DB.sequelize.query(sentencia)
    .then((results, metadata) => {                    
        res.json({
            resultado: results[0],                        
            exitoso:true            
        })
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
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = `+ numeroGanador2do.substr(2,2)
    
    /*Ejecutando*/
    DB.sequelize.query(sentencia)
    .then((results, metadata) => {                    
        res.json({
            resultado: results[0],                        
            exitoso:true            
        })
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
    AND gT.game_Id = `+sorteoId+`
    AND gTR.NUMERO  = `+ numeroGanador3er.substr(2,2)
    
    /*Ejecutando*/
    DB.sequelize.query(sentencia)
    .then((results, metadata) => {                    
        res.json({
            resultado: results[0],                        
            exitoso:true            
        })
    })
    .catch(function(reason) {
        res.json({
            resultado: reason,                        
            exitoso:false            
        })
        return
    });
    
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