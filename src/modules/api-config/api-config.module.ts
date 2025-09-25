import { Global, Module } from '@nestjs/common';
import { ApiConfigService } from './api-config.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
  ],
  controllers: [],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ApiConfigModule {}
