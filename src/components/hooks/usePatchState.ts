import {useState} from "react";

/**
 * This extends useState to allow for partial data. This should be used with simple JS Objects only to handle state more easily.
 */
export default function usePatchState<T extends Record<any, any>>(intialObject: T): [T, (patch: Partial<T>) => void] {
  const [state, setState] = useState<T>(intialObject);

  return [
    state,
    (patch: Partial<T>) => {
      setState({
        ...state,
        ...patch,
      });
    },
  ];
}
