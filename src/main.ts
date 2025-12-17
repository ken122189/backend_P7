import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); 

  // --- CORS SETTINGS ---
  // In production, 'origin: true' reflects the request origin, which is 
  // safer for testing multiple frontend sources.
  app.enableCors({
    origin: true, 
    credentials: true,
  });

  // --- RENDER FIX: DYNAMIC PORT & HOST BINDING ---
  // 1. Render assigns a port dynamically (usually 10000). 
  // 2. We must bind to '0.0.0.0' so the external world can reach the app.
  const port = process.env.PORT || 8000; 

  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();