import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CategoryService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createCategory(category_code: string, category_name: string, id: string) {
    // const hashed = await bcrypt.hash(password, 10);

    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO category (category_code, category_name, id) VALUES (?, ?, ?)',
      [category_code, category_name, id],
    );
    return { id: result.insertId, category_code, category_name };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM category WHERE category_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM category',
    );
    return rows;
  }

  async updateCategory(id: number, partial: { category_code?: string; category_name?: string; id?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.category_code) {
      fields.push('category_code = ?');
      values.push(partial.category_code);
    }

    if (partial.category_name) {
      fields.push('category_name = ?');
      values.push(partial.category_name);
    }

    if (partial.id) {
      fields.push('id = ?');
      values.push(partial.id);
    }

    if (fields.length === 0) return await this.findById(id);
    values.push(id);
    const sql = `UPDATE category SET ${fields.join(', ')} WHERE category_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(id);
  }

  async deleteCategory(id: number) {
    const [res] = await this.pool().execute<OkPacket>('DELETE FROM category WHERE category_id = ?', [id]);
    return res.affectedRows > 0;
  }
}