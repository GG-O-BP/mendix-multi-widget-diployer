import { useState } from "react";
import { curry, assoc } from "../utils/fp.js";

export const useForm = (initialValue = {}) => {
    const [value, setValue] = useState(initialValue);

    const updateField = curry((field, newValue) => {
        setValue((current) => assoc(field, newValue, current));
    });

    const reset = () => setValue(initialValue);

    const setValues = (newValues) => setValue(newValues);

    return { value, updateField, reset, setValues };
};
