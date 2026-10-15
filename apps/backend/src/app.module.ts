import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api/{*path}'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      // Busca el .env tanto si ejecutas desde la raíz como desde apps/backend
      envFilePath: [
        join(process.cwd(), 'apps/backend/.env'),
        join(__dirname, '..', '.env'),
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres' as const,
          host: configService.get<string>(
            isProduction ? 'DB_PROD_HOST' : 'DB_HOST',
            'localhost',
          ),
          port: configService.get<number>(
            isProduction ? 'DB_PROD_PORT' : 'DB_PORT',
            5432,
          ),
          username: configService.get<string>(
            isProduction ? 'DB_PROD_USERNAME' : 'DB_USERNAME',
            'postgres',
          ),
          password: configService.get<string>(
            isProduction ? 'DB_PROD_PASSWORD' : 'DB_PASSWORD',
            '',
          ),
          database: configService.get<string>(
            isProduction ? 'DB_PROD_NAME' : 'DB_NAME',
            'tiamaria_db',
          ),
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
    UsersModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    InventoryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Guard global para requerir autenticación JWT por defecto
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Guard global para evaluar permisos con @Roles()
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}