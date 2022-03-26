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

      const queueName = "queue-game-status"
      
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

        DB.User.findAll({
            where:{         
                esActivo: "SI"
            }
        })
        .then((users)=>{
            /**
             * users es un arreglo se recorre
             *  */
            users.forEach(registro => {
                /**
                 * Preparacion de numeros
                 * para el estado del usuario
                 */
                let developmentGameStates = []
                for (let index = 0; index < 100; index++) {
                    let chance = index.toString()
                    const element = {
                    game_id: msg.content,
                    usuario_id: registro.id,
                    chance: chance.padStart(2,'0'),
                    cantidad: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                    };
                    developmentGameStates.push(element)
                }
                /**
                 * Preveción de sobreescritura
                 * Prevención de recrear
                 */
                var alreadyStates
                DB.GameState.findAndCountAll({
                    where:{         
                        game_id: msg.content,
                        usuario_id:registro.id
                    }                   
                })
                .then(result => {  
                    if (result.count > 0) {
                        alreadyStates = true
                    } else {
                        alreadyStates = false
                    }                  
                })

                if (alreadyStates) {
                    console.log(console.log("[-] Usuario "+registro.id+" ya cuenta con registros de estado. Continuando..."));                                            
                } else {
                    /**
                     * Ejecución a la base de datos
                     */
                    DB.GameState.bulkCreate(developmentGameStates)
                    .then((state)=>{
                    console.log("[-] Usuario "+registro.id+" completo.")
                    })
                }
                
            });

        /**
         * Regresa el mensaje de completo
         */
        channel.sendToQueue(msg.properties.replyTo,
            Buffer.from("Satisfactorio"), {
            correlationId: msg.properties.correlationId
            });

        })
        /**
         * Quita el mensaje de la cola de envio
         */
        channel.ack(msg);
                                        
    } catch (error) {
        /**
         * Regresa el mensaje de fallido
         */
        channel.sendToQueue(msg.properties.replyTo,
            Buffer.from("Error"), {
            correlationId: msg.properties.correlationId
            });
    }        

    },{noAck: false});

    });
  });