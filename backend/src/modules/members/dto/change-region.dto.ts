import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeRegionDto {
  @IsNotEmpty()
  @IsString()
  regionId!: string;
}
