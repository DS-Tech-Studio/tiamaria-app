import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    // Evita inicializar si las credenciales son de prueba o incompletas
    if (
      !projectId ||
      !clientEmail ||
      !privateKey ||
      privateKey.includes('tu_key_aqui')
    ) {
      this.logger.warn(
        'Credenciales de Firebase incompletas o de prueba en .env. FCM permanecerá desactivado.',
      );
      return;
    }

    try {
      // Procesa formateo de saltos de línea
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin SDK inicializado exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al inicializar Firebase Admin SDK:', message);
      this.logger.warn('FCM permanecerá desactivado.');
    }
  }

  /**
   * Envía una notificación Push individual a un token FCM de dispositivo
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!getApps().length) {
      this.logger.warn('FCM no está activo. Se omitió el envío de la notificación Push.');
      return;
    }

    try {
      await getMessaging().send({
        token,
        notification: {
          title,
          body,
        },
        data,
      });
      this.logger.log(`Notificación Push enviada con éxito al token: ${token}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error enviando notificación Push a Firebase:', message);
    }
  }
}