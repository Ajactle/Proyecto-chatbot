exports.handler = async function(event, context) {
    // 1. Validar si es POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método no permitido' };
    }

    try {
        // 2. Verificar si hay cuerpo
        if (!event.body) {
            console.error("Error: El cuerpo de la petición está vacío");
            return { statusCode: 400, body: "Cuerpo vacío" };
        }

        const body = JSON.parse(event.body);
        const mensajeUsuario = body.mensajeUsuario;

        // 3. Verificar API Key
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error("ERROR CRÍTICO: GEMINI_API_KEY no encontrada en Netlify");
            return { statusCode: 500, body: "Error de configuración: API Key faltante" };
        }

        // 4. URL con el modelo corregido
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        // 5. La petición
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Eres el asistente de Hola Bonita. Cliente: " + mensajeUsuario }] }]
            })
        });

        // 6. Si Google responde con error, imprimimos QUÉ error es
        if (!response.ok) {
            const errorDetalle = await response.text();
            console.error("Google API respondió con error:", errorDetalle);
            return { statusCode: response.status, body: errorDetalle };
        }

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };

    } catch (error) {
        console.error("Error catastrofico en la funcion:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.toString() }) };
    }
};