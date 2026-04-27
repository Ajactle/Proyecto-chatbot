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
   3. LÓGICA DEL CHATBOT (CON VERCEL BACKEND)
   ========================================== */

// Función para abrir y cerrar la ventana del chat
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('hidden');
    }
}

// Función principal para enviar el mensaje a tu servidor en Vercel
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
        // Enviar la petición a tu archivo seguro en Vercel (/api/chat)
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensajeUsuario: messageText 
            })
        });

        const textoCrudo = await response.text();
        console.log("Vercel nos está respondiendo esto:", textoCrudo);
        const data = JSON.parse(textoCrudo);

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
        
        // Mensaje de error para el usuario
        const errorMsg = document.createElement('p');
        errorMsg.className = 'bot-msg';
        errorMsg.style.color = 'red';
        errorMsg.innerHTML = `<em>Ups, hubo un problema de conexión. Asegúrate de estar corriendo esto en Vercel.</em>`;
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