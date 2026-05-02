import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private scoresRepository: Repository<Score>,
  ) {}

  async updateScore(userId: string, data: Partial<Score>): Promise<Score> {
    let score = await this.scoresRepository.findOne({ where: { userId } });

    if (!score) {
      score = this.scoresRepository.create({ userId, ...data });
    } else {
      // Merge new data
      if (data.highScore !== undefined && data.highScore > score.highScore) {
        score.highScore = data.highScore;
      }
      if (data.currentLevel !== undefined) {
        score.currentLevel = data.currentLevel;
      }
      if (data.tutorialDone !== undefined) {
        score.tutorialDone = data.tutorialDone;
      }
    }

    return this.scoresRepository.save(score);
  }

  async getScore(userId: string): Promise<Score | null> {
    return this.scoresRepository.findOne({ where: { userId } });
  }
}
