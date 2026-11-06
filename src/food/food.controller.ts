import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  async create(@Body() body: { food_name: string; price: number; category: string }) {
    return this.foodService.createFood(body.food_name, body.price, body.category);
  }

  @Get()
  async findAll() {
    return this.foodService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { food_name?: string; price?: number; category?: string },
  ) {
    return this.foodService.updateFood(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.foodService.deleteFood(id);
  }
}