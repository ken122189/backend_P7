import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // Assuming you have a UsersModule

@Module({
  imports: [
    AuthModule, // <--- **This is the FIX**
    UsersModule,
    // Add other modules here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}