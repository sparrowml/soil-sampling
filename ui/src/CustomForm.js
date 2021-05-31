import React from "react";
import { useForm } from 'react-hook-form'
import { FormInput } from "./Forminput";

export const LoginForm = () => {
  const {register, handleSubmit, errors} = useForm({
    mode: 'onBlur',
  })

  const onSubmit = ({Latitude, Longitude}) => {
    alert(`Latitude: ${Latitude}, password: ${Longitude}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <header>
      </header>
      <FormInput 
        id="Latitude"
        name="Latitude"
        type="text"
        label="Latitude"
        register={register}
      //  error={errors.Latitude}
      />
      <FormInput 
        id="Longitude"
        type="text"
        name="Longitude"
        label="Longitude"
        register={register}
      //  error={errors.Longitude}
      />
      <button type="submit">Submit Coordinates</button>
    </form>
  );
};

export default LoginForm;