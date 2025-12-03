import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuthProvider } from '../provider/auth.provider';
import { VerificationToken } from 'src/modules/auth/domain/entities/verification-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type:'varchar'})
  name: string;

  @Column({ type: 'varchar', unique: true})
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null; // hashed

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  providerId: string | null; // google id

  @Column({ type: 'boolean', nullable: true })
  isEmailVerified: boolean | null; // google id

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null; // hashed refresh token

  @OneToMany(() => VerificationToken, (token) => token.user, {cascade:true})
  verificationTokens: VerificationToken[];
}
