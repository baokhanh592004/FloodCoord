import { use } from "react";
import { set } from "react-hook-form";





const useFormValidation = (initialValues, validationRules) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmmiting] = useState(false);
    
    // Handle input change
    const handleChange = ((e) => {
        const {name, value} = e.target;
        
        setValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (error[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);
    
    // Handle input blur
    const handleBlur = useCallback((e) => {
        const {name} = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field on blur
        if (validationRules[name]) {
            const error = validationRules[name](values[name], values);

            if (error) {
                setErrors(prev => ({
                    ...prev, 
                    [name]: error
                }));
            }
        }
    }, [values, validationRules]);

    // Validate all fields
    const validateForm = useCallback(() => {
        const newErrors = {};

        Object.keys(validationRules).forEach(fieldName  => {
            const error = validationRules[fieldName](values[fieldName], values);
            if (error) {
                newErrors[fieldName] = error;
            }
        });

        setErrors(newErrors);
        setTouched(
            Object.keys(validationRules).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {})
        );

        return Object.keys(newErrors).length === 0;
    }, [values, validationRules]);

    // Reset form
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmmiting(false);
    }, [initialValues]);

    // Set a specific field value
    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Set a specific field error
    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        validateForm,
        resetForm,
        setFieldValue,
        setFieldError
    };
};

export default useFormValidation;