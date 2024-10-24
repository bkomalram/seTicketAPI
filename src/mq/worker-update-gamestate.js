#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const DB = require ("../models/index")

/**
 * 
 * 
 * Migra el worker a un contenedor independiente
 * para que se pueda iniciar solo en conjunto de los otros
 * su dependencia.
 * 
 * 
 */

/**
 * Migrando a ejecucion sincrona
 */

 amqp.connect('amqp://lsmq', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      const queueName = "queue-game-status-update"
      
      channel.assertQueue(queueName, {
        durable: false
      });

      channel.prefetch(1);
      console.log(' [x] Esperando peticiones para ejecutar . . .');
    /**
     * Declara el consumo
     */
    channel.consume(queueName, function reply(msg) {    
    /**
     * Proceso asincorno
     */
    try {
        /**
         * Message.content is a JSON.stringify
         * so we must JSON.parse the msg
         */         
         const payload = JSON.parse(msg.content.toString());

        /**
         * registros es un arreglo se recorre
         *  */
         
         payload.registros.forEach(element => {            
            if (element.tipo == "CHANCE"){
                /*Select the object*/
                DB.GameState.findOne({
                    where: {
                        game_id:payload.sorteoId,
                        usuario_id:payload.jornada,
                        chance: element.numero         
                    }
                    /*Update the record with the new quantity*/                
                }).then(recordDatabase=>{
                    recordDatabase.cantidad = recordDatabase.cantidad + element.cantidad                
                    recordDatabase.save()
                })                
            }
                        
        });
    
        /**
         * Regresa el mensaje de completo
         */
        channel.sendToQueue(msg.properties.replyTo,
            Buffer.from("Proceso completo"), {
            correlationId: msg.properties.correlationId
            });
        /**
         * Quita el mensaje de la cola de envio
         */
        channel.ack(msg);
                                        
    } catch (error) {
        /**
         * Regresa el mensaje de fallido
         */        
        console.log(error)
        channel.sendToQueue(msg.properties.replyTo,
            Buffer.from("Error"), {
            correlationId: msg.properties.correlationId
            });
        
        setTimeout(function() {
          process.exit();                              
        }, 500);
    }        

    },{noAck: false});

    });
  });


dbProcess = (developmentTicketRecords, payload)=>{

  var verification

  DB.GameTicketRecord.bulkCreate(developmentTicketRecords)
             .then((state)=>{
             console.log("[-] Ticket "+payload.headerTicket.id+" completo.")
             })
             .then((param)=>{
               /**
                * Verificacion de calidad
                * Header vs Body
                */

                DB.GameTicketRecord.findAll({
                  where:{         
                    gameTicketId: payload.headerTicket.id,                 
                },
                  include:[{
                      model:DB.GameTicket,
                      where:{         
                        id: payload.headerTicket.id,                 
                    },
                      required:true, //false = LEFT OUTER JOIN || true = INNER JOIN
                      attributes:[
                        'id',
                        'valorcompra',                  
                      ]
                  }                            
                  ],
                  attributes:[                                  
                      [DB.sequelize.fn('sum', DB.sequelize.col('GameTicketRecord.valorcompra')), 'bodyAmount']                
                  ],
                  group: ['GameTicket.id']            
              })
              .then((LeftJoin)=>{                                    
                  if (LeftJoin[0].dataValues.bodyAmount != LeftJoin[0].dataValues.GameTicket.valorcompra)
                    verification = false
                  else
                    verification = true                                    
              })              
             })
      return verification
}