// src/main.ts (CORRECTED CORS LIST)
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); 

  // --- CORS FIX: Allowing the correct IP from the browser screenshot ---
  const allowedOrigins = [
    // NEW: The IP the browser is actually using, based on the screenshot
    'http://192.168.1.35:3000', 
    
    // OLD: You can keep these as backups
    'http://10.18.95.24:3000', 
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  // --------------------------------------------------------

  await app.listen(8000); 
  console.log(`Application is running on: http://localhost:8000`);
}
bootstrap();