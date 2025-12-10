// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 

// Core Infrastructure
import { DatabaseModule } from './database/database.module'; 

// Feature Modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PositionsModule } from './positions/positions.module'; 

@Module({
    imports: [
        // Configuration Module - Loaded first and globally
        ConfigModule.forRoot({
            isGlobal: true, 
        }),
        
        // Core Infrastructure
        DatabaseModule, 
        
        // Feature Modules
        UsersModule,
        AuthModule,
        PositionsModule, 
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}