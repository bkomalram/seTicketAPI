const mysql = require("mysql")


const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"password",
    database:"loteriadb"
})

con.connect(function (err) {
    if (err) {
        console.log(err)
        return
    } else {
        console.log("Loreria Online")
    }
})

module.exports = con;