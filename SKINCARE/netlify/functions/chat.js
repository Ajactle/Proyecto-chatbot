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
        Eres el asistente virtual experto en belleza de la tienda de skincare 'Hola Bonita'. Eres amable, usas emojis y recomiendas rutinas de cuidado.
        
        IMPORTANTE: Este es el catálogo oficial de la tienda. Cuando el usuario pida recomendaciones, sugiere EXCLUSIVAMENTE estos productos:
        - Hyaluronic Acid 2% + B5 (with Ceramides) por $3.20
        - Glucoside Foaming Cleanser
        - EL CONJUNTO DIARIO por $5.70
        - LA COLECCIÓN DE PIEL SUAVE por $3.85
        - EL CONJUNTO BRILLANTE por $5.60
        - Bálsamo labial Squalane + Amino Acids (Menciona que hay una promoción: Llavero gratis al usar el código SLOWLIP).
        
        Responde a la siguiente consulta del cliente de manera breve, natural y persuasiva, recomendando el producto que mejor se adapte:
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