import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryColumn()
  userId: string;

  @Column({ default: 0 })
  highScore: number;

  @Column({ default: 1 })
  currentLevel: number;

  @Column({ default: false })
  tutorialDone: boolean;

  @UpdateDateColumn()
  lastUpdated: Date;
}
