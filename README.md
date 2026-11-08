# Vuelos EZE · Frontend

Interfaz web para el sistema de predicción de cancelación de vuelos del
aeropuerto de Ezeiza (EZE). Está construida con Vite + React (JavaScript) y
consume la API Django REST del proyecto `Aerolineas_Backend`.

## Requisitos

- Node.js 20 o superior y npm.
- Python 3.12 o superior para correr el backend.
- El backend corriendo en `http://localhost:8000`.

## Levantar el backend

```bash
cd ../Aerolineas_Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py crear_grupos --crear-admin --usuario admin --password "TuClaveSegura123"
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000`. Para cargar vuelos
reales hace falta configurar `AVIATIONSTACK_API_KEY` en el `.env` del backend y
correr `python manage.py colectar_vuelos`.

## Levantar el frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Vite levanta la aplicación en `http://localhost:5173`.

## Variables de entorno

| Variable       | Descripción                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `VITE_API_URL` | Origen del backend (por ejemplo `http://localhost:8000`). Vacía = proxy.     |

Si `VITE_API_URL` queda vacía, todas las llamadas a `/api/...` pasan por el
proxy de Vite configurado en `vite.config.js` hacia `http://localhost:8000`.
Esto evita problemas de CORS durante el desarrollo. El archivo `.env` es
opcional: sin él, se usa el proxy.

## Scripts disponibles

- `npm run dev`: servidor de desarrollo con recarga en caliente.
- `npm run build`: compila la aplicación para producción en `dist/`.
- `npm run preview`: sirve la versión compilada.
- `npm run lint`: ejecuta Oxlint.

## Roles de la aplicación

- **Público**: inicio, listado de vuelos, búsqueda de vuelo, login y registro.
- **Pasajero** (usuario registrado): dashboard, comparación de rutas y alertas.
- **Administrador**: además, panel de estado de recolección y recolección manual.

Para crear un administrador se usa el comando del backend:

```bash
python manage.py crear_grupos --crear-admin --usuario admin --password "TuClaveSegura123"
```

## Estructura del proyecto

```text
src/
  api/          Cliente fetch con renovación automática de JWT y módulos por endpoint
  auth/         AuthContext y ProtectedRoute
  components/   Componentes reutilizables (layout, badges, tablas, modales, etc.)
  pages/        Pantallas de la aplicación
  styles/       Variables y estilos globales
  utils/        Utilidades compartidas
```

## Autenticación

Los tokens JWT se guardan en `localStorage`. El cliente de API agrega el header
`Authorization: Bearer <access>` y, ante un `401`, intenta renovar el access
token con el refresh una sola vez. Si la renovación falla, borra la sesión y
redirige a `/login`.
