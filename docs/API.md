# CloudHost API Documentation

## Authentication
All API endpoints (except auth) require a Bearer token.
```
Authorization: Bearer <access_token>
```

### Auth Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login
POST   /api/auth/refresh        - Refresh tokens
GET    /api/auth/me             - Get current user
PUT    /api/auth/password       - Change password
POST   /api/auth/api-key        - Generate API key
POST   /api/auth/verify-email   - Verify email
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
```

### Domains
```
GET    /api/domains/search          - Search domains
POST   /api/domains/register        - Register domain
GET    /api/domains                 - List user domains
GET    /api/domains/:id             - Get domain details
PUT    /api/domains/:id/nameservers - Update nameservers
PUT    /api/domains/:id/privacy     - Toggle WHOIS privacy
PUT    /api/domains/:id/autorenew   - Toggle auto-renew
POST   /api/domains/check-transfer  - Check domain transfer
```

### Hosting
```
GET    /api/hosting/plans       - List available plans
POST   /api/hosting/subscribe   - Subscribe to plan
GET    /api/hosting             - List user plans
GET    /api/hosting/:id         - Get plan details
PUT    /api/hosting/:id/cancel  - Cancel plan
```

### Payments
```
POST   /api/payments/stripe/create-intent  - Create payment intent
POST   /api/payments/stripe/confirm        - Confirm payment
POST   /api/payments/paypal/create-order   - Create PayPal order
POST   /api/payments/paypal/capture        - Capture PayPal payment
GET    /api/payments/history               - Payment history
```

### DNS
```
GET    /api/dns/:domain           - Get DNS records
POST   /api/dns/:domain/records   - Add DNS record
PUT    /api/dns/:domain/records/:id - Update DNS record
DELETE /api/dns/:domain/records/:id - Delete DNS record
```

### AI
```
POST   /api/ai/generate-website  - Generate website with AI
POST   /api/ai/chat              - Chat with AI assistant
POST   /api/ai/generate-dns      - Generate DNS configuration
POST   /api/ai/analyze-code      - Analyze code for errors
POST   /api/ai/detect-errors     - Detect errors from logs
```

### SSL
```
POST   /api/ssl/request/:domainId  - Request SSL certificate
POST   /api/ssl/renew/:domainId    - Renew SSL
GET    /api/ssl/status/:domainId   - Get SSL status
POST   /api/ssl/hosting/:planId    - Enable SSL for hosting
```

### Admin (requires admin role)
```
GET    /api/admin/dashboard     - Dashboard stats
GET    /api/admin/users         - List users
GET    /api/admin/users/:id     - User details
PUT    /api/admin/users/:id     - Update user
GET    /api/admin/plans         - List all plans
PUT    /api/admin/plans/:id/suspend - Suspend plan
GET    /api/admin/tickets       - List support tickets
GET    /api/admin/payments      - List payments
GET    /api/admin/revenue       - Revenue statistics
```

## WebSocket Events
```
Connection: ws://localhost:5000
Auth: { token: "Bearer <access_token>" }

Events:
  join:hosting(planId)      - Join hosting room
  server:metrics(data)      - Real-time metrics
  deployment:log(data)      - Deployment logs
  terminal:input(data)      - Web terminal input
  terminal:output(data)     - Web terminal output
  ai:chat(data)             - AI chat message
  ai:response(data)         - AI response
```
