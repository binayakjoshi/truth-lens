"use client";

import type React from "react";
import { useReducer, useEffect, type ReactNode } from "react";

import {
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";

import { validate, type Validator } from "@/lib/validators";

interface InputState {
  value: string | boolean;
  isTouched: boolean;
  isValid: boolean;
}

interface InputAction {
  type: "CHANGE" | "TOUCH";
  val?: string | boolean;
  validators?: Validator[];
}

interface RadioOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface CustomInputProps {
  id: string;
  element: "input" | "textarea" | "radio";
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  value?: any;
  initialValue?: string | boolean;
  initialValid?: boolean;
  validators?: Validator[];
  errorText?: string;
  onInput: (id: string, value: string | boolean, isValid: boolean) => void;
  name?: string;
  options?: RadioOption[] | SelectOption[];
  selectLabel?: string;
  className?: string;
  description?: string;
  required?: boolean;
  height?: number;
  autocomplete?: string;
  endAdornment?: ReactNode;
  sx?: object;
}

const inputReducer = (state: InputState, action: InputAction): InputState => {
  switch (action.type) {
    case "CHANGE":
      if (action.val === undefined) return state;
      if (typeof action.val === "boolean") {
        return { ...state, value: action.val, isValid: true };
      }
      if (!action.validators) return state;
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return { ...state, isTouched: true };
    default:
      return state;
  }
};

const Input: React.FC<CustomInputProps> = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  useEffect(() => {
    if (
      props.initialValue !== undefined &&
      props.initialValue !== inputState.value
    ) {
      dispatch({
        type: "CHANGE",
        val: props.initialValue,
        validators: props.validators,
      });
    }
  }, [props.initialValue, inputState.value, props.validators]);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({ type: "TOUCH" });
  };

  const isError = !inputState.isValid && inputState.isTouched;

  if (props.element === "input" || props.element === "textarea") {
    return (
      <TextField
        id={props.id}
        label={props.label}
        type={props.element === "textarea" ? undefined : props.type || "text"}
        multiline={props.element === "textarea"}
        rows={props.element === "textarea" ? props.rows || 3 : undefined}
        placeholder={props.placeholder}
        value={inputState.value}
        onChange={changeHandler}
        onBlur={touchHandler}
        error={isError}
        helperText={isError ? props.errorText : undefined}
        required={props.required}
        fullWidth
        slotProps={{
          input: {
            readOnly: props.readOnly,
            autoComplete: props.autocomplete,
            endAdornment: props.endAdornment,
          },
          htmlInput:
            props.type === "number"
              ? {
                  onWheel: (e: React.WheelEvent<HTMLInputElement>) =>
                    e.currentTarget.blur(),
                  sx: {
                    MozAppearance: "textfield",
                    "&::-webkit-inner-spin-button": { display: "none" },
                    "&::-webkit-outer-spin-button": { display: "none" },
                  },
                }
              : undefined,
        }}
        sx={props.sx}
        className={props.className}
      />
    );
  }

  if (props.element === "radio" && props.options) {
    return (
      <FormControl
        id={props.id}
        error={isError}
        required={props.required}
        className={props.className}
      >
        {props.label && <FormLabel>{props.label}</FormLabel>}
        <RadioGroup
          name={props.name}
          value={inputState.value}
          onChange={changeHandler}
          onBlur={touchHandler}
          row
        >
          {props.options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
        {isError && props.errorText && (
          <FormHelperText>{props.errorText}</FormHelperText>
        )}
      </FormControl>
    );
  }
};

export default Input;
