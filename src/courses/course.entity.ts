import { Expose } from 'class-transformer';
import { unlink } from 'fs/promises';
import path from 'path';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeRemove,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  image: string;

  @Expose()
  get image_url() {
    if (!this.image) return null;
    return `${process.env.APP_URL}/uploads/courses/${this.image}`;
  }

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeRemove()
  async removeImageFile() {
    if (!this.image) return;

    const filePath = path.join(process.cwd(), 'uploads', 'courses', this.image);

    try {
      await unlink(filePath);
      console.log(`Image deleted: ${filePath}`);
    } catch (err) {
      console.log('Failed to delete file:', err);
    }
  }
}
