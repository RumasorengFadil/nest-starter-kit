import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password: string | null; // hashed

  @Column({ default: 'local' })
  provider: 'local' | 'google';

  @Column({ nullable: true })
  providerId: string | null; // google id

  @Column({ nullable: true })
  refreshTokenHash: string | null; // hashed refresh token
}
