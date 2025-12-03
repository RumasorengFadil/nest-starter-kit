import { User } from 'src/modules/user/domain/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(() => User, user => user.verificationTokens)
  user: User;

  @Column({type:'timestamp'})
  expiresAt: Date;
}
