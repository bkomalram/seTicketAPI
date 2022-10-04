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

      const queueName = "queue-winners-step1"
      
      channel.assertQueue(queueName, {
        durable: false
      });

      channel.prefetch(1);
      console.log(' [x] Esperando peticion de ganadores . . .');
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
        * Extracción de datos del sorteo para evaluar
        * Chance
        * Billete
        */

         DB.GameTicket.findAll({
            where:{         
                game_id: payload.sorteoId,                 
          }         
        })
        .then((AllTickets)=>{                                    
            /**
             * Atendiendo proceso de chances
             */

             AllTickets.forEach(element => {
                /**
                 * Buscando Chances asociados al ticket
                 */

                 DB.GameTicketRecord.findAll({
                    where:{                
                        tipo:"CHANCE",
                        gameTicketId:element.id
                    }           
                })
                .then((chances)=>{
                    /**Aplicar logica de calculo
                     * de ganadores chances
                     */
                    
                })
            });
        })
        .then((isOK)=>{        
        /**
         * Enviado a cola de verificacion queue-game-status-update
         * Solo si los resultados son iguales
         */

        /**
             * Enviar a Cola de procesamiento mixto
             *  */
            
         console.log("Enviando a proceso de chances ganadores")
         const nextqueueName = "queue-winners-chances"
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
