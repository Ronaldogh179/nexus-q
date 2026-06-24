import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba de carga para ISO 25000 (Eficiencia)
export const options = {
  stages: [
    { duration: '15s', target: 20 },  // Rampa de subida: 20 usuarios en 15s
    { duration: '30s', target: 50 },  // Estrés sostenido: 50 usuarios concurrentes
    { duration: '15s', target: 0 },   // Rampa de bajada: volver a 0
  ],
  thresholds: {
    // Criterios de aceptación estrictos
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones debe tardar menos de 500ms
    http_req_failed: ['rate<0.01'],   // Tasa de error máxima permitida: 1%
  },
};

// Comportamiento del usuario virtual (VU)
export default function () {
  const url = 'https://nexus-q.vercel.app/'; 
  
  const res = http.get(url);

  check(res, {
    'status es 200 (OK)': (r) => r.status === 200,
    'tiempo de respuesta < 500ms': (r) => r.timings.duration < 500,
  });

  // Pausa de 1 segundo entre peticiones para simular comportamiento humano
  sleep(1);
}
