/*Global Data*/
var globalChance = {
  person: localStorage.getItem("title-ticket") || "NO _ VALIDO",
  id:"1234567899874566123",
  gameId:0,
  receiptCount:"0",
  price: 0.25,
  bprice: 1.00,
  userId: 500,
  userProfile: "",
  userName: "",
  host:""
}

var bag = {
  person:globalChance.person,
  userId: globalChance.userId,
  seller: "",
  customerName:"",
  sacado:0,
  id: ()=> {return localStorage.getItem("choose-game") ? localStorage.getItem("choose-game").padStart(6,'0').padStart(7,'1') : "NO _ VALIDO"},
  items:[],
  total:0,
  date:function () {
    let date = new Date()
    //return date.toLocaleString('en-US', { hour12: true })
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  },
  receipt: () => {return (Number(globalChance.receiptCount)).toString().padStart(6,'0') },
  add: function (item) {
    this.items.push(item)
    this.calc()
    this.render()
  },
  update: function (index,item) {    
    if (item.qty == 0)
      this.items.splice(index,1)
    else {
      this.items[index].qty = item.qty
      this.items[index].price = item.price
      this.items[index].total = item.total 
    }    
    this.calc()
    this.render()   
  },
  push: function (index,item) {    
    this.items[index].qty = this.items[index].qty + item.qty
    this.items[index].price = item.price
    this.items[index].total = this.items[index].total + item.total   
    this.calc()
    this.render()   
  },
  render: chanceOutput,
  calc: function () {
    let sum=0
    this.items.forEach(element => {
      sum += element.total
    })    
    this.total = (Math.round(sum * 100) / 100).toFixed(2)
    this.chanceCount = this.items.filter(item => item.number.length == 2).reduce((sum, item) => sum + item.qty, 0)
    this.billeteCount = this.items.filter(item => item.number.length > 2).reduce((sum, item) => sum + item.qty, 0)
  },
  clear: function () {
    this.items = []    
  },
  itemsInOrder: function() {
    let rows = (this.items.length > 0) ? this.items.sort(function compare( a, b ) {
      if ( Number(a.number) < Number(b.number) ){
        return -1;
      }
      if ( Number(a.number) > Number(b.number) ){
        return 1;
      }
      return 0;
    }) : []
    return rows
  },
  type: function(){
    var isBillete = false
    this.items.forEach(function (element) {      
      isBillete = element.number.length > 2 ? true : false
    })  
    if (isBillete) {
      return "BILLETE"
    } else {
      return "CHANCE"
    }
  },
  chanceCount: 0,
  billeteCount: 0
}

/*Utility*/
const chanceBuilder = function(){    
  document.querySelectorAll("#chanceBuilder input").forEach(element => {
    element.addEventListener("keydown", function ({key}) {      
      if (key==="Enter") {        
        let newItem = {
          number:"",
          qty:0,
          price:0,
          total:0
        }
        newItem.number = this.name
        newItem.qty = Number(this.value)
        newItem.price = globalChance.price
        newItem.total = globalChance.price * this.value       
        let indexItem = bag.items.findIndex(object=>object.number === newItem.number)        
        if (indexItem>-1) {          
          bag.update(indexItem,newItem)
        } else {
          if (newItem.qty>0) {
            bag.add(newItem) 
          }                    
        }

        if (Number(this.name) < 9){
          let next = Number(this.name)+1
          document.querySelector('#i0'+next).focus()
        }          
        else {
            let next = Number(this.name)+1
            document.querySelector('#i'+next).focus()
        }        
      }

      if (key==="ArrowRight" && Number(this.name)<75) {
        let next = Number(this.name)+25
        document.querySelector('#i'+next).focus()
      }

      if (key==="ArrowLeft" && Number(this.name)>24) {
        let next = Number(this.name)-25 
        document.querySelector('#i'+next.toString().padStart(2,0)).focus()
      }

      if (key==="ArrowUp" && Number(this.name)>0) {
        let next = Number(this.name)-1
        document.querySelector('#i'+next.toString().padStart(2,0)).focus()
      }

      if (key==="ArrowDown" && Number(this.name)<99) {
        let next = Number(this.name)+1
        document.querySelector('#i'+next.toString().padStart(2,0)).focus()
      }     

    })

    element.addEventListener("blur", function () {              
        let newItem = {
          number:"",
          qty:0,
          price:0,
          total:0
        }
        newItem.number = this.name
        newItem.qty = Number(this.value)
        newItem.price = globalChance.price
        newItem.total = globalChance.price * this.value       
        let indexItem = bag.items.findIndex(object=>object.number === newItem.number)
        
        if (indexItem>-1) {
          bag.update(indexItem,newItem)
        } else {
          if (newItem.qty>0) {
            bag.add(newItem) 
          }                    
        }                      
    })
  });
}

/*Enter actions*/
const searchChance = function () {
  let number = document.querySelector("input[id=search]").value
  if (isNaN(number)) {
    if (number.toLowerCase()=='b') {
      document.querySelector("input[id=search]").value = ''
      document.querySelector("#iBillete").focus()
      return false
    }
  } else {
    let unit =   document.getElementById("i"+number)   
    if (unit) {    
      unit.focus() 
    }
  }    
}
const checkLongTicket = function () {
  let number = document.querySelector("input[id=iBillete]").value
  if (!isNaN(number) && number.length > 3) {    
    document.querySelector("input[id=iBilleteQty]").focus()
  }        
}
const checkSingleChance = function () {
  let number = document.querySelector("input[id=iSingleChance]").value
  if (!isNaN(number) && number.length == 2) {    
    document.querySelector("input[id=iSingleChanceQty]").focus()
  }        
}

document.querySelector("#search").addEventListener("keydown",function ({key}) {  
  if (key==="Enter") {    
    searchChance() 
  }
})

document.querySelector("#iBillete").addEventListener("keydown",function ({key}) {  
  if (key==="Enter") {    
    checkLongTicket() 
  } else if (document.querySelector("input[id=iBillete]").value.length >3 ){
     document.querySelector("input[id=iBillete]").value = document.querySelector("input[id=iBillete]").value.slice(0,3)
  }

  
})
document.querySelector("#iSingleChance").addEventListener("keydown",function ({key}) {  
  if (key==="Enter") {    
    checkSingleChance() 
  } else if (document.querySelector("input[id=iSingleChance]").value.length >1 ){
    document.querySelector("input[id=iSingleChance]").value = document.querySelector("input[id=iSingleChance]").value.slice(0,1)
  }
})

document.querySelector("#iBilleteQty").addEventListener("keydown",function ({key}) {  
  if (document.querySelector("input[id=iBillete]").value.length == 0 ) 
    return 

  if (key==="Enter") {
    let newItem = {
      number:"",
      qty:0,
      price:0,
      total:0
    }
    newItem.number = document.querySelector("#iBillete").value
    newItem.qty = Number(this.value)
    newItem.price = globalChance.bprice
    newItem.total = globalChance.bprice * this.value       
    let indexItem = bag.items.findIndex(object=>object.number === newItem.number)
    
    if (indexItem>-1) {
      if (newItem.qty==0) {
        bag.update(indexItem,newItem)
      } else {
        bag.push(indexItem,newItem)
      }
    } else {
      if (newItem.qty>0) {
        bag.add(newItem) 
      }                    
    }
    
    document.querySelector('#iBillete').value = ''
    document.querySelector('#iBilleteQty').value = ''
    document.querySelector('#iBillete').focus()
  }
})

document.querySelector("#iSingleChanceQty").addEventListener("keydown",function ({key}) {  

  if (key==="Enter") {
    let newItem = {
      number:"",
      qty:0,
      price:0,
      total:0
    }
    newItem.number = document.querySelector("#iSingleChance").value
    newItem.qty = Number(this.value)
    newItem.price = globalChance.price
    newItem.total = globalChance.price * this.value       
    let indexItem = bag.items.findIndex(object=>object.number === newItem.number)
    
    if (indexItem>-1) {
      if (newItem.qty==0) {
        bag.update(indexItem,newItem)
      } else {
        bag.push(indexItem,newItem)
      }
    } else {
      if (newItem.qty>0) {
        bag.add(newItem) 
      }                    
    }
    
    document.querySelector('#iSingleChance').value = ''
    document.querySelector('#iSingleChanceQty').value = ''
    document.querySelector('#iSingleChance').focus()
  }
})

document.querySelector("#goChance").addEventListener("click",function (event) {
  showChance()
})

document.querySelector("#btn-winner-game").addEventListener("click",function (event) {  
  window.location = '/generar'  
})

document.querySelector("#btn-bill-game").addEventListener("click",function (event) {  
  window.location = '/cuentas'
})

/**Mobile Functions */
//Add
function addTicketItem() {
  //Validate Fields
  let number = document.querySelector('[name="mobile-filler-number"]').value
  if (isNaN(number) || ![2,4].includes(number.length)) {    
    document.querySelector('[name="mobile-filler-number"]').focus()
    return false
  } 
  let qty = document.querySelector('[name="mobile-filler-qty"]').value
  if (isNaN(qty) || !qty) {    
    document.querySelector('[name="mobile-filler-qty"]').focus()
    return false
  }

  //Add

  let newItem = {
    number:"",
    qty:0,
    price:0,
    total:0
  }
  newItem.number = number
  newItem.qty = Number(qty)
  newItem.price = number.length == 2 ? globalChance.price : globalChance.bprice
  newItem.total = newItem.price * qty      
  let indexItem = bag.items.findIndex(object=>object.number === newItem.number)
  
  if (indexItem>-1) {
    if (newItem.qty==0) {
      bag.update(indexItem,newItem)
    } else {
      bag.push(indexItem,newItem)
    }
  } else {
    if (newItem.qty>0) {
      bag.add(newItem) 
    }                    
  }
  
  document.querySelector('[name="mobile-filler-number"]').value = ''
  document.querySelector('[name="mobile-filler-qty"]').value = ''
  document.querySelector('[name="mobile-filler-number"]').focus()

}

function limpiarTicket() {
  bag.clear()
  bag.calc();
  bag.render()
}

//UX - Enter

function mobileNumber(event) {
  if (event.key === 'Enter') {
    const inputValue = event.target.value.trim();
    if (inputValue.length === 2 || inputValue.length === 4 ) {
      const nextInput = document.querySelector('[name="mobile-filler-qty"]');
      if (nextInput) {
        nextInput.focus();
      }
    }
  }
}

function mobileQty(event) {
  if (event.key === 'Enter') {
    addTicketItem()
  }
}

//UX - Navigation

function home2sell() {
  document.querySelector("#mobile-home").classList.remove("d-block")
  document.querySelector("#mobile-home").classList.add("d-none")
  document.querySelector("#mobile-sell").classList.remove("d-none")
  document.querySelector("#mobile-sell").classList.add("d-block")
  document.querySelector("#mobile-btn-kit-1").classList.remove("d-none")
  document.querySelector("#mobile-btn-kit-2").classList.add("d-none")
  document.querySelector("[name='mobile-edit-ticket']").classList.remove("d-none")
  
}

function sell2home() {
  document.querySelector("#mobile-home").classList.add("d-block")
  document.querySelector("#mobile-home").classList.remove("d-none")
  document.querySelector("#mobile-sell").classList.add("d-none")
  document.querySelector("#mobile-sell").classList.remove("d-block")
  
}

function home2status() {
  document.querySelector("#mobile-home").classList.remove("d-block")
  document.querySelector("#mobile-home").classList.add("d-none")
  document.querySelector("#mobile-status").classList.remove("d-none")
  document.querySelector("#mobile-status").classList.add("d-block")
}

function status2home() {
  document.querySelector("#mobile-home").classList.add("d-block")
  document.querySelector("#mobile-home").classList.remove("d-none")
  document.querySelector("#mobile-status").classList.add("d-none")
  document.querySelector("#mobile-status").classList.remove("d-block")
}

function home2reedem() {
  document.querySelector("#mobile-home").classList.remove("d-block")
  document.querySelector("#mobile-home").classList.add("d-none")
  document.querySelector("#mobile-reedem").classList.remove("d-none")
  document.querySelector("#mobile-reedem").classList.add("d-block")
}

function reedem2home() {
  document.querySelector("#mobile-home").classList.add("d-block")
  document.querySelector("#mobile-home").classList.remove("d-none")
  document.querySelector("#mobile-reedem").classList.add("d-none")
  document.querySelector("#mobile-reedem").classList.remove("d-block")
}

function home2finantial() {
  document.querySelector("#mobile-home").classList.remove("d-block")
  document.querySelector("#mobile-home").classList.add("d-none")
  document.querySelector("#mobile-finantial").classList.remove("d-none")
  document.querySelector("#mobile-finantial").classList.add("d-block")
}

function finantial2home() {
  document.querySelector("#mobile-home").classList.add("d-block")
  document.querySelector("#mobile-home").classList.remove("d-none")
  document.querySelector("#mobile-finantial").classList.add("d-none")
  document.querySelector("#mobile-finantial").classList.remove("d-block")
}

function home2config() {
  window.location = "/historial"
  //document.querySelector("#mobile-home").classList.remove("d-block")
  //document.querySelector("#mobile-home").classList.add("d-none")
  //document.querySelector("#mobile-config").classList.remove("d-none")
  //document.querySelector("#mobile-config").classList.add("d-block")
}

function config2home() {
  document.querySelector("#mobile-home").classList.add("d-block")
  document.querySelector("#mobile-home").classList.remove("d-none")
  document.querySelector("#mobile-config").classList.add("d-none")
  document.querySelector("#mobile-config").classList.remove("d-block")
}

function mobileExit() {
  localStorage.clear();
  window.location = "/";
}

//UX - Reedemm

document.addEventListener('DOMContentLoaded', function() {
  console.log("Ejecutado Loader de QR")
  const scanButton = document.getElementById('scan-button');
  const closeButton = document.getElementById('close-scanner');
  const scannerContainer = document.getElementById('scanner-container');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const canvasContext = canvas.getContext('2d');
  
  let scanning = false;
  let videoStream = null;
  
  // Función que se llamará con el dato escaneado
  function procesarCodigoQR(datos) {
    console.log("Código QR escaneado:", datos);
    window.location = '/'+datos
    // Aquí puedes llamar a tu función que procesa el código QR
    // Por ejemplo: tuFuncion(datos);
  }
  
  // Iniciar el escáner
  scanButton.addEventListener('click', function() {
    scannerContainer.style.display = 'block';
    startScanner();
  });
  
  // Cerrar el escáner
  closeButton.addEventListener('click', function() {
    stopScanner();
    scannerContainer.style.display = 'none';
  });
  
  // Iniciar la cámara y el proceso de escaneo
  function startScanner() {
    // Verificar si la API de getUserMedia está disponible
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Solicitar acceso a la cámara
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Usar cámara trasera preferentemente
      })
      .then(function(stream) {
        videoStream = stream;
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // Requerido para iOS
        video.play();
        
        // Iniciar escaneo
        scanning = true;
        requestAnimationFrame(tick);
      })
      .catch(function(error) {
        console.error("Error al acceder a la cámara: ", error);
        alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
      });
    } else {
      alert("Lo sentimos, tu navegador no soporta acceso a la cámara.");
    }
  }
  
  // Detener el escáner
  function stopScanner() {
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        track.stop();
      });
      video.srcObject = null;
      videoStream = null;
    }
    scanning = false;
  }
  
  // Función que se ejecuta en cada frame para buscar códigos QR
  function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && scanning) {
      // Configurar el canvas al tamaño del video
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      // Dibujar el frame actual en el canvas
      canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtener los datos de la imagen
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      
      // Escanear la imagen en busca de códigos QR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert", // Para QR oscuros en fondos claros
      });
      
      // Si se encontró un código QR
      if (code) {
        console.log("¡QR encontrado!", code.data);
        
        // Llamar a tu función con los datos escaneados
        procesarCodigoQR(code.data);
        
        // Cerrar el escáner automáticamente después de escanear
        stopScanner();
        scannerContainer.style.display = 'none';
      }
      
      // Continuar el escaneo en el próximo frame
      if (scanning) {
        requestAnimationFrame(tick);
      }
    } else if (scanning) {
      requestAnimationFrame(tick);
    }
  }
});


/*Build In*/
chanceBuilder()
loadConfiguration()
bag.render()