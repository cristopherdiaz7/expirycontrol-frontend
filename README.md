# ExpiryControl — Frontend

Aplicación de ExpiryControl para registrar productos con su cantidad y fecha de vencimiento, y ver de un vistazo cuáles están vencidos, por vencer o vigentes. Cada usuario ve solo sus propios productos.

Está hecha con Expo y React Native, y funciona en el navegador (Expo Web), en Android y en iOS.

Necesita el backend en ejecución: [expirycontrol-backend](https://github.com/cristopherdiaz7/expirycontrol-backend). Ahí están documentados los endpoints, la autenticación y las reglas de vencimiento.

## Contenido

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Cómo ejecutar](#cómo-ejecutar)
- [Pantallas y funcionalidades](#pantallas-y-funcionalidades)
- [Sesión](#sesión)
- [Fechas y vencimientos](#fechas-y-vencimientos)
- [Tests](#tests)
- [Pruebas manuales](#pruebas-manuales)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Problemas frecuentes](#problemas-frecuentes)

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Expo SDK 53, React Native 0.79, React 19 |
| Web | react-native-web |
| Lenguaje | JavaScript |
| Almacenamiento local | AsyncStorage |
| Peticiones HTTP | `fetch` |
| Tipografía e iconos | Inter (`@expo-google-fonts/inter`) e iconos Feather (`@expo/vector-icons`) |
| Tests | Jest con el preset de Expo |

No usa librerías de navegación ni de componentes: la navegación se resuelve con estado y los estilos con `StyleSheet`, a partir de un único archivo de diseño (`constants/theme.js`).

## Requisitos

- **Node.js 20 o superior** (incluye `npm`). El proyecto se desarrolló con Node.js 24.
- El **backend de ExpiryControl en ejecución** (por defecto en `http://localhost:8080`).
- Para dispositivo físico: la app **Expo Go** en el teléfono.
- Para emulador de Android: **Android Studio** con un dispositivo virtual.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/cristopherdiaz7/expirycontrol-frontend.git
cd expirycontrol-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

```bash
# Linux / macOS / Git Bash
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

El archivo tiene una sola variable, la dirección del backend:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

El valor correcto depende de dónde se ejecute la app (ver [Cómo ejecutar](#cómo-ejecutar)). El archivo `.env` no se versiona.

> La variable se lee al compilar. **Después de cambiarla hay que reiniciar Expo limpiando la caché:** `npx expo start -c`.

## Cómo ejecutar

| Dónde | Valor de `EXPO_PUBLIC_API_URL` | Comando | Estado |
|---|---|---|---|
| Expo Web | `http://localhost:8080` | `npm run web` | Probado |
| Emulador de Android | `http://10.0.2.2:8080` | `npm run android` | No verificado |
| Dispositivo físico | `http://<IP-de-la-PC>:8080` | `npm start` | No verificado |

"No verificado" significa que los pasos son los habituales de Expo, pero no se probaron en este proyecto.

### Expo Web

```bash
npm run web
```

Abre la aplicación en `http://localhost:8081`. Es el entorno en el que se desarrolló y se probó la app.

### Emulador de Android

1. Abrir Android Studio y encender un dispositivo virtual desde *Device Manager*.
2. En `.env`, usar la dirección con la que el emulador ve a la PC:

   ```
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
   ```

   `10.0.2.2` es una dirección fija del emulador de Android; no hay que averiguarla. Dentro del emulador, `localhost` es el propio teléfono virtual.
3. Ejecutar:

   ```bash
   npx expo start -c --android
   ```

   Expo instala Expo Go en el emulador y abre la app.

### Dispositivo físico

1. Conectar el teléfono a la **misma red Wi-Fi** que la PC.
2. Instalar **Expo Go** desde la tienda de aplicaciones.
3. Averiguar la IP de la PC (`ipconfig` en Windows, `ifconfig` o `ip addr` en Linux y macOS) y usarla en `.env`:

   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.35:8080
   ```

4. Ejecutar:

   ```bash
   npx expo start -c
   ```

5. Escanear el código QR: en Android desde Expo Go, en iPhone con la cámara.

A tener en cuenta:

- **Firewall:** la PC debe permitir conexiones entrantes a los puertos 8080 (backend) y 8081 (Expo) en redes privadas.
- **Versión de Expo Go:** la versión de las tiendas solo abre proyectos del SDK más reciente. Este proyecto usa el SDK 53; si Expo Go lo rechaza por incompatible, en Android se puede instalar la versión correspondiente desde [expo.dev/go](https://expo.dev/go).
- **CORS:** no hace falta cambiar nada en el backend. CORS solo aplica a navegadores; la app en el teléfono o en el emulador no pasa por esa restricción.

Con la IP de la PC en `.env` también funciona Expo Web, así que sirve para probar ambos a la vez.

## Pantallas y funcionalidades

### Login

- Ingreso con email y contraseña.
- Los errores se muestran debajo de cada campo; si las credenciales son incorrectas, aparece un mensaje en el formulario.
- Enlace a la pantalla de registro.

### Registro

- Alta con nombre, email, contraseña y confirmación.
- Valida el formato del email, el mínimo de 6 caracteres y que ambas contraseñas coincidan.
- Al terminar vuelve al login con un aviso de cuenta creada.

### Inicio

Tiene cuatro secciones, que se cambian desde una barra de navegación flotante: arriba en PC y abajo en móvil.

| Sección | Qué muestra |
|---|---|
| **Resumen** | Cuatro contadores (Total, Vencidos, Por vencer, Vigentes), un panel que indica si hay productos que revisar y accesos rápidos |
| **Productos** | Todos los productos, con botón para agregar |
| **Vencidos** | Los productos cuya fecha ya pasó o es hoy |
| **Por vencer** | Los que vencen en los próximos 3, 7 o 14 días, según el filtro elegido |

Cada producto se muestra en una tarjeta con nombre, categoría, descripción, fecha, cantidad, una etiqueta de estado (Vencido, Por vencer o Vigente) y botones para editar y eliminar.

### Formulario de producto

- Sirve para crear y para editar.
- Campos: nombre, descripción, categoría, cantidad (entero, 0 o mayor) y vencimiento (`AAAA-MM-DD`).
- Valida cada campo antes de enviar.

### Avisos y confirmaciones

- Los resultados de cada operación aparecen como un aviso temporal en la parte superior.
- Eliminar un producto pide confirmación en un diálogo.
- Ambos funcionan igual en Web, Android e iOS.

## Sesión

1. **Login:** el backend devuelve un token JWT y los datos del usuario.
2. **Almacenamiento:** se guardan en AsyncStorage bajo la clave `expirycontrol_session`. En el navegador, AsyncStorage usa `localStorage`.
3. **Uso:** cada petición envía el token en la cabecera `Authorization: Bearer <token>`.
4. **Recuperación:** al abrir la app, si hay una sesión guardada se entra directo al Inicio.
5. **Sesión vencida:** el token dura una hora. Cuando el backend responde `401` a una petición con token, la app borra la sesión, vuelve al login y muestra el aviso "Tu sesión expiró. Inicia sesión nuevamente." Esto vale para todas las pantallas, incluido el formulario.
6. **Cierre de sesión:** el botón "Cerrar sesión" borra la sesión guardada y vuelve al login.

El token se guarda sin cifrar. Es aceptable para desarrollo; una versión de producción para móviles debería usar almacenamiento seguro del dispositivo.

## Fechas y vencimientos

- La app envía al backend la **fecha local del dispositivo** (parámetro `today`) en las consultas de vencidos, por vencer y estadísticas. Así los resultados corresponden al día del usuario y no al del servidor, que trabaja en UTC.
- Las etiquetas de las tarjetas siguen las mismas reglas que el backend:

  | Etiqueta | Regla |
  |---|---|
  | Vencido | La fecha es hoy o anterior |
  | Por vencer | Vence dentro de los días del filtro elegido (3, 7 o 14) |
  | Vigente | Vence más adelante |

- El filtro de días se aplica en la pestaña "Por vencer" y también cambia los contadores del Resumen.
- Si la fecha del dispositivo difiere más de un día de la real, el backend rechaza la consulta y la app muestra el error.

## Tests

```bash
npm test
```

No necesitan el backend ni el archivo `.env`.

| Archivo | Tests | Qué cubre |
|---|---|---|
| `__tests__/api.test.js` | 13 | Armado de peticiones, envío del token y mensajes para cada error (400, 401 con y sin token, 404, 409, 500 y falla de conexión) |
| `__tests__/dates.test.js` | 11 | Fecha local, validación de fechas y cálculo de días |
| `__tests__/productsService.test.js` | 8 | Rutas y métodos del CRUD, y envío de `today` y `days` |

Total: 32 tests.

Los tests cubren la lógica que no depende de la pantalla. La interfaz se verifica con las pruebas manuales de la sección siguiente.

## Pruebas manuales

Con el backend y la app en ejecución:

**Registro y login**

1. Registro con campos vacíos: aparece un error debajo de cada campo.
2. Registro con contraseñas distintas: error en "Confirmar contraseña".
3. Registro correcto: vuelve al login con el aviso "Cuenta creada".
4. Registro con un email ya usado: "Ya existe una cuenta con ese email."
5. Login con contraseña incorrecta: "Email o contraseña incorrectos".
6. Login correcto: entra al Inicio y saluda con el nombre del usuario.

**Productos**

7. Crear un producto: aviso "Operación completada" y aparece en la lista.
8. Crear con fecha inexistente (`2026-02-30`): error en el campo de vencimiento.
9. Editar un producto: los cambios se ven en la tarjeta.
10. Eliminar y elegir "Cancelar": el producto sigue en la lista.
11. Eliminar y confirmar: el producto desaparece y se muestra el aviso.

**Vencimientos y estadísticas**

12. Crear un producto que vence hoy: figura en "Vencidos" con la etiqueta "Vencido".
13. Crear uno que vence en 5 días: con el filtro en 7 o 14 días figura en "Por vencer"; con el filtro en 3 días pasa a "Vigente".
14. Los contadores del Resumen coinciden con la cantidad de productos de cada pestaña.

**Sesión**

15. Recargar la página con la sesión iniciada: sigue en el Inicio.
16. Cerrar sesión: vuelve al login, sin aviso.
17. Sesión vencida: esperar una hora, o borrar el token desde las herramientas del navegador, y realizar cualquier acción. Debe volver al login con el aviso de sesión vencida.

**Aislamiento**

18. Iniciar sesión con otro usuario: no se ven los productos del primero.

**Errores**

19. Detener el backend y recargar: aparece "No se pudo conectar con el servidor." con el botón "Reintentar".

## Estructura del proyecto

```
expirycontrol-frontend/
├── App/
│   └── index.js               Raíz: decide qué pantalla mostrar y maneja la sesión
├── screens/
│   ├── loginScreen.js         Inicio de sesión
│   ├── RegisterScreen.js      Registro
│   └── HomeScreen.js          Resumen, Productos, Vencidos y Por vencer
├── components/
│   ├── AppBackground.js       Fondo de la aplicación
│   ├── AuthLayout.js          Estructura común de Login y Registro
│   ├── Brand.js               Logo y nombre
│   ├── FeedbackProvider.js    Avisos y diálogo de confirmación
│   ├── FormMessage.js         Mensaje de error dentro de un formulario
│   ├── NavBar.js              Navegación flotante (superior en PC, inferior en móvil)
│   ├── ProductCard.js         Tarjeta de producto con su estado
│   ├── ProductForm.js         Formulario para crear y editar
│   ├── StatCard.js            Contador del Resumen
│   ├── TextField.js           Campo de texto con icono y error
│   └── customButton.js        Botón
├── services/
│   ├── api.js                 Peticiones HTTP, token y mensajes de error
│   ├── authService.js         Registro y login
│   ├── productsService.js     CRUD, vencimientos y estadísticas
│   └── sessionService.js      Guardado de la sesión en AsyncStorage
├── utils/
│   ├── dates.js               Fecha local, validación y cálculo de días
│   └── useBreakpoint.js       Tamaño de pantalla (móvil, tablet, PC)
├── constants/
│   └── theme.js               Sistema visual: colores, tipografía, espaciados, radios y sombras
├── __tests__/                 Tests de servicios y utilidades
├── .env.example               Plantilla de la variable de entorno
├── app.json                   Configuración de Expo
└── package.json               Dependencias y scripts
```

### Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia Expo y muestra el código QR |
| `npm run web` | Inicia Expo y abre la app en el navegador |
| `npm run android` | Inicia Expo y abre la app en un emulador o dispositivo Android |
| `npm run ios` | Inicia Expo y abre la app en el simulador de iOS (requiere macOS) |
| `npm test` | Ejecuta los tests |

## Problemas frecuentes

**"No está configurada la URL del servidor."**

Falta el archivo `.env` o la variable `EXPO_PUBLIC_API_URL`. Crearlo a partir de `.env.example` y reiniciar con `npx expo start -c`.

**"No se pudo conectar con el servidor."**

- El backend no está en ejecución, o la dirección de `.env` no es la correcta para el entorno (ver [Cómo ejecutar](#cómo-ejecutar)).
- En un dispositivo físico: el teléfono no está en la misma red, o el firewall de la PC bloquea el puerto 8080.

**Cambié `.env` y la app sigue usando la dirección anterior**

La variable se incorpora al compilar. Reiniciar con `npx expo start -c`.

**En el navegador, la consola muestra un error de CORS**

La app se abrió desde un origen que el backend no permite. Por defecto permite `http://localhost:8081` y `http://localhost:19006`. Para agregar otro, ver la sección CORS del README del backend.

**La app vuelve al login con el aviso de sesión vencida**

Es el comportamiento esperado cuando el token cumple una hora, o cuando en el backend se cambió la clave de firma.

**Expo Go indica que el proyecto es incompatible**

La versión de Expo Go instalada no corresponde al SDK 53. Ver la nota en [Dispositivo físico](#dispositivo-físico).
