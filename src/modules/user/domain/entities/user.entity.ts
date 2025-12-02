import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuthProvider } from '../provider/auth.provider';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password: string | null; // hashed

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId: string | null; // google id

  @Column({ nullable: true })
  refreshTokenHash: string | null; // hashed refresh token
}
