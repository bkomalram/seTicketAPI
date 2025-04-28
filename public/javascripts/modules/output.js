var qrURL = "<%= enviroment.URL_QR %>";
const chanceOutput = function () {
    let output = document.getElementById("ticketOutput")
    let header = [
      '<div class="row mx-0 print-style">',
        '<img src="/images/vaca.png" class="col-3 mt-4 w-50 h-50">',
        '<div class="col-6 p-0">',
         '<div class="row mx-0 mt-2 print-style text-center">',
            '<p name="outputTitle" id="outTitle" class="col-12 p-0">'+globalChance.person+'</p>',
            '<p name="outputId" id="outId" class="col-12 ">'+bag.id()+'</p>', 
            '<p name="seller" id="seller" class="d-none col-12 p-0 m-0 text-sm" style="font-size: smaller;">'+bag.seller+'</p>',
            '<p name="customer-name" id="display-customer-name" class="col-12 p-0 m-0 text-sm" style="font-size: smaller;">'+bag.customerName+'</p>',
          '</div>',
        '</div>',
        '<img src="/images/buena-suerte.png" class="col-3 mt-4 w-50 h-50">',
      '</div>',     
        '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
          '<div class="col-3 px-0 text-center">CF</div>',
          '<div class="col-3 px-0 text-center">CANT.</div>',
          '<div class="col-3 px-0 text-center">P.U</div>',
          '<div class="col-3 px-0 text-center">TOTAL</div>',
        '</div>'].join('')
  
    let total = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+bag.total+'</p>',
      '</div>',
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="chanceCount" id="chanceCount" class="text-center col-12"> CANT. CHANCE: '+bag.chanceCount+'</p>',
      '</div>',
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="billeteCount" id="billeteCount" class="text-center col-12"> CANT. BILLETE: '+bag.billeteCount+'</p>',
      '</div>'
    ].join('')
  
    let fecha = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12 mb-1 mt-1">'+bag.date()+'</p>',
      '</div>'
    ].join('')
  
    let footer = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<h1 name="outputId" id="outId" class="text-center col-12"> No: '+bag.receipt()+'</h1>',
        '<canvas id="canvas"></canvas>',
      '</div>',      
    ].join('')
    var body =[    
    ]  
    let inOrder = bag.itemsInOrder()
    inOrder.forEach(element => {
      let dyn = [
      '<div class="row mx-0">',
        '<div class="col-3 px-0 text-center">*'+element.number+'*</div>',
        '<div class="col-3 px-0 text-center">'+element.qty+'</div>',
        '<div class="col-3 px-0 text-center">'+(Math.round(element.price * 100) / 100).toFixed(2)+'</div>',
        '<div class="col-3 px-0 text-center">'+(Math.round(element.total * 100) / 100).toFixed(2)+'</div>',
      '</div>'
      ]
      body = body.concat(dyn)        
    });
    
    //UX - Mobile
    let mobileBuilder = [
      '<div class="d-sm-none row mx-0" name="mobile-input-ux">',
        '<div class="col-3 px-0 text-center"><input type="number" class="form-control" autocomplete="off" name="mobile-filler-number" onkeydown="mobileNumber(event)"></input></div>',
        '<div class="col-3 px-0 text-center"><input type="number" class="form-control" autocomplete="off" name="mobile-filler-qty" onkeydown="mobileQty(event)"></input></div>',
        '<div class="col-3 px-0 text-center">--.--</div>',
        '<div class="col-3 px-0 text-center">--.--</div>',
      '</div>'
      ]

    body = body.concat(mobileBuilder)

    body = body.join('')
  
    output.innerHTML = header + body + total + fecha + footer
    generarQR(qrURL+"cambiar?id="+globalChance.receiptCount)    
  }

  const printOldTicket = function (arrayItems, montoTotal) {
    let output = document.getElementById("ticketOutput")
    let header = [
      '<img src="/images/vaca.png" alt="Smiley face" style="width: 50px;position: absolute;margin-left: 10px;margin-top: 5px;">',
      '<p name="outputTitle" id="outTitle" class="text-center mb-0">'+globalChance.person+'</p>',
      '<p name="outputId" id="outId" class="text-center">'+bag.id()+'</p>',
        '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
          '<div class="col-3 px-0 text-center">CF</div>',
          '<div class="col-3 px-0 text-center">CANT.</div>',
          '<div class="col-3 px-0 text-center">P.U</div>',
          '<div class="col-3 px-0 text-center">TOTAL</div>',
        '</div>'].join('')
  
    let total = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+(Math.round(montoTotal * 100) / 100).toFixed(2)+'</p>',
      '</div>',
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="chanceCount" id="chanceCount" class="text-center col-12"> CANT. CHANCE: '+bag.chanceCount+'</p>',
      '</div>',
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="billeteCount" id="billeteCount" class="text-center col-12"> CANT. BILLETE: '+bag.billeteCount+'</p>',
      '</div>'
    ].join('')
  
    let dbFecha = new Date(arrayItems[0].FECHA)
    let sysFecha = dbFecha.toLocaleString('en-US', { hour12: true })
    let fecha = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<p name="outputId" id="outId" class="text-center col-12 mb-1 mt-1">'+sysFecha+'</p>',
      '</div>'
    ].join('')
  
    let footer = [
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<h1 name="outputId" id="outId" class="text-center col-12"> No: '+arrayItems[0].ID.toString().padStart(6,'0')+'</h1>',
      '</div>',
      '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
        '<canvas id="canvas" class="mt-2"></canvas>',
      '</div>', 
    ].join('')
    var body =[    
    ]  
    
    arrayItems.forEach(element => {    
      totalRegistro = element.CANTIDAD * element.PRECIO
      let dyn = [
      '<div class="row mx-0">',
        '<div class="col-3 px-0 text-center">*'+element.NUMERO+'*</div>',
        '<div class="col-3 px-0 text-center">'+element.CANTIDAD+'</div>',
        '<div class="col-3 px-0 text-center">'+(Math.round(element.PRECIO * 100) / 100).toFixed(2)+'</div>',
        '<div class="col-3 px-0 text-center">'+(Math.round(totalRegistro * 100) / 100).toFixed(2)+'</div>',
      '</div>'
      ]
      body = body.concat(dyn)        
    });
    
    body = body.join('')
  
    output.innerHTML = header + body + total + fecha + footer    
    document.querySelector('#outPut1').innerHTML = document.querySelector('#ticketOutput').innerHTML                

    generarQR(qrURL+"cambiar?id="+arrayItems[0].ID)
    window.print()
    clearChance()
  }

const loadOldTicket = async function (num) {
  let requestRegistros = await fetch("http://"+globalChance.host+":3000/sorteo/tiquete/"+num)
  let array = await requestRegistros.json()
  let requestRegistrosTotal = await fetch("http://"+globalChance.host+":3000/sorteo/tiquete/total/"+num)
  let total = await requestRegistrosTotal.json()
  printOldTicket(array.resultado,total.resultado.TOTAL)
}

const showConfiguracion = function () {
    document.querySelector("#venta").classList.add('d-none')    
    document.querySelector("#configuracion").classList.remove('d-none')    
}

const showChance = function () {
    document.querySelector("#configuracion").classList.add('d-none')    
    document.querySelector("#venta").classList.remove('d-none')    
}
const loadConfiguration = async function () {}
/*const loadConfiguration = async function () {
    await fillGameInstances()
    let request = await fetch("http://"+globalChance.host+":3000/sorteo/configuracion")
    let data = await request.json()
    
    data.resultado.forEach(element => {        
        switch (element.PROPIEDAD) {
            case "NOMBRE":
                document.querySelector("#user").value = element.VALOR
                globalChance.person = element.VALOR
                break;
            case "PRECIO_CHANCE":
                document.querySelector("#priceChance").value = element.VALOR
                globalChance.price = element.VALOR                
                break;
            case 'Chance maxQuantity':
                document.querySelector("#chanceMaxQuantity").value = element.VALOR
                break;            
            case "SORTEO_VENTA":
                document.querySelector("#gameInstanceName").value = element.VALOR
                globalChance.gameId = document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')
                break;
            case "PRECIO_BILLETE":
                document.querySelector("#priceBillete").value = element.VALOR
                globalChance.bprice = element.VALOR
                break;
            case "IMPRESION_TAMANO":
                document.querySelector("#printDimention").value = element.VALOR
                if (element.VALOR == "80mm*200mm") {
                  document.querySelector("#outDimention").classList.add('output80')
                  document.querySelector("#outDimention").classList.remove('output58') 
                } else {
                  document.querySelector("#outDimention").classList.remove('output80')
                  document.querySelector("#outDimention").classList.add('output58')
                }
                break;
            case 'Ticket Number':
                globalChance.receiptCount = element.VALOR.toString().padStart(10,'0')
                break;                
            default:
                break;
          }    
    })
    await fillTotals()
    await fillGameInstanceItems()
    chanceOutput()
}*/

/*const setConfiguration = async function () {    
  var arrayQueries = []  
  var objectoConfiguracion = {
    nombre:"",
    precioChance: "", 
    precioBillete:"", 
    impresion:"",
    sorteoId:null
  }
  document.querySelectorAll("#datosGlobales input, #datosGlobales select").forEach( async element => {                  
        switch (element.id) {
            case 'user':
                objectoConfiguracion.nombre = element.value                
                break;
            case 'priceChance':
                objectoConfiguracion.precioChance = element.value
                break;                     
            case 'gameInstanceName':                                
                objectoConfiguracion.sorteoId = element.value
                break;
            case 'priceBillete':
               objectoConfiguracion.precioBillete = element.value
                break;
            case 'printDimention':                                
                objectoConfiguracion.impresion = element.value
                break;
            default:
                break;
        }
    })    

    
    document.querySelector("#saveConfiguration").setAttribute('disabled','true')
    let requestUpdateConfiguration = await fetch("http://"+globalChance.host+":3000/sorteo/configuracion",{
      method: 'POST',            
    headers: {
      'Content-Type': 'application/json'      
    },        
    body: JSON.stringify(objectoConfiguracion)
    })

    let response = await requestUpdateConfiguration.json()
    if (response.termino) {
      document.querySelector("#saveConfiguration").removeAttribute('disabled')
      loadConfiguration()
    }
}*/

 
const fillTotals = async function () {

  let requestChanceTotal = await fetch("http://"+globalChance.host+":3000/sorteo/chances/total/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)
  let responseChance = await requestChanceTotal.json()
  let requestBilleteTotal = await fetch("http://"+globalChance.host+":3000/sorteo/billetes/total/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)
  let responseBillete = await requestBilleteTotal.json()

  document.querySelector('#chanceCantidad').innerHTML = responseChance.resultado.CANTIDAD || 0
  document.querySelector('#chancePlata').innerHTML = (Math.round(responseChance.resultado.PLATA * 100) / 100).toFixed(2)

  document.querySelector('#billeteCantidad').innerHTML = responseBillete.resultado.CANTIDAD || 0
  document.querySelector('#billetePlata').innerHTML = (Math.round(responseBillete.resultado.PLATA * 100) / 100).toFixed(2)
}

const fillGameInstances = async function () {
  let request = await fetch("http://"+globalChance.host+":3000/sorteo/activos")
  let response = await request.json()
  let select = document.querySelector('#gameInstanceName')
  while (select.length>0) {
    select.remove(select.length-1)
  }
  response.resultado.forEach(element => {
    let option = document.createElement('option')
    option.text = element.NOMBRE
    option.value = element.ID
    option.setAttribute('name',element.ID)
    select.add(option)
  })
}

const fillGameInstanceItems = async function () {
  let requestChances = await fetch("http://"+globalChance.host+":3000/sorteo/chances/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId+"/0")
  let response = await requestChances.json()
  let builder = document.querySelector("div[id=estado]") 
  builder.innerHTML = ''
  document.querySelector('#estadoTitulo').innerHTML ='<h5>'+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].text+'</h5>'
  let html =''
  response.resultado.forEach(element => {    
    html +=
    '<div class="d-flex"><b class="mr-3">'+ element.CHANCE +'</b>'+'<p class="mb-0">'+element.CANTIDAD+'</p></div>' 
    if ([24,49,74,99].indexOf(Number(element.CHANCE ))>-1) {
      builder.innerHTML += '<div class="col-3 py-1">'+html+'</div>'    
      html =''  
    }
  })
  let requestBilletes = await fetch("http://"+globalChance.host+":3000/sorteo/billetes/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)
  response = await requestBilletes.json()
  
  builder = document.querySelector("div[id=estadoBillete]")   
  builder.innerHTML = ''
  html = ''
  var count = 0
  var base = (response.resultado.length<20) ? response.resultado.length/4 : 20
  response.resultado.forEach(element => {    
    html +=    
    '<div class="d-flex"><b class="mr-3">'+ element.NUMERO +'</b>'+'<p class="mb-0">'+element.CANTIDAD+'</p></div>'     
    count +=1    
    if (count%base == 0) {
      builder.innerHTML += '<div class="col-3 py-1">'+html+'</div>'    
      html =''  
    }
  })  
}

const clearChance = async function () {
  bag.clear()
  bag.calc()
  globalChance.receiptCount = 0
  document.querySelector('#search').value = ''
  document.querySelector('#iBillete').value = ''
  document.querySelector('#iBilleteQty').value = ''  
  document.querySelectorAll("#chanceBuilder input").forEach(element => {
    element.value = ''
  })
  await loadConfiguration() 
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

  let requestChanceTotal = await fetch("http://"+globalChance.host+":3000/sorteo/chances/total/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)  
  let respuesta = await requestChanceTotal.json()
  let total = [
    '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
      '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+respuesta.resultado.CANTIDAD+'</p>',
      '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+(Math.round(respuesta.resultado.PLATA * 100) / 100).toFixed(2)+'</p>',
    '</div>'
  ].join('')

  let fecha = [
    '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
      '<p name="outputId" id="outId" class="text-center col-12 mb-1 mt-1">'+bag.date()+'</p>',
    '</div>'
  ].join('')

  var body =[    
  ]  

  let requestChances = await fetch("http://"+globalChance.host+":3000/sorteo/chances/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId+"/1")
  let response = await requestChances.json()  
  
  response.resultado.forEach(element => {
    let dyn = [
    '<div class="row mx-0">',
      '<div class="col-3 offset-3 px-0 text-center">*'+element.CHANCE+'*</div>',
      '<div class="col-3 px-0 text-center">'+element.CANTIDAD+'</div>',        
    '</div>'
    ]
    body = body.concat(dyn)        
  })
  
  body = body.join('')

  output.innerHTML = header + body + total + fecha
  window.print()

  /*Imprimir todos los Billetes*/
  let requestBilleteTotal = await fetch("http://"+globalChance.host+":3000/sorteo/billetes/total/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)  
  respuesta = await requestBilleteTotal.json()
  total = [
    '<div class="row mx-0 border print-style border-left-0 border-right-0 border-bottom-0">',
      '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+respuesta.resultado.CANTIDAD+'</p>',
      '<p name="outputId" id="outId" class="text-center col-12"> TOTAL: '+(Math.round(respuesta.resultado.PLATA * 100) / 100).toFixed(2)+'</p>',
    '</div>'
  ].join('')

  let requestBilletes = await fetch("http://"+globalChance.host+":3000/sorteo/billetes/"+document.querySelectorAll('#gameInstanceName option')[document.querySelector('#gameInstanceName').selectedIndex].getAttribute('name')+"/"+globalChance.userId)
  response = await requestBilletes.json()

  body = [    
  ] 
  response.resultado.forEach(element => {
    let dyn = [
    '<div class="row mx-0">',
      '<div class="col-3 offset-3 px-0 text-center">*'+element.NUMERO+'*</div>',
      '<div class="col-3 px-0 text-center">'+element.CANTIDAD+'</div>',        
    '</div>'
    ]
    body = body.concat(dyn)        
  })

  body = body.join('')

  output.innerHTML = header + body + total + fecha
  window.print()
}

const generarQR = function (valor = "Tiquete en creación") {

  const opciones = {
    width: "200",
    height: "200"
  };

  QRCode.toCanvas(document.querySelector("#ticketOutput canvas"), valor, opciones,function (error) {
    if (error) console.error(error)    
  })

  if(document.querySelector("#outPut1 canvas"))
    document.querySelectorAll('#outPut1 canvas').forEach(function(elemento){
      QRCode.toCanvas(elemento, valor, opciones,function (error) {
        if (error) console.error(error)        
      })
    })    
}

// module.exports = {chanceOutput,showConfiguracion,showChance,loadConfiguration, setConfiguration, fillGameInstances, clearChance, loadOldTicket, printOldTicket}