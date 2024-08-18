import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CrediFlow - API')
    .setDescription(
      `CrediFlow API is a lightweight backend application developed using NestJS, Prisma, and PostgreSQL.`,
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'authorization',
    );

  // split by comma and add multiple servers
  const serverSwagger =
    process.env.SWAGGER_SERVER_URL || 'http://localhost:3000|Localhost';
  serverSwagger.split(',').forEach((server) => {
    const [url, name] = server.split('|');
    config.addServer(url, name);
  });

  const document = SwaggerModule.createDocument(app, config.build());
  const apiSpec = process.env.SWAGGER_API_SPEC || 'documentation';
  SwaggerModule.setup(apiSpec, app, document);
}
