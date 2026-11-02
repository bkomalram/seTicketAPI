'use strict';
const router=require('express').Router();
const limits=require('../services/sale-limits');
const ocr=require('../services/photo-ocr');
const pending=new Set();
const lastCall=new Map();
router.get('/estado',(req,res)=>{
  if(!req.jornada || !Number(req.jornada.id)||!Number(req.jornada.accesos))return res.status(403).json({exitoso:false,resultado:'Acceso denegado.'});
  res.json({exitoso:true,resultado:{disponible:!!process.env.GOOGLE_VISION_API_KEY}});
});
// Parse larger bodies only on this authenticated, image-specific route.
router.post('/',require('express').json({limit:'9mb'}),async(req,res)=>{
  const id=req.jornada&&req.jornada.id;
  try{
    const {game}=await limits.access(req.jornada,req.body.sorteoId,req.body.userId||id);
    if(game.esActivo!=='SI'||game.enVenta!=='SI')return res.status(409).json({exitoso:false,resultado:'Selecciona un sorteo abierto con la venta activa.'});
    const now=Date.now();
    if(pending.has(id)||now-(lastCall.get(id)||0)<5000)return res.status(429).json({exitoso:false,resultado:'Espera unos segundos antes de analizar otra foto.'});
    // Bound this in-memory throttle without keeping image data.
    if(lastCall.size>1000)lastCall.clear();
    pending.add(id);lastCall.set(id,now);
    try{res.json({exitoso:true,resultado:await ocr.extract(req.body.imagen,req.body.tipo)});}
    finally{pending.delete(id);}
  }catch(e){res.status(e.status||500).json({exitoso:false,resultado:e.status?e.message:'No se pudo leer la imagen. Intenta nuevamente.'});}
});
router.use((error,req,res,next)=>{
  res.status(error.type==='entity.too.large'?413:400).json({exitoso:false,resultado:'No se pudo cargar la foto. Usa una imagen más pequeña.'});
});
module.exports=router;
