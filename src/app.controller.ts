import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { DockerOperationsService } from './docker-operations.service';
import { HealthCheckService } from './health-check.service';
import { Request, Response } from 'express';

@Controller('dockerhub')
export class AppController {
  constructor(
    private dockerOperationsService: DockerOperationsService,
    private healthCheckService: HealthCheckService,
  ) {}

  @Get('/health/check')
  async healthCheck(@Res() res: Response) {
    res.send('OK');
  }

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    // const token = req.query.token;
    // const SECRET_TOKEN = process.env.SECRET_TOKEN;

    // if (!token || token !== SECRET_TOKEN) {
    //   console.error('Invalid token', token);
    //   return res.status(HttpStatus.FORBIDDEN).send('Invalid or missing token.');
    // }
    // console.info('token ok');

    const tag = req.body.push_data?.tag;
    if (!tag) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('No tag specified in the push data.');
    }
    console.info('tag ok');
    const imageName = req.body.repository?.repo_name;
    if (!imageName) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Repository name not provided in the push data.');
    }
    console.info('imageName ok');

    const serviceName = imageName.split('/').pop();
    const dockerServiceName = serviceName.replace('scilove-', '');

    try {
      await this.dockerOperationsService.updateService(dockerServiceName, tag);

      await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds
      console.info('Waiting for container to start...');
      const isRunning = await this.healthCheckService.isContainerRunning(
        process.env[dockerServiceName + '_url'],
      );
      if (!isRunning) {
        throw new Error('Container is not running after update.');
      }

      console.info(
        'update process completed successfully -' +
          dockerServiceName +
          ' - ' +
          tag,
      );
      res.send('Container updated and running successfully.');
    } catch (error) {
      console.error('Error during operation:', error.message);
      await this.dockerOperationsService.rollbackToPreviousTag(
        dockerServiceName,
        tag,
      );
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Operation failed, rollback initiated.');
    }
  }
}
