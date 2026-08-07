import { IsDateString, IsNotEmpty } from 'class-validator';

export class ExportHistoryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
