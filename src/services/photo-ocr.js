'use strict';
const https=require('https');
const rules=require('./limit-rules');
const lists=require('../../public/javascripts/photo-list');
function validate(image){
  if(typeof image!=='string'||image.length>8400000)rules.fail('La imagen es demasiado grande. Recórtala o elige otra foto.');
  const m=/^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
  if(!m)rules.fail('Usa una imagen JPG o PNG.');
  const bytes=Buffer.from(m[2],'base64');
  if(bytes.length>6*1024*1024 || bytes.length<8)rules.fail('El archivo de imagen no es válido.');
  const png=bytes.slice(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(m[1]==='png'?!png:!jpg)rules.fail('El contenido no corresponde a una imagen JPG o PNG.');
  return m[2];
}
function annotationLines(annotation){
  const lines=[];
  (annotation.pages||[]).forEach(page=>(page.blocks||[]).forEach(block=>(block.paragraphs||[]).forEach(p=>{
    let text='',confidence=1,hasConfidence=false;
    function flush(){if(text.trim())lines.push({text:text.trim(),confidence:hasConfidence?confidence:null});text='';confidence=1;hasConfidence=false;}
    (p.words||[]).forEach(word=>{
      if(typeof word.confidence==='number'){confidence=Math.min(confidence,word.confidence);hasConfidence=true;}
      (word.symbols||[]).forEach(symbol=>{
        text+=symbol.text||'';
        const br=symbol.property&&symbol.property.detectedBreak&&symbol.property.detectedBreak.type;
        if(br==='LINE_BREAK'||br==='EOL_SURE_SPACE')flush();else if(br==='SPACE'||br==='SURE_SPACE')text+=' ';
      });
      if(!/\s$/.test(text))text+=' ';
    });flush();
  })));
  if(!lines.length && annotation.text)annotation.text.split(/\r?\n/).forEach(text=>lines.push({text,confidence:null}));
  return lines;
}
function recognize(content,key){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({requests:[{image:{content},features:[{type:'DOCUMENT_TEXT_DETECTION'}]}]});
    const req=https.request({hostname:'vision.googleapis.com',path:'/v1/images:annotate',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'X-Goog-Api-Key':key}},res=>{
      let result='',size=0;
      res.on('data',chunk=>{size+=chunk.length;if(size>12*1024*1024){res.destroy();reject(Error('Respuesta demasiado grande.'));}else result+=chunk;});
      res.on('error',reject);
      res.on('end',()=>{try{
        const data=JSON.parse(result),response=data.responses&&data.responses[0];
        if(res.statusCode!==200 || !response || response.error)reject(Error('El servicio de lectura no pudo procesar la imagen.'));
        else resolve(response.fullTextAnnotation||{});
      }catch(e){reject(Error('Respuesta de lectura no válida.'));}});
    });
    req.setTimeout(45000,()=>req.destroy(Error('El servicio de lectura tardó demasiado. Intenta de nuevo.')));
    req.on('error',()=>reject(Error('No se pudo conectar con el servicio de lectura.')));
    req.end(body);
  });
}
async function extract(image,type){
  if(!['CHANCE','BILLETE'].includes(type))rules.fail('Selecciona chances o billetes.');
  const content=validate(image);
  if(!process.env.GOOGLE_VISION_API_KEY)rules.fail('La lectura de fotos está pendiente de activación. Configura Google Cloud Vision en el servidor.',503);
  try{return lists.parse(annotationLines(await recognize(content,process.env.GOOGLE_VISION_API_KEY)),type);}
  catch(e){rules.fail(e.message,502);}
}
module.exports={extract,validate,annotationLines};
