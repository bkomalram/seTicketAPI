const express = require('express');
const router = express.Router();
const DB = require('../models');
//const auth = require('../middleware/auth');

// Obtener configuración de sacados
router.get('/configuracion', async (req, res) => {
    try {
        const [sacadoBillete, sacadoChance] = await Promise.all([
            DB.Config.findOne({ where: { propiedad: 'sacado-billetes' } }),
            DB.Config.findOne({ where: { propiedad: 'sacado-chance' } })
        ]);

        res.json({
            exitoso: true,
            resultado: {
                sacadoBillete: sacadoBillete ? parseFloat(sacadoBillete.valor) : 0,
                sacadoChance: sacadoChance ? parseFloat(sacadoChance.valor) : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            exitoso: false,
            error: error.message
        });
    }
});

// Actualizar configuración de sacados
router.post('/configuracion', async (req, res) => {
    const { sacadoBillete, sacadoChance } = req.body;

    try {
        await Promise.all([
            DB.Config.update({            
                valor: sacadoBillete.toString()
            },{ 
                where: { propiedad:"sacado-billetes" }
            }),
            DB.Config.update({            
                valor: sacadoChance.toString()
            },{ 
                where: { propiedad:"sacado-chance" }
            })
        ]);

        res.json({
            exitoso: true,
            mensaje: 'Configuración actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            exitoso: false,
            error: error.message
        });
    }
});

module.exports = router;