export type Validator = {
  type: string;
  val?: number;
};

const VALIDATOR_TYPE_REQUIRE = "REQUIRE";
const VALIDATOR_TYPE_MINLENGTH = "MINLENGTH";
const VALIDATOR_TYPE_MAXLENGTH = "MAXLENGTH";
const VALIDATOR_TYPE_MIN = "MIN";
const VALIDATOR_TYPE_MAX = "MAX";
const VALIDATOR_TYPE_EMAIL = "EMAIL";
const VALIDATOR_TYPE_FILE = "FILE";
const VALIDATOR_TYPE_NUMBER = "NUMBER";
const VALIDATOR_TYPE_USERNAME = "USERNAME";
const VALIDATOR_TYPE_PASSWORD = "PASSWORD";
export const VALIDATOR_NO_SPACES = () => ({
  type: "NO_SPACES",
  validate: (value: string) => !/\s/.test(value),
});

export const VALIDATOR_REQUIRE = (): Validator => ({
  type: VALIDATOR_TYPE_REQUIRE,
});

export const VALIDATOR_FILE = (): Validator => ({
  type: VALIDATOR_TYPE_FILE,
});

export const VALIDATOR_MINLENGTH = (val: number): Validator => ({
  type: VALIDATOR_TYPE_MINLENGTH,
  val: val,
});

export const VALIDATOR_MAXLENGTH = (val: number): Validator => ({
  type: VALIDATOR_TYPE_MAXLENGTH,
  val: val,
});

export const VALIDATOR_MIN = (val: number): Validator => ({
  type: VALIDATOR_TYPE_MIN,
  val: val,
});

export const VALIDATOR_MAX = (val: number): Validator => ({
  type: VALIDATOR_TYPE_MAX,
  val: val,
});

export const VALIDATOR_EMAIL = (): Validator => ({
  type: VALIDATOR_TYPE_EMAIL,
});

export const VALIDATOR_NUMBER = (): Validator => ({
  type: VALIDATOR_TYPE_NUMBER,
});

export const VALIDATOR_BOOLEAN = () => ({
  type: "BOOLEAN",
});
export const VALIDATOR_USERNAME = (): Validator => ({
  type: VALIDATOR_TYPE_USERNAME,
});

export const VALIDATOR_PASSWORD = (): Validator => ({
  type: VALIDATOR_TYPE_PASSWORD,
});
export const validate = (value: any, validators: Validator[]): boolean => {
  if (value === null || value === undefined) return false;

  let isValid = true;

  for (const validator of validators) {
    if (validator.type === VALIDATOR_TYPE_REQUIRE) {
      isValid = isValid && value.toString().trim().length > 0;
    }

    if (
      validator.type === VALIDATOR_TYPE_MINLENGTH &&
      validator.val !== undefined
    ) {
      isValid = isValid && value.toString().trim().length >= validator.val;
    }

    if (
      validator.type === VALIDATOR_TYPE_MAXLENGTH &&
      validator.val !== undefined
    ) {
      isValid = isValid && value.toString().trim().length <= validator.val;
    }

    if (validator.type === VALIDATOR_TYPE_MIN && validator.val !== undefined) {
      isValid = isValid && +value >= validator.val;
    }

    if (validator.type === VALIDATOR_TYPE_MAX && validator.val !== undefined) {
      isValid = isValid && +value <= validator.val;
    }

    if (validator.type === VALIDATOR_TYPE_EMAIL) {
      isValid = isValid && /^\S+@\S+\.\S+$/.test(value);
    }

    if (validator.type === VALIDATOR_TYPE_NUMBER) {
      const num = Number(value);
      isValid = isValid && value.toString().trim() !== "" && !isNaN(num);
    }
    if (validator.type === VALIDATOR_TYPE_USERNAME) {
      isValid = isValid && /^[a-z][a-z0-9_]*$/.test(value.trim().toLowerCase());
    }

    if (validator.type === VALIDATOR_TYPE_PASSWORD) {
      isValid = isValid && /^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value.trim());
    }
  }

  return isValid;
};
