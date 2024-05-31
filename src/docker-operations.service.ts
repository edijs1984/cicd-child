import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';
const execAsync = promisify(exec);
@Injectable()
export class DockerOperationsService {
  private readonly COMPOSE_PATH = '/root/scilove-project/';
  private readonly ENV_FILE_PATH = `${this.COMPOSE_PATH}/.env`;

  async readEnvFile(filePath: string): Promise<any> {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    return env;
  }

  async writeEnvFile(filePath: string, env: any): Promise<void> {
    const content = Object.keys(env)
      .map((key) => `${key}=${env[key]}`)
      .join('\n');
    await fs.promises.writeFile(filePath, content, 'utf8');
  }

  async updateService(serviceName: string, tag: string): Promise<string> {
    const envConfig = await this.readEnvFile(this.ENV_FILE_PATH);
    envConfig[`${serviceName.toUpperCase()}_TAG`] = tag;
    await this.writeEnvFile(this.ENV_FILE_PATH, envConfig);

    const command = `cd ${this.COMPOSE_PATH} && docker-compose pull ${serviceName} && docker-compose up -d ${serviceName}`;
    const { stdout, stderr } = await execAsync(command);
    return stdout || stderr;
  }

  async rollbackToPreviousTag(
    serviceName: string,
    previousTag: string,
  ): Promise<string> {
    const envConfig = await this.readEnvFile(this.ENV_FILE_PATH);
    envConfig[`${serviceName.toUpperCase()}_TAG`] = previousTag;
    await this.writeEnvFile(this.ENV_FILE_PATH, envConfig);

    const command = `cd ${this.COMPOSE_PATH} && docker-compose pull ${serviceName} && docker-compose up -d ${serviceName}`;
    const { stdout, stderr } = await execAsync(command);
    return stdout || stderr;
  }
}
