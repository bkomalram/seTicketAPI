const express = require("express")
const router = express.Router()

const con = require("../modules/database")

router.get("/", (req,res)=>{
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query("SELECT * FROM tConfiguration",function (err,rows,fields) {
        if (!err) {
            res.json(rows)
        } else {
            console.log(err)
        }
    })
})

router.get("/:id", (req,res)=>{
    const { id } = req.params
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    con.query("SELECT * FROM tConfiguration where id = ?",[id],function (err,rows,fields) {
        if (!err) {
            res.json(rows[0])
        } else {
            console.log(err)
        }
    })
})

module.exports = router;