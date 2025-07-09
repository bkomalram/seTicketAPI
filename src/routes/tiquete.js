const express = require("express")
const router = express.Router()

const DB = require ("../models/index")
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Add these functions to your code:
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    let encrypted = cipher.update(text.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + '-' + encrypted.toString('hex') + '-' + authTag.toString('hex');
}

function decrypt(text, key) {
    try {
        const [ivHex, encryptedHex, authTagHex] = text.split('-');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Invalid encryption format or corrupted data');
    }
}

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
            userId: req.jornada.id,
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
                valorganador1er: 0.00,
                valorganador2do: 0.00,
                valorganador3ro: 0.00
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


/*Tiquete*/
router.post("/mq", async (req,res)=>{
    const { sorteoId, userId, valor, registros, editar} = req.body

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
        /**
         * Verificar si el sorteo esta en venta
         */         
        var enVenta = await DB.Game.findOne({
            where: DB.sequelize.literal('id = '+ sorteoId +' and esActivo = "SI" and enVenta = "SI"' )                    
        });

        if (!enVenta) {
            res.status(500).json({resultado:"Venta detenida o cerrada para sorteo.",exitoso:false})
            return
        }

        var headerTicket

        if (editar) {
            const accion = await DB.GameTicket.update({
                game_id: sorteoId,
                fecha: new Date(),
                userId: userId ? userId : req.jornada.id,
                ganador: 'NO',
                valorcompra: valor,
                valorganador: 0.00,
                cambio: 'NO',
                esValido: 'SI'
            },{ where: { id: editar }})

            headerTicket  = await DB.GameTicket.findOne({ where: { id: editar } })
        } else {

            /*Create GameTicket Instance*/
            headerTicket = await DB.GameTicket.create({
            game_id: sorteoId,
            fecha: new Date(),
            userId: userId ? userId : req.jornada.id,
            ganador: 'NO',
            valorcompra: valor,
            valorganador: 0.00,
            cambio: 'NO',
            esValido: 'SI'
            })

        }

        /**
         * Armando payload para MQ
         */

        var mqBody = {
            headerTicket: headerTicket,
            registros:registros,
            jornada:req.jornada.id,
            sorteoId:sorteoId
        }
        
        /**
         * AMQP - Callback structure
         * Necesitas crear un network para comunicar los contenedores,
         * asi poder tener una aplicación completa.
         *  */
         amqp.connect('amqp://lsmq', function(error0, connection) {
            if (error0) {
              throw error0;
            }
            connection.createChannel(function(error1, channel) {
              if (error1) {
                throw error1;
              }
              channel.assertQueue('', {
                exclusive: true
              }, function(error2, q) {
                if (error2) {
                  throw error2;
                }
                var correlationId = uuidv4()                        
          
                console.log(' [x] Pidiendo crear Registros de %d', headerTicket.id);
          
                channel.consume(q.queue, function(msg) {
                  if (msg.properties.correlationId == correlationId) {
                    console.log(' [.] Got %s', msg.content.toString());

                    res.status(201).json({resultado:headerTicket,exitoso:true})                    

                    setTimeout(function() {
                      connection.close();                              
                    }, 500);
                  }
                }, {
                  noAck: true
                });
                
                const queueName = "queue-ticket-prevent-duplication"

                channel.sendToQueue(queueName,
                  Buffer.from(JSON.stringify(mqBody)),{
                    correlationId: correlationId,
                    replyTo: q.queue });
              });
            });
          });          
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    }    

})

router.get("/", (req,res)=>{

    const users = req.query.users
    
    const usersArray = users.split(",").map(id => parseInt(id.trim(), 10));

    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }   

    try {              
        DB.GameTicket.findAll({
            where:{                
                userId: {
                    [DB.Sequelize.Op.in]: usersArray,
                },
                game_id: req.query.game,
                esValido: 'SI'
            },           
            order:[
                ["id", 'DESC'],
                ["userId", 'ASC'],
            ]
        })
        .then((response)=>{            
            res.status(200).json({resultado:response,exitoso:true})       
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    } 
})

/*
Refactor v4.0
    Sequelize - ORM
    BK
    @@Se configura el endpoint para generar el cifrado y descifrado de los QR
*/
router.get("/cifrar", (req,res)=>{
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    if (!req.query.id) {
        res.status(400).json(
            {
                resultado: "No se puede generar el cifrado",
                exitoso:false
            })
            return
    }
    const key = process.env.CRYPTO_SALT.slice(0, 32); // Must be 32 bytes for AES-256
    const encrypted = encrypt(req.query.id, key);
    res.status(200).json({
        token:encrypted,
        exitoso:true
    })
    return
})

router.get("/decifrar", (req,res)=>{
    try {
        if (req.jornada.accesos == 0) {
            res.json({
                resultado: "Privilegios insuficientes",
                exitoso:false
            })
            return
        }

        if (!req.query.token) {
            res.status(400).json(
                {
                    resultado: "Token no valido",
                    exitoso:false
                })
                return
        }

        const key = process.env.CRYPTO_SALT.slice(0, 32); // Must be 32 bytes for AES-256
        const decrypted = decrypt(req.query.token, key);

        res.status(200).json(
            {
                resultado: decrypted,
                exitoso:true
            })
            return

    } catch (error) {
        res.status(500).json({
            resultado: error,
            exitoso:false
        })
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
    const accion = req.query.accion

    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }

    /*Puede ver los ticket de su grupo y los suyos*/
    var tempList = req.jornada.id+','+req.jornada.hijos        

    if (accion == "editar") {
        var includeGame = [{
            model: DB.Game,
            required: true,
            where: { esActivo: "SI", enVenta:"SI" },
            attributes: []
        }]
    } else {
        var includeGame = [{
            model: DB.Game,
            required: true,
            where: { 
                esActivo: {
                    [DB.Sequelize.Op.in]: ["SI", "NO"],
                },
                enVenta: {
                    [DB.Sequelize.Op.in]: ["SI", "NO"],
                }
            },
            attributes: []
        }]
    }

    //Si el usuario es principal, puede editar todos los tickets
    if (req.jornada.usuario == "principal") {
        var userWhere = { esValido: "SI"}
    } else {
        var userWhere = { 
            userId : tempList.split(","),
            esValido: "SI"
        }
    }

    try {              
        DB.GameTicketRecord.findAll({
            where:{                
                gameTicketId:tiqueteId
            },
            include:[{
                model:DB.GameTicket,                
                required:true,
                attributes:[
                    ["valorcompra","total"],
                    ["cambio","cambio"]
                ],
                where: userWhere,
                include: includeGame
            }],            
            order:[
                ["numero", 'ASC'],
            ]
        })
        .then((LeftJoin)=>{            
            res.status(200).json({resultado:LeftJoin,exitoso:true})       
        })
        .catch((error) => {
            console.log(error)
            res.status(400).json({
                resultado: "El sorteo no está activo o ha ocurrido un error",
                exitoso:false
            })
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    } 
})


router.patch("/", (req,res)=>{
    const { tiqueteId } = req.body
    if (req.jornada.accesos == 0) {
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
        DB.GameTicket.update({            
            esValido: "NO"
        },{ 
            where: { id:tiqueteId, userId : req.jornada.id }
        })
        .then((Game)=>{
            res.status(201).json({resultado:{mensaje:"Ticket eliminado"},exitoso:true})       
        })        
    } catch (error) {
        res.status(500).json({resultado:{mensaje:"Ocurrio un error eliminando ticket",error:error},exitoso:false})
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