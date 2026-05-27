/* ==========================================
   1. LÓGICA DEL BUSCADOR DE PRODUCTOS
   ========================================== */
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form input[type="search"]');

if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.card-product');

        products.forEach(product => {
            const titleElement = product.querySelector('h3');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                if(title.includes(searchTerm)){
                    product.style.display = 'block'; 
                } else {
                    product.style.display = 'none'; 
                }
            }
        });
    });
}

/* ==========================================
   2. LÓGICA DEL BOLETÍN DE SUSCRIPCIÓN
   ========================================== */
const emailInput = document.querySelector('.newsletter input[type="email"]');
const subscribeBtn = document.querySelector('.newsletter button');

if (emailInput && subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();

        if (email === '' || !email.includes('@')) {
            alert('Por favor, ingresa un correo electrónico válido.');
            return; 
        }

        let emailsGuardados = JSON.parse(localStorage.getItem('suscriptores_holabonita')) || [];
        
        if (emailsGuardados.includes(email)) {
            alert('Este correo ya está suscrito a nuestro boletín.');
            return;
        }

        emailsGuardados.push(email);
        localStorage.setItem('suscriptores_holabonita', JSON.stringify(emailsGuardados));

        alert('¡Gracias por suscribirte! Te enviaremos las mejores ofertas a: ' + email);
        emailInput.value = '';
    });
}

/* ==========================================
   3. LÓGICA DEL CHATBOT (CON NETLIFY)
   ========================================== */
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('hidden');
    }
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const messageText = inputField.value.trim();

    if (messageText === '') return;

    const userMsg = document.createElement('p');
    userMsg.className = 'user-msg'; 
    userMsg.innerHTML = `<strong>Tú:</strong> ${messageText}`;
    chatBody.appendChild(userMsg);

    inputField.value = '';

    const botThinking = document.createElement('p');
    botThinking.className = 'bot-msg';
    botThinking.innerHTML = `<em>Escribiendo...</em>`;
    chatBody.appendChild(botThinking);

    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensajeUsuario: messageText 
            })
        });

        const data = await response.json();

        chatBody.removeChild(botThinking);

        if (data.candidates && data.candidates.length > 0) {
            const botReplyText = data.candidates[0].content.parts[0].text;
            const botMsg = document.createElement('p');
            botMsg.className = 'bot-msg';
            botMsg.innerHTML = `<strong>Hola Bonita ✨:</strong><br>${botReplyText.replace(/\n/g, '<br>')}`;
            chatBody.appendChild(botMsg);
        } else {
            throw new Error("No se recibió respuesta válida");
        }

    } catch (error) {
        console.error("Error al conectar con la API:", error);
        
        if (chatBody.contains(botThinking)) {
            chatBody.removeChild(botThinking);
        }
        
        const errorMsg = document.createElement('p');
        errorMsg.className = 'bot-msg';
        errorMsg.style.color = 'red';
        errorMsg.innerHTML = `<em>Ups, hubo un problema de conexión con nuestro servidor.</em>`;
        chatBody.appendChild(errorMsg);
    }

    chatBody.scrollTop = chatBody.scrollHeight;
}

const userInputField = document.getElementById('user-input');
if (userInputField) {
    userInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

/* ==========================================
   4 Y 8. LÓGICA DEL CARRITO DE COMPRAS PREMIUM
   ========================================== */
let carrito = JSON.parse(localStorage.getItem('carrito_holabonita')) || [];
const cartCounter = document.querySelector('.content-shopping-cart .number');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const headerCartIcon = document.querySelector('.container-user');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

function agregarAlCarrito(nombre, precio, imagen) {
    const itemExistente = carrito.find(item => item.nombre === nombre);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }
    
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito(); 
    
    // Abre el carrito para mostrar el nuevo producto
    if(cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }
}

const botonesCarrito = document.querySelectorAll('.card-product .add-cart');
botonesCarrito.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const card = e.target.closest('.card-product');
        const titulo = card.querySelector('h3').textContent;
        const precio = card.querySelector('.price').childNodes[0].textContent.trim();
        const imagen = card.querySelector('img').src; 
        agregarAlCarrito(titulo, precio, imagen);
    });
});

const btnModalAddCart = document.getElementById('modal-add-cart');
if (btnModalAddCart) {
    const nuevoBtnModal = btnModalAddCart.cloneNode(true);
    btnModalAddCart.parentNode.replaceChild(nuevoBtnModal, btnModalAddCart);
    
    nuevoBtnModal.addEventListener('click', () => {
        const modalTitle = document.getElementById('modal-title');
        const modalPrice = document.getElementById('modal-price');
        const modalImg = document.getElementById('modal-img');
        agregarAlCarrito(modalTitle.textContent, modalPrice.textContent, modalImg.src);
        document.getElementById('product-modal').classList.remove('active');
    });
}

// Dibujar el carrito lateral estilo Premium
function renderizarCarrito() {
    if(!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = ''; 
    let totalPrecio = 0;
    let totalArticulos = 0;

    if(carrito.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; font-weight:bold; margin-top:20px;">Tu carrito está vacío 😔</p>';
    } else {
        carrito.forEach((producto, index) => {
            let precioNumerico = parseFloat(producto.precio.replace(/[^0-9.-]+/g,""));
            let cantidad = producto.cantidad || 1;
            let imagenSrc = producto.imagen || 'https://via.placeholder.com/90';

            if(!isNaN(precioNumerico)) {
                totalPrecio += (precioNumerico * cantidad);
            }
            totalArticulos += cantidad;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item-new';
            itemDiv.innerHTML = `
                <img src="${imagenSrc}" alt="${producto.nombre}" class="cart-item-img-new">
                <div class="cart-item-details">
                    <div>
                        <div class="item-brand">HOLA BONITA</div>
                        <div class="item-name">${producto.nombre}</div>
                    </div>
                    <div class="item-price-qty">
                        <span class="item-price">${producto.precio}</span>
                        <span class="item-qty-text">Cantidad ${cantidad}</span>
                    </div>
                </div>
                <div class="cart-controls-wrapper">
                    <span class="controls-title">CANTIDAD</span>
                    <div class="cart-quantity-new">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})" class="cart-remove-link">Remover</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }
    
    if(cartTotalElement) cartTotalElement.textContent = `$${totalPrecio.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    
    const summaryCount = document.getElementById('cart-count-summary');
    if(summaryCount) summaryCount.textContent = totalArticulos;
    
    if(cartCounter) cartCounter.textContent = `(${totalArticulos})`;
}

window.cambiarCantidad = function(index, cambio) {
    if(carrito[index].cantidad + cambio > 0) {
        carrito[index].cantidad += cambio;
    } else {
        carrito.splice(index, 1); 
    }
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito();
};

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito(); 
};

if(headerCartIcon) {
    headerCartIcon.addEventListener('click', () => {
        if(cartSidebar && cartOverlay) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            renderizarCarrito(); 
        }
    });
}
function cerrarCarrito() {
    if(cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
    }
}
if(closeCartBtn) closeCartBtn.addEventListener('click', cerrarCarrito);
if(cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

renderizarCarrito();

/* ==========================================
   5. LÓGICA DE LA VENTANA EMERGENTE (MODAL)
   ========================================== */
const modal = document.getElementById('product-modal');
const btnCloseModal = document.querySelector('.close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');

const botonesVerMas = document.querySelectorAll('.button-group span:first-child');

botonesVerMas.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const card = e.target.closest('.card-product');
        const titulo = card.querySelector('h3').textContent;
        const imagen = card.querySelector('img').src;
        const precio = card.querySelector('.price').childNodes[0].textContent.trim();

        if(modalTitle) modalTitle.textContent = titulo;
        if(modalImg) modalImg.src = imagen;
        if(modalPrice) modalPrice.textContent = precio;

        if(modal) modal.classList.add('active');
    });
});

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
        if(modal) modal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

/* ==========================================
   6. LÓGICA DE LOS FILTROS (Destacados, etc)
   ========================================== */
const filterOptions = document.querySelectorAll('.container-options span');
const productsList = document.querySelectorAll('.top-products .card-product');

filterOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        filterOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        productsList.forEach((product, i) => {
            product.style.display = ''; 
            
            if (index === 1 && i < 2) {
                product.style.display = 'none';
            }
            else if (index === 2 && i >= 2) {
                product.style.display = 'none';
            }
        });
    });
});

/* ==========================================
   7. LÓGICA DE LOS BOTONES "LEER MÁS"
   ========================================== */
const botonesLeerMas = document.querySelectorAll('.btn-read-more');

botonesLeerMas.forEach(boton => {
    boton.addEventListener('click', () => {
        alert("¡Próximamente! ✨ Estamos preparando este artículo con los mejores tips de belleza para ti.");
    });
});