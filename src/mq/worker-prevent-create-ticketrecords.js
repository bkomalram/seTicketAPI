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

      const queueName = "queue-ticket-prevent-duplication"
      
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
         * Preveción de sobreescritura
         * Prevención de recrear
         */         
         DB.GameTicketRecord.findAndCountAll({
             where:{         
                gameTicketId: payload.headerTicket.id,                 
             }                   
         })         
         .then(result => {          
            if (result.count > 0) {
              /**
               * Debes borrar los registros y registrarlos
               */
              console.log("[-] Ticket "+payload.headerTicket.id+" ya cuenta con registros.Procede el refresh de estos");
              DB.GameTicketRecord.destroy({
                  where:{         
                    gameTicketId: payload.headerTicket.id,                 
                  }                   
              })
              .then((Deleted)=>{
                  console.log("[+] Ticket "+payload.headerTicket.id+" enviando a sincronizar registros . . .")
              /**
               * Ejecución envio a cola queue-ticket-records
               */
               const nextqueueName = "queue-ticket-records"
               channel.assertQueue(nextqueueName, {
                durable: false
              });
      
               console.log("[-] Enviado "+payload.headerTicket.id+" a cola de registro queue-ticket-records.")
               channel.sendToQueue(nextqueueName,
                 Buffer.from(msg.content.toString()),{
                   correlationId: msg.properties.correlationId,
                   replyTo: msg.properties.replyTo});  
                /**
                 * Quita el mensaje de la cola de envio
                 */
                channel.ack(msg);            
              })
            } else {
                const nextqueueName = "queue-ticket-records"
                channel.assertQueue(nextqueueName, {
                  durable: false
                });
        
                console.log("[-] Enviado "+payload.headerTicket.id+" a cola de registro queue-ticket-records.")
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