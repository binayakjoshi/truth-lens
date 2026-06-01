import { plural } from 'pluralize';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';

export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : plural(camelCase(className));
  }
}
