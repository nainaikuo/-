const api_path = "nai"
const token = "6B0Yu28b3MNL8rTZpDUX5sMzohE3"
let productData ;
let cartData ;

const productArea = document.querySelector(".products")
const cartArea = document.querySelector(".js-cart-list")
const cartDelAll = document.querySelector(".cart-del-all")
const submitBtn = document.querySelector(".submit-btn")
const filter = document.querySelector(".filter")
const nav = document.querySelector(".nav")

function init(){
    getProdcutData();
    getCartData()
}

function getProdcutData(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(res => {
        productData = res.data.products
        renderProduct(productData)
    })
    .catch(err => {
        console.error(err); 
    })
}

function renderProduct(data){
    const productCards = document.querySelector(".products")
    let productCardContent ="";
    data.forEach(i => {
        productCardContent+=`
                <li class="product-card">
                    <img src="${i.images}" alt="${i.description}">
                    <button class="add-cart" data-id="${i.id}">加入購物車</button>
                    <p class="product-name">${i.title}</p>
                    <p class="orgin-price">NT$${i.origin_price}</p>
                    <p class="price">NT$${i.price}</p>
                </li>
        
        `
    });
    productCards.innerHTML = productCardContent
}

function getCartData(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(res => {
        cartData = res.data
        renderCart()
    })
    .catch(err => {
        console.error(err); 
    })
}

function renderCart(){
    const cartArea = document.querySelector(".cart")
    const message = document.querySelector(".message")
    const cartList = document.querySelector(".js-cart-list")
    if(cartData.carts.length===0){
        cartArea.classList.add("none")
        message.textContent = `購物車還沒有商品喔！歡迎挑看選看喔！ლ(╹◡╹ლ)`
        return;
    }else{
        cartArea.classList.remove("none")
        message.textContent=""
        let cartContent = "";
    cartData.carts.forEach(i=>{
        let singleTotalPrice = i.product.price * i.quantity
        cartContent +=`
                    <tr>
                        <td class="name">
                            <div class="name-area">
                                <img src="${i.product.images}" alt="">
                                <p>
                                    ${i.product.title} 
                                </p>
                            </div>
                            
                        </td>
                        <td>NT$${i.product.price}</td>
                        <td><input class="cart-product-quantity" type="number" data-id="${i.id}" value="${i.quantity}"></input></td>
                        <td>NT$${singleTotalPrice}</td>
                        <td><i class="fas fa-times del-btn" data-id="${i.id}"></i></td>
                    </tr>
        `
    })
    cartList.innerHTML = cartContent
    const totalPriceText = document.querySelector(".js-total-price")
    totalPriceText.textContent =`NT$${cartData.finalTotal}` 
    }
    
    
}

function addCart(e){
    // 如果按到的是按鈕才執行
    if(e.target.nodeName === "BUTTON"){
        // 取出埋在按鈕裡的商品ID
        let productId = e.target.dataset.id
        let cartList = cartData.carts
        // 預設為購物車沒有此商品
        let hasThisProduct = false;
        // 空陣列不能直接跑forEach，所以如果購物車列表為空則直接加入商品
        if(cartList.length===0){
            axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{"data": {"productId": productId,"quantity": 1}})
                .then(res=>{
                cartData = res.data
                informAddSuccess()
                renderCart()
                })
            return;    
        }
        // 檢查購物車是否有此商品
        cartList.forEach((i)=>{
            // 檢查購物車列表內的商品ID與剛剛取出的商品ID比對
            if(i.product.id===productId){
                // 若找到相同的ID則代表購物車已有此商品
                hasThisProduct = true;
                // 用patch修改商品數量
                axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{"data": {"id": i.id,"quantity":i.quantity+1}})
                .then(res=>{
                    cartData = res.data
                    informAddSuccess()
                    renderCart()
                })   
            }
        })
        if(hasThisProduct){
            return;
        }
        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{"data": {"productId": productId,"quantity": 1}})
        .then(res=>{
        cartData = res.data
        informAddSuccess()
        renderCart()
        })    
    }else{
        return;
    }
}

function delCart(e){
    if(e.target.classList.contains("del-btn")){
        let id = e.target.dataset.id
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`)
        .then(res=>{
            cartData = res.data
            renderCart()
        })
    }else{
        return;
    }
    
}

function delCartAll(e){
    Swal.fire({
        title: '確定要刪除所有商品嗎？(((ﾟДﾟ;)))',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4d6069',
        cancelButtonColor: '#C44021',
        confirmButtonText: '忍痛刪除',
        cancelButtonText: '先不要',
      }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
            .then(res=>{
                cartData = res.data
                renderCart()
            })
        }
      })
    
}

function creatOrder(e){
    let isEmpty = false;
    let orderData={}
    const inputGroup = document.querySelectorAll(".form .require")
    inputGroup.forEach(i=>{
        if(i.value==="" && isEmpty === false){
            let emptyInputName = i.dataset.name
            informRequireInputEmpty(emptyInputName)
            isEmpty = true
        }
    })
    if(isEmpty){return}

    inputGroup.forEach(i=>{
        orderData[`${i.name}`]=i.value
    })

    console.log(orderData);

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
          "user": orderData
        }
      })
      .then(res=>{
          getCartData()
          renderCart()
          informOrderSuccess()
          inputGroup.forEach(i=>{
            i.value=""
        })
        init()
      })
      .catch(res=>{
          informOrderFail()
      })

}

function informOrderSuccess(){
    Swal.fire({
        icon: 'success',
        title: '訂單已送出！',
        text: '已收到您的訂單！',
        confirmButtonColor: '#4d6069',
        // footer: '<a href="">Why do I have this issue?</a>'
      })
}

function informOrderFail(){
    Swal.fire({
        icon: 'warning',
        title: '購物車是空的(๑•́ ₃ •̀๑)',
        text: '尚未將商品加入購物車，再去逛逛吧！',
        confirmButtonColor: '#4d6069',
        confirmButtonText:"買起來！"
        // footer: '<a href="">Why do I have this issue?</a>'
      })
}

function informRequireInputEmpty(inputName){
    Swal.fire({
        icon: 'info',
        title: `${inputName}未填(๑•́ ₃ •̀๑)`,
        confirmButtonColor: '#4d6069',
      })
}
function informAddSuccess(){
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '已加入購物車！',
        showConfirmButton: false,
        timer: 1200
      })
}

function cateFilter(e){
    let nowCategory = e.target.value
    if(nowCategory==="全部"){
        renderProduct(productData)
        return;
    }
    let nowShowProduct = productData.filter(i=>i.category=== nowCategory)
    console.log(nowShowProduct)
    renderProduct(nowShowProduct)
}

function navToggle(){

    const menu = document.querySelector(".nav-menu")

    
    if(menu.classList.contains("none")){
        menu.classList.remove("none")
        menu.classList.add("block")
    }else{
        menu.classList.remove("block")
        menu.classList.add("none")
    }
}

function editCart(e){
    if(e.target.nodeName==="INPUT"){
        let quantity = parseInt(e.target.value)
        let id = e.target.dataset.id
        axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{"data": {"id": id,"quantity":quantity}})
                .then(res=>{

                    cartData = res.data
                    renderCart()
                })   
    }else{
        return;
    }

    
}

productArea.addEventListener("click",addCart)

cartArea.addEventListener("click",delCart)

cartArea.addEventListener("change",editCart)

cartDelAll.addEventListener("click",delCartAll)

submitBtn.addEventListener("click",creatOrder)

filter.addEventListener("change",cateFilter)



nav.addEventListener("click",navToggle)

init()