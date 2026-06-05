import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUsernameOrEmail', async: false })
export class IsUsernameOrEmailConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const hasUsername = !!obj.username;
    const hasEmail = !!obj.email;

    return (hasUsername || hasEmail) && !(hasUsername && hasEmail);
  }

  defaultMessage() {
    return 'Either username or email must be provided, but not both';
  }
}

export function IsUsernameOrEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameOrEmailConstraint,
    });
  };
}
