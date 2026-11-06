import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class OrdersService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Pool) {}

  async createOrder(user_id: number, food_id: number, quantity: number = 1) {
    // Automatically fetch food price to calculate total_amount
    const [foodRows]: any = await this.db.execute('SELECT price FROM food_items WHERE food_id = ?', [food_id]);
    if (!foodRows.length) {
      throw new NotFoundException(`Food item with ID ${food_id} not found`);
    }
    const price = Number(foodRows[0].price);
    const total_amount = price * quantity;

    const [result]: any = await this.db.execute(
      'INSERT INTO orders (user_id, food_id, quantity, total_amount) VALUES (?, ?, ?, ?)',
      [user_id, food_id, quantity, total_amount],
    );
    return { order_id: result.insertId, user_id, food_id, quantity, total_amount };
  }

  async getAll() {
    const [rows] = await this.db.execute(`
      SELECT o.*, u.user_name, f.food_name 
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN food_items f ON o.food_id = f.food_id
    `);
    return rows;
  }

  async findById(order_id: number) {
    const [rows]: any = await this.db.execute(`
      SELECT o.*, u.user_name, f.food_name 
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN food_items f ON o.food_id = f.food_id
      WHERE o.order_id = ?
    `, [order_id]);

    if (!rows.length) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }
    return rows[0];
  }

  async updateOrder(order_id: number, body: { user_id?: number; food_id?: number; quantity?: number }) {
    const currentOrder: any = await this.findById(order_id);

    const user_id = body.user_id !== undefined ? body.user_id : currentOrder.user_id;
    const food_id = body.food_id !== undefined ? body.food_id : currentOrder.food_id;
    const quantity = body.quantity !== undefined ? body.quantity : currentOrder.quantity;

    // Recalculate total amount if food item or quantity changes
    const [foodRows]: any = await this.db.execute('SELECT price FROM food_items WHERE food_id = ?', [food_id]);
    if (!foodRows.length) {
      throw new NotFoundException(`Food item with ID ${food_id} not found`);
    }
    const price = Number(foodRows[0].price);
    const total_amount = price * quantity;

    await this.db.execute(
      'UPDATE orders SET user_id = ?, food_id = ?, quantity = ?, total_amount = ? WHERE order_id = ?',
      [user_id, food_id, quantity, total_amount, order_id],
    );

    return this.findById(order_id);
  }

  async deleteOrder(order_id: number) {
    await this.findById(order_id);
    await this.db.execute('DELETE FROM orders WHERE order_id = ?', [order_id]);
    return { message: `Order with ID ${order_id} deleted successfully` };
  }
}