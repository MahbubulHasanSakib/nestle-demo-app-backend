// src/upload/dto/upload-signed-url.dto.ts

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadSignedUrlDto {
  @ApiProperty({
    example: 'my-image.jpg',
    description: 'Name of the file to be uploaded',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the file',
  })
  @IsString()
  filetype: string;
}
