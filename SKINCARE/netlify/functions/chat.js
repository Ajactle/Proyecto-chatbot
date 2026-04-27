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

        // Hacemos la petición a Google Gemini
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Eres el asistente virtual de la tienda de skincare 'Hola Bonita'. Eres amable, usas emojis y recomiendas rutinas de cuidado. El usuario dice: ${mensajeUsuario}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // Le respondemos a tu página en el formato exacto que pide Netlify
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Error en el servidor de Netlify:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al conectar con la IA de Google' })
        };
    }
};