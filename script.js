document.addEventListener('DOMContentLoaded', () => {
    console.log("¡Todo cargado! Iniciando sistema...");

    // ==========================================
    // 1. LÓGICA DEL CARRITO (Unificada)
    // ==========================================
    let carrito = JSON.parse(localStorage.getItem('carrito_holabonita')) || [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCounter = document.querySelector('.content-shopping-cart .number');

    function renderizarCarrito() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = ''; 
        let totalPrecio = 0;
        let totalArticulos = 0;

        if (carrito.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center;">Tu carrito está vacío 😔</p>';
        } else {
            carrito.forEach((producto, index) => {
                let precioNumerico = parseFloat(producto.precio.replace(/[^0-9.-]+/g,"")) || 0;
                totalPrecio += (precioNumerico * producto.cantidad);
                totalArticulos += producto.cantidad;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item-new';
                itemDiv.innerHTML = `
                    <img src="${producto.imagen}" width="50">
                    <div>
                        <div>${producto.nombre}</div>
                        <div>Precio: ${producto.precio} | Cantidad: ${producto.cantidad}</div>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})">Remover</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
        }
        if (cartTotalElement) cartTotalElement.textContent = `$${totalPrecio}`;
        if (cartCounter) cartCounter.textContent = `(${totalArticulos})`;
    }

    function agregarAlCarrito(nombre, precio, imagen) {
        const itemExistente = carrito.find(item => item.nombre === nombre);
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({ nombre, precio, imagen, cantidad: 1 });
        }
        localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
        renderizarCarrito();
        if(cartSidebar && cartOverlay) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
        }
    }

    window.eliminarDelCarrito = function(index) {
        carrito.splice(index, 1);
        localStorage.setItem('carrito_holabonita', JSON.stringify(carrito));
        renderizarCarrito(); 
    };

    // ==========================================
    // 2. LÓGICA DEL CHATBOT (HACEMOS FUNCIONES GLOBALES)
    // ==========================================
   // En lugar de function toggleChat() { ... }
    window.toggleChat = function() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.toggle('hidden');
        }
    };

    window.sendMessage = async function() {
        const inputField = document.getElementById('user-input');
        const chatBody = document.getElementById('chat-body');
        if (!inputField || !chatBody) return;

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensajeUsuario: messageText })
            });
            const data = await response.json();
            chatBody.removeChild(botThinking);
            if (data.candidates && data.candidates.length > 0) {
                const botReplyText = data.candidates[0].content.parts[0].text;
                const botMsg = document.createElement('p');
                botMsg.className = 'bot-msg';
                botMsg.innerHTML = `<strong>Hola Bonita ✨:</strong><br>${botReplyText.replace(/\n/g, '<br>')}`;
                chatBody.appendChild(botMsg);
            }
        } catch (error) {
            console.error("Error:", error);
            if (chatBody.contains(botThinking)) chatBody.removeChild(botThinking);
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // ==========================================
    // 3. EVENTOS UNIVERSALES (CARRITO Y OTROS)
    // ==========================================
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-cart')) {
            const card = e.target.closest('.card-product');
            if (card) {
                agregarAlCarrito(
                    card.querySelector('h3').textContent,
                    card.querySelector('.price').textContent.trim(),
                    card.querySelector('img').src
                );
            }
        }
        if (e.target.id === 'close-cart' || e.target.id === 'cart-overlay') {
            if(cartSidebar) cartSidebar.classList.remove('open');
            if(cartOverlay) cartOverlay.classList.remove('active');
        }
    });

    // ==========================================
    // 4. INICIALIZACIÓN
    // ==========================================
    renderizarCarrito();
});