

let bagItemsObjects;
 onLoad();

function onLoad(){
   loadbagItemsObjects();
  displayBagItems();
  displayBagSummary();
  displayBagIcon();
};
    
function displayBagSummary(){
    let bagSummaryElement =document.querySelector('.bag-summary');
    
    let totalItem = bagItemsObjects.length;
    let totalMRP = 0;
    let totalDiscount = 0;
    
    
    bagItemsObjects.forEach(bagItem =>{
        totalMRP += bagItem.original_price;
        let discount = (bagItem.original_price * bagItem.discount_percentage) / 100;
    totalDiscount += discount;
        
        
    })
    let CONVENIENCE_FEE =78;
    if(totalItem===0){
        CONVENIENCE_FEE=0;
    };
    let finalPayment = totalMRP - totalDiscount + CONVENIENCE_FEE  ;
    bagSummaryElement.innerHTML=`
        <div class="bag-details-container">
                        <div class="price-header">PRICE DETAILS ( ${totalItem} Items)
                        </div>
                        <div class="price-item">
                            <span class="price-item-tag">Total MRP</span>
                            <span class="price-item-value">₹ ${totalMRP}</span>
                        </div>
                        
                        <div class="price-item">
                          <span class="price-item-tag">Discount on MRP</span>  
                          <span class="price-item-value  priceDetail-base-discount">₹ ${totalDiscount}</span>  
                        </div>
                        <div class="price-item">
                          <span class="price-item-tag">convenience Fee</span>  
                          <span class="price-item-value">₹ ${CONVENIENCE_FEE}</span>  
                        </div>
                        
                         <div class="price-footer">
                          <span class="price-item-tag">Total Amount</span>  
                          <span class="price-item-value">₹ ${finalPayment}</span> </div>
                         <div><button class="btn-place-order" >PLACE ORDER  </button></div>`;
}
function loadbagItemsObjects(){

bagItemsObjects = iartwork.map(itemId =>{
    for(let i= 0; i < artworks.length;i++){
        if(itemId == artworks[i].id){
            return artworks[i];
        }
    }
});
console.log(bagItemsObjects);
}

function removeFromCart(itemId){
    iartwork =iartwork.filter(bagItemId => bagItemId != itemId);
    localStorage.setItem('iartwork',JSON.stringify(iartwork));
    loadbagItemsObjects();
    displayBagIcon();
    displayBagItems();
    displayBagSummary()
    
};
function displayBagItems(){
    
  let containerElement = document.querySelector('.bag-Items-container');
  let innerHTML='';
  bagItemsObjects.forEach(bagItems =>{innerHTML+= generateItemHTML(bagItems);})
   containerElement.innerHTML = innerHTML;
}
function generateItemHTML(art){
let discount = (art.original_price * art.discount_percentage) / 100;




let price = Math.round((art.original_price - discount));

    return ` <div class="bag-item-container">
                    <div class="item-left-part">
                        <img class="bag-item-img" src="${art.image}" alt="photo">
                    </div>
                    <div class="item-right-part">
                    <div class="company">${art.artist}</div>
                    <div class="item-name">${art.title}</div>
                    <div class="price-container">
                        <span class="current-price">₹ ${price}</span>
                        <span class="orignal-price">${art.original_price}</span>
                        <span class="discount-percentage">(${art.discount_percentage}%  OFF)</span>
                    </div>
                    <div class="return-period">
                        <span class="return-period-day">${art.return_period} return available</span>
                    </div>
                    <div class="delivery-details">
                        Delivery by
                        <span class="delivery-details-days">${art.delivery_date}</span>
                         
                    </div>
                    </div>
                    <div class="remove-from-cart" onclick="removeFromCart(${art.id});">x
                    </div>
                </div>`;
}

  const placeOrderBtn = document.querySelector(".btn-place-order");
  const loadingScreen = document.getElementById("loadingScreen");
  const confirmationScreen = document.getElementById("confirmationScreen");
  const backBtn = document.getElementById("backBtn");

  placeOrderBtn?.addEventListener("click", () => {
    // Show loader
    loadingScreen.style.display = "flex";

    // After 2 seconds, hide loader & show confirmation
    setTimeout(() => {
      loadingScreen.style.display = "none";
      confirmationScreen.style.display = "flex";
      // 🟢 Clear cart after placing order
    bagItems = [];
    localStorage.setItem("iartwork", JSON.stringify(iartwork));
    loadbagItemsObjects();
    displayBagIcon();
    displayBagItems();
    displayBagSummary();
    }, 3000);
  });

  // Back button → hide confirmation
  backBtn.addEventListener("click", () => {
    confirmationScreen.style.display = "none";
  });
