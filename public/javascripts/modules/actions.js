// const sqlite = require("./database");
import sqlite from "./database"
const { loadConfiguration } = require("./output");

const createDatabase = function () {
    const database = new sqlite3.Database('./tickets.db', (err) => {
        if (err) {
            console.error(err.message);
          }
          console.log('Connected to database.');
      });
            
    database.serialize(() => {
        database.run('CREATE TABLE tGameInstances(id integer PRIMARY KEY, date text, creator text)')
                .run('CREATE TABLE tGameInstanceItems(id integer PRIMARY KEY, chance text, quantity integer, maxQuantity integer)')
    });

    database.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

const insertGameInstance = async function (name, date, creator, max) {  
  await sqlite.open('./tickets.db')  
  let sql = 'INSERT INTO tGameInstances (name, date, creator, isOpen) VALUES("'+name+'","'+date+'","'+creator+'","Y")'  
  let result = await sqlite.run(sql)  
  
  sql = 'SELECT * FROM tGameInstances WHERE date = "'+date+'"'
  result = await sqlite.get(sql)
  let arrayQueries = []
  while (arrayQueries.length<100) {
    let chance = (arrayQueries.length < 10) ? '0' + arrayQueries.length.toString() : arrayQueries.length.toString()
    arrayQueries.push('INSERT INTO tGameInstanceItems (gameInstance_Id,quantity,chance,maxQuantity) VALUES('+result.id+',0,"'+chance+'",'+max+')')
  }
  await sqlite.runs(arrayQueries)
  await sqlite.close()   
  return result
}

const insertGameInstanceItem = async function (chance, quantity) {        
  await sqlite.open('./tickets.db')  
   sql ='UPDATE tGameInstanceItems SET quantity = quantity + '+quantity+' WHERE chance = '+chance  
  let result = await sqlite.run(sql)  
  await sqlite.close()   
  return result
}

const closeGameInstances = async function (id) {        
  await sqlite.open('./tickets.db')  
   sql ='UPDATE tGameInstances SET isOpen = "N" WHERE id = '+id  
  let result = await sqlite.run(sql)  
  await sqlite.close()   
  return result
}

const selectGameInstance = async function () {        
  await sqlite.open('./tickets.db')
  let sql = 'SELECT * FROM tGameInstances WHERE isOpen = "Y"'
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result 
}

const selectGameInstanceItems = async function (gameId, orderbyQty = false) {  
  await sqlite.open('./tickets.db')
  let sql = 'SELECT * FROM tGameInstanceItems WHERE gameInstance_id = '+gameId  
  sql = (orderbyQty) ? sql+' ORDER BY quantity DESC' : sql
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result
}

const selectLongItems = async function (gameId) {  
  await sqlite.open('./tickets.db')
  let sql = 'select number, sum(quantity) quantity from tTickets Head'+
  ' left join tTicketItems Body on Body.ticket_Id = Head.Id'+
  ' where gameInstance_id = '+gameId+
  ' and length(number) > 3'+
  ' group by number'  
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result
}

const selectShortItemsTotal = async function (gameId) {  
  await sqlite.open('./tickets.db')
   
  let sql = 'SELECT SUM(Body.quantity) cantidad, SUM(Body.total) plata  FROM tTicketItems Body'+
  ' LEFT JOIN tTickets Head on Head.Id = Body.ticket_Id'+
  ' LEFT JOIN tGameInstances Mind on Mind.Id = Head.gameInstance_id'+
  ' WHERE Mind.Id = '+gameId+
  ' AND length(NUMBER) < 3'  
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result[0]
}

const selectLongItemsTotal = async function (gameId) {  
  await sqlite.open('./tickets.db')
   
  let sql = 'SELECT SUM(Body.quantity) cantidad, SUM(Body.total) plata  FROM tTicketItems Body'+
  ' LEFT JOIN tTickets Head on Head.Id = Body.ticket_Id'+
  ' LEFT JOIN tGameInstances Mind on Mind.Id = Head.gameInstance_id'+
  ' WHERE Mind.Id = '+gameId+
  ' AND length(NUMBER) > 3'  
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result[0]
}

const selectGameInstanceItem = async function (chance) {  
  await sqlite.open('./tickets.db')
  let sql = 'SELECT * FROM tGameInstanceItems WHERE CHANCE = ?'  
  let result = await sqlite.get(sql,[chance])  
  await sqlite.close()   
  return result
}

const selectConfiguration = async function () {  
  await sqlite.open('./tickets.db')
  let sql = 'SELECT * FROM tConfig'  
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result
}

const selectTicket = async function (no) {  
  await sqlite.open('./tickets.db')
  let sql = 'SELECT * FROM tTicketItems items'
  +' left join tTickets ticket on ticket.Id = items.ticket_Id'
  +' where ticket_Id = '+no
  +' order by number ASC'
  let result = await sqlite.all(sql)  
  await sqlite.close()   
  return result
}

const selectTicketTotal = async function (no) {  
  await sqlite.open('./tickets.db')
  let sql = 'SELECT sum(total) total FROM tTicketItems'    
  +' where ticket_Id = '+no  
  let result = await sqlite.get(sql)  
  await sqlite.close()   
  return result.total
}

const updateConfigurationProperty = async function (array) {  
  await sqlite.open('./tickets.db')    
  let result = await sqlite.runs(array)  
  await sqlite.close()   
  return result
}

const saveTicket = async function () {
  let arrayQueries = []
  await sqlite.open('./tickets.db')
  let sql = "INSERT INTO tTickets (gameInstance_id, date, isWinner, creator) VALUES ("+globalChance.gameId+",'"+bag.date()+"','N','"+globalChance.person+"')"
  let result = await sqlite.run(sql)
  var ticketNo

  sql = "select max(id) id from tTickets where gameInstance_id ="+globalChance.gameId
  result = await sqlite.get(sql)  
  if (result) 
    ticketNo = result.id
  else
    ticketNo = 1
  bag.items.forEach(element => {
    arrayQueries.push("UPDATE tGameInstanceItems SET quantity = quantity + "+element.qty+" WHERE chance = '"+element.number+"' AND gameInstance_id ="+globalChance.gameId)
    arrayQueries.push("INSERT INTO tTicketItems (ticket_id, number, quantity, price, total, isWinner) VALUES ("+ticketNo+",'"+element.number+"',"+element.qty+","+element.price+","+element.total+",'N')")
  });
  
  let ticketResult = await sqlite.runs(arrayQueries)
  
  let configSql ="UPDATE tConfig SET value = '"+ticketNo+"' WHERE property = 'Ticket Number'"
  let configResult = await sqlite.run(configSql)
  await sqlite.close()
  // Limpiar Visual
  await clearChance()

  return configResult
}

module.exports = {createDatabase, insertGameInstance,  insertGameInstanceItem, selectGameInstance, selectGameInstanceItem, selectConfiguration, updateConfigurationProperty, selectGameInstanceItems, saveTicket, selectLongItems, closeGameInstances, selectShortItemsTotal, selectLongItemsTotal, selectTicket, selectTicketTotal}