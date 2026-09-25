// Relay de audio: el navegador solo habla con este endpoint (https, mismo
// origen que la página), y este edge function es quien se conecta por http
// al servidor Shoutcast real. Como esa conexión ocurre servidor-a-servidor
// (no en el navegador), las reglas de "contenido mixto" no aplican aquí:
// así logramos que el audio suene embebido en la página, sin abrir pestañas
// ni redirigir a otro sitio.

const UPSTREAM = "http://srv1.goodsoundstream.com:3137";

export default async (request) => {
      let upstream;
      try {
              upstream = await fetch(UPSTREAM, {
                        headers: { "Icy-MetaData": "0" },
              });
      } catch (err) {
              return new Response("No se pudo conectar con la señal de la radio.", {
                        status: 502,
                        headers: { "Access-Control-Allow-Origin": "*" },
              });
      }

      if (!upstream.ok || !upstream.body) {
              return new Response("La radio no está transmitiendo en este momento.", {
                        status: 502,
                        headers: { "Access-Control-Allow-Origin": "*" },
              });
      }

      return new Response(upstream.body, {
              status: 200,
              headers: {
                        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Access-Control-Allow-Origin": "*",
                        "Accept-Ranges": "none",
                        "Connection": "keep-alive",
                        "X-Content-Type-Options": "nosniff",
              },
      });
};

export const config = { path: "/radio-relay" };
