import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    }
    return this.transporter;
  }

  static async sendMail(to: string, subject: string, html: string) {
    try {
      await this.getTransporter().sendMail({
        from: `"CloudHost" <${config.smtp.from}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  static async sendVerificationEmail(email: string, token: string) {
    const url = `${config.frontendUrl}/verify-email?token=${token}`;
    await this.sendMail(email, 'Verifica tu correo - CloudHost', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">CloudHost</h1>
        <h2>Verifica tu dirección de correo</h2>
        <p>Gracias por registrarte en CloudHost. Para activar tu cuenta, verifica tu correo electrónico:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #6C63FF; color: white; text-decoration: none; border-radius: 8px;">
          Verificar correo
        </a>
        <p style="margin-top: 20px; color: #666;">O copia este enlace: ${url}</p>
        <p style="color: #999; font-size: 12px;">Este enlace expira en 24 horas.</p>
      </div>
    `);
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    await this.sendMail(email, 'Restablece tu contraseña - CloudHost', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">CloudHost</h1>
        <h2>Restablece tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #6C63FF; color: white; text-decoration: none; border-radius: 8px;">
          Restablecer contraseña
        </a>
        <p style="margin-top: 20px; color: #666;">Si no solicitaste esto, ignora este correo.</p>
        <p style="color: #999; font-size: 12px;">Este enlace expira en 1 hora.</p>
      </div>
    `);
  }

  static async sendInvoice(email: string, amount: number, description: string, invoiceUrl?: string) {
    await this.sendMail(email, 'Recibo de pago - CloudHost', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">CloudHost</h1>
        <h2>Confirmación de pago</h2>
        <p>Hemos recibido tu pago correctamente.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Monto:</strong> $${amount.toFixed(2)} USD</p>
          <p><strong>Concepto:</strong> ${description}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        ${invoiceUrl ? `<a href="${invoiceUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #6C63FF; color: white; text-decoration: none; border-radius: 8px;">Ver factura</a>` : ''}
      </div>
    `);
  }

  static async sendWelcomeEmail(email: string, name: string) {
    await this.sendMail(email, 'Bienvenido a CloudHost', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C63FF;">¡Bienvenido a CloudHost!</h1>
        <p>Hola ${name},</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
        <ul>
          <li>Registrar dominios</li>
          <li>Contratar hosting</li>
          <li>Construir sitios web con IA</li>
          <li>Gestionar DNS y correos</li>
        </ul>
        <a href="${config.frontendUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6C63FF; color: white; text-decoration: none; border-radius: 8px;">
          Ir al panel
        </a>
      </div>
    `);
  }
}
