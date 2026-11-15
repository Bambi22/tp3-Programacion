# Gestión de vehículos, conductores y viajes

Aplicación web para registrar los vehículos de una empresa de transporte, sus conductores y los viajes realizados. Trabajo Práctico N.º 3 – Programación IV (UTN FRLR).

## Tecnologías

- **Frontend:** Vite + React (JavaScript), React Router, CSS puro, `fetch`.
- **Backend:** Node.js + Express, MySQL (`mysql2`), `express-validator`.
- **Autenticación:** JWT (expira a las 4 horas) verificado con Passport (`passport-jwt`). Contraseñas encriptadas con `bcrypt`.

## Estructura

```
backend/
  database/schema.sql   Definición de las tablas
  http/                 Archivos .http para probar la API
  src/                  config, middlewares, routes y app.js
frontend/
  src/
    components/         Navbar, ProtectedRoute
    pages/              Home, Login, Vehiculos, Conductores, Viajes
    services/api.js     Capa de fetch con token JWT
```

## Instalación

### 1. Base de datos

Con MySQL en ejecución, ejecutar el script:

```
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend

```
cd backend
npm install
```

Copiar `.env.example` a `.env` y completar los valores (datos de MySQL y secreto JWT). Luego:

```
npm run dev
```

La API queda en `http://localhost:3000/api`.

### 3. Frontend

```
cd frontend
npm install
```

Crear `frontend/.env` con:

```
VITE_API_URL=http://localhost:3000/api
```

Luego:

```
npm run dev
```

La aplicación queda en `http://localhost:5173`.

## Uso

1. Registrarse o iniciar sesión desde la página de login.
2. Gestionar vehículos y conductores (alta, modificación y baja).
3. Registrar viajes