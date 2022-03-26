const express = require("express")
const router = express.Router()
const DB = require ("../models/index")

/*Configuracion*/

router.get("/", (req,res)=>{
    
    const accion = `
    SELECT * FROM tConfiguracion
    `
    if (req.jornada.accesos == 0) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }
    try {              
        DB.Config.findAll()
        .then((configuration)=>{            
            res.status(200).json({resultado:configuration,exitoso:true})       
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    }    
})

router.post("/", (req,res)=>{
    const { nombre, precioChance, precioBillete, impresion, sorteoId } = req.body    

    if (req.jornada.accesos < 2) {
        res.json({
            resultado: "Privilegios insuficientes",
            exitoso:false
        })
        return
    }    

    try {  
                    
        if (nombre) {     
            DB.Config.update({            
                valor: nombre
            },{ 
                where: { propiedad:"nombre" }
            })                         
        }        
        if (precioChance) {                       
            DB.Config.update({            
                valor: precioChance
            },{ 
                where: { propiedad:"precioChance" }
            })
        }
        if (precioBillete) {            
            DB.Config.update({            
                valor: precioBillete
            },{ 
                where: { propiedad:"precioBillete" }
            })
        }
        if (impresion) {            
            DB.Config.update({            
                valor: impresion
            },{ 
                where: { propiedad:"impresion" }
            })
        }
        if (sorteoId) {            
            DB.Config.update({            
                valor: sorteoId
            },{ 
                where: { propiedad:"sorteoId" }
            })
        }
        res.status(200).json({resultado:"Configuración actualizada",exitoso:true})

    } catch (error) {
        console.log(error)
        res.status(400).json({resultado:error,exitoso:false}) 
    }

})

module.exports = router