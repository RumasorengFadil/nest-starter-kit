import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Course entity represents a single course in the system.
 * - Maps to 'course' table in the database
 * - Handles basic course information like title, description, image, and price
 */
@Entity()
export class Course {
  /** Unique identifier (UUID) for the course */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Title of the course */
  @Column()
  title: string;

  /** Optional description of the course */
  @Column({ nullable: true })
  description: string;

  /** Image filename for the course */
  @Column()
  image: string;

  /**
   * Returns full URL for the course image
   * - Uses APP_URL environment variable
   * - Returns null if no image is set
   */
  @Expose()
  get image_url() {
    if (!this.image) return null;
    return `${process.env.APP_URL}/uploads/${this.image}`;
  }

  /** Price of the course in local currency */
  @Column()
  price: number;

  /** Timestamp when the course was created */
  @CreateDateColumn()
  createdAt: Date;

  /** Timestamp when the course was last updated */
  @UpdateDateColumn()
  updatedAt: Date;
}
