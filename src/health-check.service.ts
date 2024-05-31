import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HealthCheckService {
  async isContainerRunning(serviceUrl: string): Promise<boolean> {
    try {
      const response = await axios.get(serviceUrl);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
