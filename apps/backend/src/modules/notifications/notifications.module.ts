import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [NotificationsGateway, FirebaseService],
  exports: [NotificationsGateway, FirebaseService],
})
export class NotificationsModule {}