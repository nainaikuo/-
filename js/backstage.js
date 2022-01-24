


const api_path = "nai"
const token = "6B0Yu28b3MNL8rTZpDUX5sMzohE3"
const config = {
    headers: {
      'Authorization': token
    }
    }
let orderData ; 
const orderTable = document.querySelector(".js-order-table")
const delAllOrderBtn = document.querySelector(".order-del-all")
const orderDetailClose = document.querySelector(".order-detail-close")


function init(){
    getOrderData();
}

function getOrderData(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,config)
    .then(res => {
        orderData = res.data.orders ;
        
        renderOrder()
    })
    .catch(err => {
        // console.log(err); 
    })
}

function renderOrder(){
    const content = document.querySelector(".content")
    if(orderData.length===0){
        
        const message = document.querySelector(".message")
        content.style.display = "none"
        message.textContent = `沒有訂單(☍﹏⁰。))`
        noOrderMessage.style.display = "block"
        return;
    }
    content.style.display = "block"
    getChartData() 
    let orderTableContent = ""
    
    orderData.forEach(i=>{
        let orderStauts ;
        // console.log(i.paid);
        if(i.paid===true){
            orderStatus = "已付款"
            
        }else{
            orderStatus = "未付款"
        }

        // console.log(orderStatus);

        orderTableContent +=`
                    <tr>
                        <td class="order-id" data-id="${i.id}">${i.createdAt}</td>
                        <td>${i.user.name}<br>0912345678</td>
                        <td>${i.user.address}</td>
                        <td>${i.user.email}</td>
                        <td>${i.total}元</td>
                        <td>${i.createdAt}</td>
                        <td>${orderStatus}</td>
                        <td><button class="order-del-btn" data-id="${i.id}">刪除</button>
                        <button class="order-paid-btn" data-id="${i.id}" data-paid = "${i.paid}">更改付款狀態</button></td>
                    </tr>
        
        `
        
    })
    // console.log(orderTableContent);
    orderTable.innerHTML = orderTableContent

}

function getChartData(){

    let chartData=[];
    let categoryNum = {}

    orderData.forEach(order=>{
        order.products.forEach(product=>{
            if(!categoryNum[product.category]){
                categoryNum[product.category] = 1
            }else{
                categoryNum[product.category] += 1
            }
            
        })
    })

    let category = Object.keys(categoryNum)
    category.forEach(category=>{
        chartData.push([category,categoryNum[category]])
    })



    renderChart(chartData)
}

function renderChart(chartData){
    const chart = c3.generate({
        bindto:".chart",
        data: {
            columns: chartData,
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        },
        color: {
            pattern: ['#4d6069', '#67a8a8', '#a1b4b4']
          }
    });
}


function editOrder(e){
    if(e.target.classList.contains("order-del-btn")){
        
        let id = e.target.dataset.id


        Swal.fire({
            title: '確定要刪除此訂單嗎？(`・ω・´)',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4d6069',
            cancelButtonColor: '#C44021',
            confirmButtonText: '忍痛刪除',
            cancelButtonText: '先不要',
          }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,config)
                    .then(res=>{
                        orderData = res.data.orders
                        renderOrder()
                    })
            }
          })
    

        
    }
    if(e.target.classList.contains("order-id")){
        let orderId = e.target.dataset.id
        axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,config)
        .then(res => {

        orderData = res.data.orders ;
        let nowOrder = orderData.filter(i=>i.id === orderId)[0]
        orderDetail(nowOrder);
    })
    }
    if(e.target.classList.contains("order-paid-btn")){
        let id = e.target.dataset.id;
        let isPaid  = e.target.dataset.paid
        let paidStatus
        if(isPaid === "true"){
            paidStatus = false
        }else{
            paidStatus = true
        }
        
        axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": id,
        "paid": paidStatus
      }
    },
    config)
    .then(res=>{
        orderData = res.data.orders
        informEditSuccess()
        renderOrder()
    })
    }
}

function orderDetail(nowOrder){
    const orderDetail = document.querySelector(".order-detail")
    orderDetail.style.display="block"
    const info = document.querySelector(".order-detail .info")
    let orderStatus;
    let payment;
    if(nowOrder.paid===false){
        orderStatus="未付款"
    }else{
        orderStatus="已付款"
    }

    if(nowOrder.user.payment === "credit-card"){
        payment = "信用卡"
    }else if (nowOrder.user.payment === "ATM"){
        payment = "ATM轉帳"
    }else if(nowOrder.user.payment === "store"){
        payment = "超商取貨"
    }
    let infoContent=`
                <li>訂單編號：${nowOrder.createdAt}</li>
                <li>訂單日期：${nowOrder.createdAt}</li>
                <li>聯絡人：${nowOrder.user.name}</li>
                <li>連絡電話：${nowOrder.user.tel}</li>
                <li class="address">聯絡地址：${nowOrder.user.address}</li>
                <li>付款方式：${payment}</li>
                <li>訂單狀態：${orderStatus}</li>
    `

    info.innerHTML=infoContent
    let productsData = nowOrder.products
    const productList = document.querySelector(".order-detail .js-product-list")
    let productListContent = ""
    productsData.forEach((product,index)=>{
        productListContent+=`
            <tr>
                <td>${index+1}</td>
                <td>${product.title}</td>
                <td>${product.quantity}</td>
                <td>${product.price}</td>
                <td>${product.quantity*product.price}</td>
            </tr>

        `
    })
    productList.innerHTML = productListContent
}


function delAllOrder(){
    if(orderData.length===0){
        Swal.fire({
            icon: 'warning',
            title: '目前沒有訂單',
          })
          return;
    }
    Swal.fire({
        title: '確定要刪除所有訂單嗎？(((ﾟДﾟ;)))',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4d6069',
        cancelButtonColor: '#C44021',
        confirmButtonText: '忍痛刪除',
        cancelButtonText: '先不要',
      }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,config)
        .then(res=>{
            orderData = res.data.orders
            renderOrder()
        })
        }
      })




    
}

function closeWindow() {
    const orderDetail = document.querySelector(".order-detail")
    orderDetail.style.display="none"
  }

  function informEditSuccess(){
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '已更改訂單狀態！',
        showConfirmButton: false,
        timer: 1200
      })
}


orderTable.addEventListener("click",editOrder)
delAllOrderBtn.addEventListener("click",delAllOrder)
orderDetailClose.addEventListener("click",closeWindow)

init()