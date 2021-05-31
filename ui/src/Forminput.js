import React from 'react'

export const FormInput = ({register, errors, label, id, ...inputProps}) => {
  return <>
    <label htmlFor={id}>{label}</label>
    <input
      ref={register}
      id={id}
      {...inputProps}
    />
    {errors && <div>{errors.message}</div>} 
  </>
}