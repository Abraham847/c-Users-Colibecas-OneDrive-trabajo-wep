import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AIService {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.openai) {
      if (!config.ai.apiKey) {
        logger.warn('OpenAI API key not configured, AI features will be mocked');
      }
      this.openai = new OpenAI({ apiKey: config.ai.apiKey || 'mock-key' });
    }
    return this.openai;
  }

  static async generateWebsite(prompt: string, style?: string) {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: `Eres un diseñador web experto. Genera código HTML/CSS/JS completo para un sitio web basado en la descripción del usuario.
            Estilo: ${style || 'moderno, profesional, responsive'}
            Devuelve SOLO código HTML completo con CSS embebido y JS si es necesario.
            Incluye diseño responsive, animaciones suaves y paleta de colores profesional.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const html = completion.choices[0]?.message?.content || '';
      return this.parseGeneratedSite(html);
    } catch (error: any) {
      logger.error('AI generation error:', error?.message);
      return this.generateMockSite(prompt, style);
    }
  }

  static async chatWithAI(message: string, context?: { role: string; content: string }[]) {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: `Eres CloudHost AI, un asistente experto en hosting, dominios y desarrollo web.
            Ayudas a usuarios con: configuración de servidores, DNS, SSL, correos, despliegues, y resolución de problemas técnicos.
            Responde en español de forma clara y profesional.`
          },
          ...(context || []),
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return {
        message: completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('AI chat error:', error?.message);
      return {
        message: this.getMockResponse(message),
        timestamp: new Date().toISOString(),
        mock: true,
      };
    }
  }

  static async generateDNSConfig(domain: string, type: string) {
    const configs: Record<string, string> = {
      basic: `Para ${domain}, configura estos registros DNS básicos:
A @ -> 192.168.1.1 (TTL: 3600)
CNAME www -> ${domain} (TTL: 3600)
MX @ -> mail.${domain} (Priority: 10, TTL: 3600)`,
      email: `Para correos en ${domain}:
MX @ -> mail.${domain} (Priority: 10)
TXT @ -> v=spf1 include:_spf.cloudhost.com ~all
CNAME mail -> mail.cloudhost.com`,
      security: `Seguridad para ${domain}:
TXT @ -> v=DMARC1; p=reject; rua=dmarc@${domain}
TXT _dmarc -> v=DMARC1; p=reject
CAA 0 issue "letsencrypt.org"`,
    };

    return configs[type] || configs.basic;
  }

  static async analyzeCode(code: string, language: string) {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un revisor de código experto. Analiza el código y encuentra errores, vulnerabilidades y mejoras posibles.'
          },
          { role: 'user', content: `Analiza este código ${language}:\n${code}` }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      return {
        analysis: completion.choices[0]?.message?.content || '',
        issues: [],
      };
    } catch {
      return { analysis: 'No se pudo analizar el código.', issues: [] };
    }
  }

  static async detectErrors(logs: string) {
    const errors = [];
    if (logs.includes('Error') || logs.includes('error')) errors.push({ type: 'error', line: 'unknown', message: 'Se detectaron errores en los logs' });
    if (logs.includes('Warning') || logs.includes('warning')) errors.push({ type: 'warning', line: 'unknown', message: 'Se detectaron advertencias' });
    if (logs.includes('Fatal')) errors.push({ type: 'critical', line: 'unknown', message: 'Error crítico detectado' });
    return errors.length ? errors : [{ type: 'info', message: 'No se detectaron errores' }];
  }

  private static parseGeneratedSite(html: string) {
    return {
      html,
      css: '',
      js: '',
      pages: [{ name: 'index', content: html }],
      preview: html.substring(0, 500),
    };
  }

  private static generateMockSite(prompt: string, style?: string) {
    const siteName = prompt.split(' ').slice(0, 3).join(' ') || 'Mi Sitio';
    const colors = style === 'dark' ? '#0a0a1a,#1a1a3e' : '#6C63FF,#ffffff';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} - CloudHost AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: ${style === 'dark' ? '#0a0a1a' : '#ffffff'}; color: ${style === 'dark' ? '#ffffff' : '#1a1a2e'}; }
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(135deg, ${style === 'dark' ? '#0a0a1a, #1a1a3e' : '#6C63FF, #3f3d9e'}); color: white;
      padding: 2rem; text-align: center; }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; animation: fadeInUp 0.8s ease; }
    .hero p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; animation: fadeInUp 1s ease; }
    .btn { display: inline-block; padding: 1rem 2rem; margin-top: 2rem; background: white; color: #6C63FF;
      text-decoration: none; border-radius: 50px; font-weight: bold; transition: transform 0.3s; animation: fadeInUp 1.2s ease; }
    .btn:hover { transform: translateY(-3px); }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
    .feature { padding: 2rem; border-radius: 16px; background: ${style === 'dark' ? '#1a1a3e' : '#f8f9ff'}; transition: transform 0.3s; }
    .feature:hover { transform: translateY(-5px); }
    @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <section class="hero">
    <h1>${siteName}</h1>
    <p>Un sitio web moderno y profesional creado con CloudHost AI</p>
    <a href="#features" class="btn">Descubrir más</a>
  </section>
  <section class="features" id="features">
    <div class="feature"><h3>🚀 Rápido</h3><p>Optimizado para máxima velocidad</p></div>
    <div class="feature"><h3>🔒 Seguro</h3><p>SSL y protección DDoS incluidos</p></div>
    <div class="feature"><h3>📱 Responsive</h3><p>Se ve perfecto en cualquier dispositivo</p></div>
  </section>
</body>
</html>`;

    return { html, css: '', js: '', pages: [{ name: 'index', content: html }], preview: html.substring(0, 500) };
  }

  private static getMockResponse(message: string): string {
    const responses: Record<string, string> = {
      dns: 'Para configurar DNS, ve a la sección DNS de tu dominio y agrega los registros necesarios (A, CNAME, MX).',
      ssl: 'Puedes activar SSL gratis desde el panel de tu dominio. Es automático con Let\'s Encrypt.',
      email: 'Para crear correos empresariales, ve a la sección Correos y selecciona "Crear cuenta".',
      deploy: 'El despliegue automático se configura desde la sección Despliegues, conectando tu repositorio de GitHub.',
      hosting: 'Recomiendo el plan Business para sitios profesionales: 10GB SSD, ancho de banda ilimitado y SSL gratis.',
    };

    for (const [key, resp] of Object.entries(responses)) {
      if (message.toLowerCase().includes(key)) return resp;
    }

    return `Entiendo tu consulta sobre "${message.substring(0, 50)}...". 
    Puedo ayudarte con: configuración de hosting, registro de dominios, DNS, SSL, correos empresariales, 
    despliegue de aplicaciones, y más. ¿Qué te gustaría hacer específicamente?`;
  }
}
