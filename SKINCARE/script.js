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
   4 Y 8. LÓGICA COMPLETA DEL CARRITO DE COMPRAS (IMÁGENES Y CANTIDAD)
   ========================================== */
let carrito = JSON.parse(localStorage.getItem('carrito_holabonita')) || [];
const cartCounter = document.querySelector('.content-shopping-cart .number');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const headerCartIcon = document.querySelector('.container-user');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// Agregar o sumar producto al carrito
function agregarAlCarrito(nombre, precio, imagen) {
    // Revisamos si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.nombre === nombre);
    
    if (itemExistente) {
        itemExistente.cantidad += 1; // Si ya existe, le sumamos 1
    } else {
        // Si es nuevo, lo guardamos con su imagen y cantidad 1
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }
    
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito(); // Actualizamos lo visual al instante
    
    // Mostramos el carrito automáticamente para que el cliente vea que se agregó
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
}

// Botones directos de "Comprar +" en las tarjetas
const botonesCarrito = document.querySelectorAll('.card-product .add-cart');
botonesCarrito.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const card = e.target.closest('.card-product');
        const titulo = card.querySelector('h3').textContent;
        const precio = card.querySelector('.price').childNodes[0].textContent.trim();
        const imagen = card.querySelector('img').src; // Capturamos la foto
        agregarAlCarrito(titulo, precio, imagen);
    });
});

// Modificación para el botón de la Ventana Emergente (Modal)
const btnModalAddCart = document.getElementById('modal-add-cart');
if (btnModalAddCart) {
    // Nos aseguramos de quitar eventos anteriores para que no se dupliquen clics
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

// Dibujar el carrito lateral
function renderizarCarrito() {
    if(!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = ''; 
    let totalPrecio = 0;
    let totalArticulos = 0;

    if(carrito.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío 😔</p>';
    } else {
        carrito.forEach((producto, index) => {
            let precioNumerico = parseFloat(producto.precio.replace(/[^0-9.-]+/g,""));
            let cantidad = producto.cantidad || 1; // Por si tenías productos viejos guardados
            let imagenSrc = producto.imagen || 'https://via.placeholder.com/60';

            if(!isNaN(precioNumerico)) {
                totalPrecio += (precioNumerico * cantidad);
            }
            totalArticulos += cantidad;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${imagenSrc}" alt="${producto.nombre}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${producto.nombre}</h4>
                    <span class="cart-item-price">${producto.precio}</span>
                    <div class="cart-quantity">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="cart-delete-btn" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }
    
    if(cartTotalElement) cartTotalElement.textContent = `$${totalPrecio.toFixed(2)}`;
    if(cartCounter) cartCounter.textContent = `(${totalArticulos})`;
}

// Sumar o restar cantidades desde el carrito lateral
window.cambiarCantidad = function(index, cambio) {
    if(carrito[index].cantidad + cambio > 0) {
        carrito[index].cantidad += cambio;
    } else {
        carrito.splice(index, 1); // Si baja de 1, lo borramos de la lista
    }
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito();
};

// Eliminar producto individual
window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
    renderizarCarrito(); 
};

// Abrir y cerrar el carrito lateral
if(headerCartIcon) {
    headerCartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        renderizarCarrito(); 
    });
}
function cerrarCarrito() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}
if(closeCartBtn) closeCartBtn.addEventListener('click', cerrarCarrito);
if(cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

// Dibujamos el carrito la primera vez que carga la página
renderizarCarrito();