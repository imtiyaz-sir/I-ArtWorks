let iartwork;
onLoad();

function onLoad() {
  let iItemsStr = localStorage.getItem('iartwork');
  iartwork = iItemsStr ? JSON.parse(iItemsStr) : [];
  displayItemsOnHomePage();
  displayBagIcon();
}


function addCart(itemId) {
  iartwork.push(itemId);
  localStorage.setItem('iartwork', JSON.stringify(iartwork));
  displayBagIcon();
  
}
console.log(iartwork)
function displayBagIcon() {
  let bagItemCountElement = document.querySelector('.bag-item-count');
  if (iartwork.length > 0) {
    bagItemCountElement.style.visibility = 'visible';
    bagItemCountElement.innerText = iartwork.length;
  } else {
    bagItemCountElement.style.visibility = 'hidden';
  }
}



const gridBtn = document.querySelector('.control-btn:nth-child(1)');
const listBtn = document.querySelector('.control-btn:nth-child(2)');
const artGrid = document.querySelector('.art-grid');

// Default: grid view
artGrid.classList.add('grid-view');

// Toggle to grid view
gridBtn.addEventListener('click', () => {
  artGrid.classList.remove('list-view');
  artGrid.classList.add('grid-view');
});

// Toggle to list view
listBtn.addEventListener('click', () => {
  artGrid.classList.remove('grid-view');
  artGrid.classList.add('list-view');
});

// Your displayitms function remains the same:
function displayItemsOnHomePage(){
  let displayItems = document.querySelector('.art-grid'); 
  let innerHtml = '';
  artworks.forEach(art => {
        let discount = (art.original_price * art.discount_percentage) / 100;
    let price = Math.round((art.original_price - discount));
      // decide label color class
    let labelClass = '';
    if (art.label.toLowerCase() === 'new') labelClass = 'label-new';
    else if (art.label.toLowerCase() === 'featured') labelClass = 'label-featured';
    else if (art.label.toLowerCase() === 'curated') labelClass = 'label-curated';
    else if (art.label.toLowerCase() === 'limited') labelClass = 'label-limited';
    
    else labelClass = 'label-default';
    
   innerHtml += `
  <div class="artwork-card">
    <div class="art-img">
      <img class="art-thumb" src="${art.image}" alt="Artwork Title">
      <div class="art-options-overlay">
        <button class="preview-btn">👁️ Preview</button>
        <button style="background: #f54e77 ; color:white;"  class="add-cart-btn" onclick="addCart(${art.id});">🛒 Add to Cart</button>
      </div>
           <div class="art-label ${labelClass}">${art.label}</div>
    </div>

    <div class="art-details">
 
      <div class="art-title">${art.title}</div>
      <div class="art-artist">${art.artist}</div>
      <div class="art-meta">ABSTRACT</div>
      <div class="art-info-row">
        <span class="art-info-label">Size</span>
        <span class="art-info-value">${art.size}”</span>
      </div>
      <div class="art-info-row">
        <span class="art-info-label">Medium</span>
        <span class="art-info-value">${art.medium}</span>
      </div>
        <div class="price">
          <span class="current-price">₹ ${price}</span>
          <span class="original-price">${art.original_price}</span>
          <span class="discount">(${art.discount_percentage}% OFF)</span>
        </div>
    </div>
  </div>`;
  });

  displayItems.innerHTML = innerHtml;
}


displayItemsOnHomePage();