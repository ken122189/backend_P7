// src/auth/auth.module.ts (CORRECTED VERSION)

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- NEW & CRUCIAL
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; 
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // FIX: Using JwtModule.registerAsync to correctly load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule], // 1. Import the configuration module
      useFactory: async (configService: ConfigService) => ({
        // 2. Load the ACCESS token secret and expiry from environment variables
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') || 'access_secret_fallback',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService], // 3. Inject the configuration service
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService, JwtModule], // Export JwtModule for use in JwtStrategy
})
export class AuthModule {}