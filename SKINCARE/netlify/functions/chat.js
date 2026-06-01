exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const API_KEY = process.env.GEMINI_API_KEY;
        
        // Diagnóstico: Verificar si la llave existe
        if (!API_KEY) {
            return { statusCode: 500, body: "Error: Falta GEMINI_API_KEY en Netlify" };
        }

        // USAMOS EL MODELO CORRECTO: gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hola" }] }]
            })
        });

        const data = await response.json();

        // Si la API responde con error, Netlify nos lo dirá aquí
        if (!response.ok) {
            return { statusCode: 500, body: JSON.stringify(data) };
        }

        return { statusCode: 200, body: JSON.stringify(data) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};