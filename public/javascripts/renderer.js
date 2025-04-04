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
    return date.toLocaleString('en-US', { hour12: true })
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
  let number = document.querySelector("#mobile-filler-number").value
  if (isNaN(number) || ![2,4].includes(number.length)) {    
    document.querySelector("#mobile-filler-number").focus()
    return false
  } 
  let qty = document.querySelector("#mobile-filler-qty").value
  if (isNaN(qty) || !qty) {    
    document.querySelector("#mobile-filler-qty").focus()
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
  
  document.querySelector('#mobile-filler-number').value = ''
  document.querySelector('#mobile-filler-qty').value = ''
  document.querySelector('#mobile-filler-number').focus()

}


/*Build In*/
chanceBuilder()
loadConfiguration()
bag.render()