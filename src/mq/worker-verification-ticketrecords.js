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

      const queueName = "queue-ticket-verification"
      
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
                return false
            else
                return true                                    
        })
        .then((isOK)=>{        
        /**
         * Enviado a cola de verificacion queue-game-status-update
         * Solo si los resultados son iguales
         */
        if(isOK) {
                          
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

        } else {
         console.log("Resultados no iguales... se envia al inicio de la cola de procesamiento")
         const nextqueueName = "queue-ticket-prevent-duplication"
         channel.assertQueue(nextqueueName, {
          durable: false
        });

         channel.sendToQueue(nextqueueName,
           Buffer.from(msg.content.toString()),{
             correlationId: msg.properties.correlationId,
             replyTo: msg.properties.replyTo});
        /**
          * Quita el mensaje de la cola de envio
          */
         channel.ack(msg);
        }        

        })               
                                        
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
