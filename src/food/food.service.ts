import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class FoodService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Pool) {}

  async createFood(food_name: string, price: number, category: string) {
    const [result]: any = await this.db.execute(
      'INSERT INTO food_items (food_name, price, category) VALUES (?, ?, ?)',
      [food_name, price, category],
    );
    return { food_id: result.insertId, food_name, price, category };
  }

  async getAll() {
    const [rows] = await this.db.execute('SELECT * FROM food_items');
    return rows;
  }

  async findById(food_id: number) {
    const [rows]: any = await this.db.execute('SELECT * FROM food_items WHERE food_id = ?', [food_id]);
    if (!rows.length) {
      throw new NotFoundException(`Food item with ID ${food_id} not found`);
    }
    return rows[0];
  }

  async updateFood(food_id: number, body: { food_name?: string; price?: number; category?: string }) {
    await this.findById(food_id);
    const fields: string[] = [];
    const values: any[] = [];

    if (body.food_name !== undefined) {
      fields.push('food_name = ?');
      values.push(body.food_name);
    }
    if (body.price !== undefined) {
      fields.push('price = ?');
      values.push(body.price);
    }
    if (body.category !== undefined) {
      fields.push('category = ?');
      values.push(body.category);
    }

    if (fields.length === 0) {
      return this.findById(food_id);
    }

    values.push(food_id);
    await this.db.execute(`UPDATE food_items SET ${fields.join(', ')} WHERE food_id = ?`, values);
    return this.findById(food_id);
  }

  async deleteFood(food_id: number) {
    await this.findById(food_id);
    await this.db.execute('DELETE FROM food_items WHERE food_id = ?', [food_id]);
    return { message: `Food item with ID ${food_id} deleted successfully` };
  }
}