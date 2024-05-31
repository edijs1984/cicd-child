import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Summary, register } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly httpRequestDuration: Histogram;

  constructor() {
    // Define a histogram metric
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 1.5, 10.5], // Define buckets for response times
    });
  }

  onModuleInit() {
    // Automatically collect default metrics
    // This includes node.js specific metrics like event loop lag, active handles, etc.
    require('prom-client').collectDefaultMetrics();
  }

  recordResponse(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }
}
