import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get getMongodbUri(): string {
    return this.configService.get('MONGODB_URI');
  }

  get getRedisUri(): string {
    return this.configService.get('REDIS_URI');
  }

  get getAiBaseUrl(): string {
    return this.configService.get('AI_BASEURL');
  }

  get getPort(): number {
    return this.configService.get('PORT');
  }

  get getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  get getJwtExpire(): string {
    return this.configService.get('JWT_EXPIRE');
  }

  get getSaltRounds(): number {
    return this.configService.get('SALT_ROUNDS');
  }

  get getBucket(): string {
    return this.configService.get('BUCKET');
  }

  get getEndpoint(): string {
    return this.configService.get('ENDPOINT');
  }

  get getRegion(): string {
    return this.configService.get('REGION');
  }

  get getAccessKeyId(): string {
    return this.configService.get('ACCESS_KEY_ID');
  }

  get getSecretAccessKey(): string {
    return this.configService.get('SECRET_ACCESS_KEY');
  }

  get getBasePath(): string {
    return this.configService.get('BASE_PATH');
  }
}
