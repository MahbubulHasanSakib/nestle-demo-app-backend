import { IsString } from 'class-validator';

export class ImageObj {
  @IsString()
  imageName: string;

  @IsString()
  thumb: string;

  @IsString()
  original: string;
}
