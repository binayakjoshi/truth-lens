import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

enum sortType {
  DESC = 'DESC',
  ASC = 'ASC',
}
export class SearchHistoryDto {
  @IsNumberString()
  @IsOptional()
  page: string;

  @IsNumberString()
  @IsOptional()
  limit: string;

  @IsOptional()
  @IsEnum(sortType)
  sort: sortType;
}
