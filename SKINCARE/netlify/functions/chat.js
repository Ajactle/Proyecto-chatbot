// FORMATO EXCLUSIVO PARA NETLIFY FUNCTIONS
exports.handler = async function(event, context) {
    // Solo permitimos peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método no permitido' };
    }

    try {
        // En Netlify, los datos llegan como texto, así que los convertimos a JSON
        const body = JSON.parse(event.body);
        const mensajeUsuario = body.mensajeUsuario;

        // Tomamos tu clave secreta de las variables de entorno de Netlify
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

       // LA MAGIA: Aquí le damos la memoria de tu catálogo a la IA
        const promptDelSistema = `
        Eres el asistente virtual experto en belleza y servicio al cliente de la tienda de skincare 'Hola Bonita'. Eres amable, usas emojis y ayudas a los clientes con sus compras y dudas.
        
        INFORMACIÓN DE LA TIENDA (Reglas estrictas para responder):
        - Ubicación: Estamos ubicados en Los Reyes, Veracruz.
        - Envíos: Tenemos envío gratuito a nivel mundial en pedidos superiores a $600.
        - Reembolsos/Garantía: Contamos con contrareembolso y una garantía del 100% de devolución de dinero.
        - Novedades: Para enterarse de las novedades y nuevas colecciones, invita al cliente a suscribirse a nuestro boletín informativo en la página.
        - Regalos: Ofrecemos tarjetas de regalo especiales que incluyen bonos con regalo.
        - Contacto/Atención: Nuestro servicio al cliente es 24/7. Pueden llamarnos al 2721201331 o escribir a SKINCARE@GMAIL.COM.
        - Reacciones Alérgicas: (MUY IMPORTANTE) Si el cliente pregunta por alergias, aconséjale siempre hacer una prueba de parche en una zona pequeña de la piel antes de usar el producto completo. Si presenta reacción, dile que suspenda el uso y consulte a su dermatólogo.
        
        CATÁLOGO DE PRODUCTOS:
        - Hyaluronic Acid 2% + B5 (with Ceramides) por $375 MXN
        - Glucoside Foaming Cleanser
        - EL CONJUNTO DIARIO por $480MXN
        - LA COLECCIÓN DE PIEL SUAVE por $280 MXN
        - EL CONJUNTO BRILLANTE por $275 MXN
        - Bálsamo labial Squalane + Amino Acids (Menciona que hay una promoción: Llavero gratis al usar el código SLOWLIP).
        
        Responde a la siguiente consulta del cliente de manera breve, natural y persuasiva:
        Cliente: ${mensajeUsuario}
        `;

        // Hacemos la petición a Google Gemini
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptDelSistema
                    }]
                }]
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Error en el servidor de Netlify:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al conectar con la IA' })
        };
    }
};