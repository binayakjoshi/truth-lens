"use client";

import { useCallback, useReducer } from "react";

export interface InputState {
  value: string | boolean | File | number | undefined | any[];
  isValid: boolean;
  touched: boolean;
}

export interface FormState {
  inputs: Record<string, InputState>;
  isValid: boolean;
}

type InputsPayload =
  | Record<string, InputState>
  | ((prevState: FormState) => Record<string, InputState>);

export interface FormAction {
  type: "INPUT_CHANGE" | "SET_DATA" | "SET_TOUCHED";
  inputId?: string;
  value?: string | boolean | File | number | undefined | any[];
  isValid?: boolean;
  touched?: boolean;
  inputsPayload?: InputsPayload;
  formIsValid?: boolean;
}

const calculateFormValidity = (inputs: Record<string, InputState>): boolean => {
  return Object.values(inputs).every((input) => input.isValid);
};

// Reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "INPUT_CHANGE": {
      const { inputId, value, isValid } = action;
      if (!inputId || isValid === undefined) {
        return state;
      }

      const updatedInputs = {
        ...state.inputs,
        [inputId]: {
          value: value,
          isValid,
          touched: true,
        },
      };

      return {
        ...state,
        inputs: updatedInputs,
        isValid: calculateFormValidity(updatedInputs),
      };
    }

    case "SET_TOUCHED": {
      const { inputId } = action;
      if (!inputId) return state;

      const prev = state.inputs[inputId];
      if (!prev) return state;

      return {
        ...state,
        inputs: {
          ...state.inputs,
          [inputId]: {
            ...prev,
            touched: true,
          },
        },
      };
    }

    case "SET_DATA": {
      const { inputsPayload, formIsValid } = action;
      if (!inputsPayload || formIsValid === undefined) {
        return state;
      }

      const newInputs =
        typeof inputsPayload === "function"
          ? inputsPayload(state)
          : inputsPayload;

      return {
        ...state,
        inputs: newInputs,
        isValid: formIsValid,
      };
    }

    default:
      return state;
  }
};

type SetFormDataFunction = (
  inputData: InputsPayload, // Accepts either an object or a function
  formValidity: boolean,
) => void;

// Custom hook
export const useForm = (
  initialInputs: Record<string, InputState>,
  initialFormValidity: boolean,
): [
  FormState,
  (
    id: string,
    value: string | boolean | File | number | undefined | any[],
    isValid: boolean,
  ) => void,
  SetFormDataFunction,
  (id: string) => void,
] => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  const inputHandler = useCallback(
    (
      id: string,
      value: string | boolean | File | number | undefined | any[],
      isValid: boolean,
    ) => {
      dispatch({
        type: "INPUT_CHANGE",
        inputId: id,
        value,
        isValid,
      });
    },
    [],
  );

  const setFormData: SetFormDataFunction = useCallback(
    (inputsPayload: InputsPayload, formValidity: boolean) => {
      dispatch({
        type: "SET_DATA",
        inputsPayload, // Pass the payload
        formIsValid: formValidity,
      });
    },
    [],
  );

  const setTouched = useCallback((id: string) => {
    dispatch({
      type: "SET_TOUCHED",
      inputId: id,
    });
  }, []);

  return [formState, inputHandler, setFormData, setTouched];
};
