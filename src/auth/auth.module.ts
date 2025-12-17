// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { JwtStrategy } from './jwt.strategy'; // Custom strategy

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'YOUR_JWT_SECRET_KEY', // <-- IMPORTANT: Change this!
      signOptions: { expiresIn: '60s' }, // Access token expiry
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // JwtStrategy is needed for protected routes
  exports: [AuthService], // Export if other modules need to use AuthService
})
export class AuthModule {}