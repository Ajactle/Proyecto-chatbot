/* ==========================================
   1. LÓGICA DEL BUSCADOR DE PRODUCTOS
   ========================================== */
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form input[type="search"]');

// Solo ejecutamos esto si la página tiene un buscador
if (searchForm && searchInput) {
    // Evitamos que la página se recargue al dar "Enter"
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Filtramos mientras el usuario escribe
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

// Solo ejecutamos esto si la página tiene el apartado de newsletter
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

// Función para abrir y cerrar la ventana del chat
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('hidden');
    }
}

// Función principal para enviar el mensaje a tu servidor en Netlify
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const messageText = inputField.value.trim();

    if (messageText === '') return;

    // Mostrar el mensaje del usuario en el chat
    const userMsg = document.createElement('p');
    userMsg.className = 'user-msg'; 
    userMsg.innerHTML = `<strong>Tú:</strong> ${messageText}`;
    chatBody.appendChild(userMsg);

    // Limpiar la barra de texto
    inputField.value = '';

    // Mostrar indicador de "Escribiendo..."
    const botThinking = document.createElement('p');
    botThinking.className = 'bot-msg';
    botThinking.innerHTML = `<em>Escribiendo...</em>`;
    chatBody.appendChild(botThinking);

    // Bajar el scroll al último mensaje
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        // Enviar la petición a tu archivo seguro en Netlify
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

        // Borrar el texto de "Escribiendo..."
        chatBody.removeChild(botThinking);

        // Extraer y mostrar la respuesta de Gemini
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
        
        // Si el mensaje de "Escribiendo..." sigue ahí, lo quitamos
        if (chatBody.contains(botThinking)) {
            chatBody.removeChild(botThinking);
        }
        
        // Mensaje de error para el usuario (¡Ya no dice Vercel!)
        const errorMsg = document.createElement('p');
        errorMsg.className = 'bot-msg';
        errorMsg.style.color = 'red';
        errorMsg.innerHTML = `<em>Ups, hubo un problema de conexión con nuestro servidor.</em>`;
        chatBody.appendChild(errorMsg);
    }

    // Volver a bajar el scroll
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Escuchar si el usuario presiona "Enter" en lugar de hacer clic en enviar
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
/* ==========================================
   5. LÓGICA DE LA VENTANA EMERGENTE (MODAL)
   ========================================== */
const modal = document.getElementById('product-modal');
const btnCloseModal = document.querySelector('.close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const btnModalAddCart = document.getElementById('modal-add-cart');

// Seleccionamos los iconos del "ojito" en tus tarjetas para abrir el modal
const botonesVerMas = document.querySelectorAll('.button-group span:first-child');

botonesVerMas.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const card = e.target.closest('.card-product');
        // Extraer info de la tarjeta
        const titulo = card.querySelector('h3').textContent;
        const imagen = card.querySelector('img').src;
        const precio = card.querySelector('.price').childNodes[0].textContent.trim();

        // Poner la info dentro de la ventana emergente
        modalTitle.textContent = titulo;
        modalImg.src = imagen;
        modalPrice.textContent = precio;

        // Mostrar el modal
        modal.classList.add('active');
    });
});

// Cerrar ventana en la X
if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
}
// Cerrar ventana dando clic afuera
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});
// Añadir al carrito desde el botón grandote del Modal
if (btnModalAddCart) {
    btnModalAddCart.addEventListener('click', () => {
        agregarAlCarrito(modalTitle.textContent, modalPrice.textContent);
        modal.classList.remove('active');
    });
}

/* ==========================================
   6. LÓGICA DE LOS FILTROS (Destacados, etc)
   ========================================== */
const filterOptions = document.querySelectorAll('.container-options span');
// Seleccionamos solo las tarjetas de la sección "Mejores Productos"
const productsList = document.querySelectorAll('.top-products .card-product');

filterOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        // Quitar el color rosita (clase active) a todos y ponérselo al que dimos clic
        filterOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Simulación de Filtros: Ocultar y mostrar tarjetas
        productsList.forEach((product, i) => {
            product.style.display = ''; // Mostrar todos por defecto
            
            // Si elige "Más recientes", ocultamos los 2 primeros
            if (index === 1 && i < 2) {
                product.style.display = 'none';
            }
            // Si elige "Mejores Vendidos", ocultamos los 2 últimos
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
