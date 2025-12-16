// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix so all API routes start with /api
  app.setGlobalPrefix('api'); 

  // --- CORS FIX: Allowing your client IP and localhost origins ---
  const allowedOrigins = [
    // Your CURRENT browser IP/Port (MUST be in the list)
    'http://10.18.95.24:3000', 
    // Localhost variations for testing
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  // --------------------------------------------------------

  // Server listens on the correct port: 8000
  await app.listen(8000); 
  console.log(`Application is running on: http://localhost:8000`);
}
bootstrap();