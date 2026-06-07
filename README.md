# ☁️ CloudHost - Plataforma Completa de Alojamiento Web y Dominios

> Una plataforma todo-en-uno tipo Hostinger/GoDaddy/Vercel con IA integrada.

## ✨ Características

### 🌐 Dominios
- Búsqueda y registro de dominios (+100 TLDs)
- Gestión DNS completa (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA)
- Protección WHOIS privacidad
- Transferencia de dominios
- Auto-renovación

### 🖥️ Hosting
- **Compartido**: Starter, Business, Professional
- **VPS Cloud**: 2GB, 4GB, 8GB recursos dedicados
- Monitoreo de recursos en tiempo real
- SSL automático (Let's Encrypt)
- Backup diario/semanal
- Firewall y protección DDoS

### 🤖 AI Builder
- Genera sitios web completos con lenguaje natural
- Múltiples estilos visuales
- Código HTML/CSS/JS listo para publicar
- Vista previa en tiempo real

### 📧 Correos Empresariales
- Cuentas de correo profesional
- Webmail, IMAP, SMTP
- Anti-spam y auto-respondedor
- Gestión de alias y forwarders

### 📁 Administrador de Archivos
- Gestión visual de archivos
- Editor de código online
- Subida/descarga de archivos
- Creación de directorios

### 💳 Pagos
- Stripe (tarjetas)
- PayPal
- Suscripciones mensuales/anuales
- Facturación automática

### 🛡️ Seguridad
- SSL automático
- Protección DDoS
- Firewall de aplicaciones
- Monitoreo 24/7
- Autenticación 2FA

### 🎛️ Panel de Administración
- Gestión de usuarios
- Estadísticas del sistema
- Ingresos y facturación
- Tickets de soporte

## 🚀 Instalación

### Requisitos
- Node.js 20+
- MongoDB 7+
- Redis 7+ (opcional)
- Docker (opcional)

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repo-url> cloudhost
cd cloudhost

# 2. Instalar dependencias
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar MongoDB (local o Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7

# 5. Poblar la base de datos con planes iniciales
npm run seed

# 6. Iniciar en modo desarrollo
npm run dev
```

### Con Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ejecutar seed
docker exec cloudhost-backend npm run seed
```

## 📂 Estructura del Proyecto

```
cloudhost/
├── backend/                    # API REST
│   ├── src/
│   │   ├── config/            # Configuración
│   │   ├── middleware/        # Middleware (auth, validation)
│   │   ├── models/            # Modelos MongoDB
│   │   ├── routes/            # Rutas API
│   │   ├── services/          # Lógica de negocio
│   │   ├── ai/                # Servicios de IA
│   │   ├── websocket/         # WebSocket manager
│   │   └── utils/             # Utilidades
│   └── tests/                 # Tests
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── pages/             # Páginas
│   │   ├── services/          # API client
│   │   ├── store/             # Estado global
│   │   └── types/             # TypeScript types
│   └── public/                # Archivos estáticos
├── shared/                    # Tipos compartidos
├── docs/                      # Documentación
├── docker-compose.yml         # Orquestación Docker
└── nginx.conf                 # Proxy config
```

## 🔧 Comandos Útiles

```bash
npm run dev          # Iniciar frontend + backend
npm run build        # Compilar producción
npm run seed         # Poblar base de datos
npm run test         # Ejecutar tests
npm run migrate      # Ejecutar migraciones
npm run docker:up    # Iniciar con Docker
npm run docker:down  # Detener Docker
```

## 🔑 Credenciales por Defecto (desarrollo)

- **Admin**: admin@cloudhost.com / Admin123!
- **API**: `ch_` + 64 caracteres hex (generar desde /settings)

## 🧠 Funcionalidades IA

1. **AI Website Builder**: Describe tu sitio y la IA genera el código
2. **AI Chat Assistant**: Soporte técnico inteligente 24/7
3. **AI DNS Config**: Configuración DNS automática
4. **AI Code Analysis**: Revisión de código y detección de errores
5. **AI Error Detection**: Análisis de logs y detección de fallos

## 🌐 API

Documentación completa en `docs/API.md`

## 📋 Licencia

MIT
