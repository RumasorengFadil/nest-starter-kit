import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VerificationToken } from 'src/modules/auth/domain/entities/verification-token.entity';
import { Roles } from '../enums/roles.enum';
import { AuthProvider } from '../enums/auth-provider.enum';
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null; // hashed

  @Column({ type: 'enum', enum: Roles, nullable: true })
  role: Roles;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  /**
   * Returns full URL for the course image
   * - Uses APP_URL environment variable
   * - Returns null if no image is set
   */
  @Expose()
  get avatar_url() {
    if (!this.avatar) return null;
    return `${process.env.APP_URL}/uploads/auth/images/${this.avatar}`;
  }

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  provider_id: string | null; // google id

  @Column({ type: 'boolean', nullable: true })
  is_email_verified: boolean | null; // google id

  @Column({ type: 'varchar', nullable: true })
  refresh_token_hash: string | null; // hashed refresh token

  @OneToMany(() => VerificationToken, (token) => token.user, { cascade: true })
  verification_tokens: VerificationToken[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
