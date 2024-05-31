import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerOperationsService } from './docker-operations.service';
import { HealthCheckService } from './health-check.service';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [AppController],
  providers: [AppService, DockerOperationsService, HealthCheckService],
})
export class AppModule {}
