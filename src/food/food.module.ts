import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}