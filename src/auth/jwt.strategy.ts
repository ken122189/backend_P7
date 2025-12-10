// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_secret',
    });
  }

  // 🎯 FIX: Return the user ID under the key 'id' to match 
  // the req.user.id expected by the controller and the global types.
  async validate(payload: any) {
    // We assume payload.sub holds the user's primary ID.
    return { 
        // Changed from userId to id:
        id: payload.sub, 
        username: payload.username, 
        // Ensure you also include 'email' if your global types require it (TS2430 fix)
        email: payload.email, 
        role: payload.role 
    };
  }
}