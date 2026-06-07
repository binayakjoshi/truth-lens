import { UseInterceptors, Type } from '@nestjs/common';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';

export function Serialize(dto: Type<any>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
