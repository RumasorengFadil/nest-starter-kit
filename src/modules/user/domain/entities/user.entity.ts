import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuthProvider } from '../provider/auth.provider';
import { VerificationToken } from 'src/modules/auth/domain/entities/verification-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  password: string | null; // hashed

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ type: 'varbinary', nullable: true })
  providerId: string | null; // google id

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null; // hashed refresh token

  @OneToMany(() => VerificationToken, (token) => token.user)
  verificationTokens: VerificationToken[];
}
