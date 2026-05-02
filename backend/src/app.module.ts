import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScoresModule } from './scores/scores.module';
import { Score } from './scores/score.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 4000,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'tanganku',
      entities: [Score],
      synchronize: true, // Auto-create tables (dev only)
    }),
    ScoresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
