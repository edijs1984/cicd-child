import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics(@Res() response: Response) {
    response.set('Content-Type', register.contentType);
    register.metrics().then((metrics) => {
      response.send(metrics);
    });
  }
}
