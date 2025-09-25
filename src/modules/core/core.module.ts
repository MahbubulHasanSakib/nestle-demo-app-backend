import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiConfigModule } from 'src/modules/api-config/api-config.module';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ApiConfigModule],
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          secret: apiConfigService.getJwtSecret,
          signOptions: { expiresIn: apiConfigService.getJwtExpire },
        };
      },
      inject: [ApiConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class CoreModule {}
