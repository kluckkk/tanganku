import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { Score } from './score.entity';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post('update')
  updateScore(
    @Body() body: { userId: string } & Partial<Score>,
  ) {
    const { userId, ...data } = body;
    return this.scoresService.updateScore(userId, data);
  }

  @Get(':userId')
  getScore(@Param('userId') userId: string) {
    return this.scoresService.getScore(userId);
  }
}
