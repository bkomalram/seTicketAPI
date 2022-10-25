/*var excel = require('excel4node')
var workBook = new excel.Workbook()

const exportarSorteo = function (params) {
    workSheet = workBook.addWorksheet('Sorteo')
    workSheet.cell(1,1).string('Hola Esto es una exportacion')    
    workBook.write('Sorteo.xlsx')   
}*/
var fs = require('fs');

const exportarSorteo = async function () {
var path = ''
var writeStream = fs.createWriteStream(path+"Sorteo.xls")
document.querySelector("#btnExportar").setAttribute('disabled','true')
let response = await selectGameInstanceItems(document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name'))
var header="CHANCE"+"\t"+"CANTIDAD"+"\n"
writeStream.write(header)
response.forEach(element => {
    let row = element.chance+"\t"+element.quantity+"\n";
    writeStream.write(row)
});

writeStream.close(); 
document.querySelector("#btnExportar").removeAttribute('disabled')
}

const imprimirSorteo = async function () {
    let output = document.getElementById("outPut1")
    let header = [
      '<p name="outputTitle" id="outTitle" class="text-center mb-0">'+globalChance.person+'</p>',
      '<p name="outputId" id="outId" class="text-center">'+bag.id()+'</p>',
        '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
          '<div class="col-3 offset-3 px-0 text-center">CF</div>',
          '<div class="col-3 px-0 text-center">CANT.</div>',          
        '</div>'].join('')
    let respuesta = await selectShortItemsTotal(document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name'))
    let total = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+respuesta.cantidad+'</p>',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+(Math.round(respuesta.plata * 100) / 100).toFixed(2)+'</p>',
      '</div>'
    ].join('')
  
    let fecha = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12 mb-1 mt-1">'+bag.date()+'</p>',
      '</div>'
    ].join('')
  
    var body =[    
    ]  

    let response = await selectGameInstanceItems(document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name'),true)
    
    response.forEach(element => {
      let dyn = [
      '<div class="row mx-0">',
        '<div class="col-3 offset-3 px-0 text-center">*'+element.chance+'*</div>',
        '<div class="col-3 px-0 text-center">'+element.quantity+'</div>',        
      '</div>'
      ]
      body = body.concat(dyn)        
    })
    
    body = body.join('')
  
    output.innerHTML = header + body + total + fecha
    window.print()

    /*Imprimir todos los Billetes*/

    respuesta = await selectLongItemsTotal(document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name'))
    total = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+respuesta.cantidad+'</p>',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+(Math.round(respuesta.plata * 100) / 100).toFixed(2)+'</p>',
      '</div>'
    ].join('')

    response = await selectLongItems(document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name'))
    body = [    
    ] 
    response.forEach(element => {
      let dyn = [
      '<div class="row mx-0">',
        '<div class="col-3 offset-3 px-0 text-center">*'+element.number+'*</div>',
        '<div class="col-3 px-0 text-center">'+element.quantity+'</div>',        
      '</div>'
      ]
      body = body.concat(dyn)        
    })

    body = body.join('')

    output.innerHTML = header + body + total + fecha
    window.print()
  }

module.exports = { exportarSorteo, imprimirSorteo}