'use client';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { FormValues } from '@/types/form-values';

export default function UploadPage() {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [success, setSuccess] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    formData.append('image', data.image[0]);

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    reset();
    setSuccess(true);
  };

  return (
    <div>
      <h1>Envie sua foto da festa!</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register('image')} required />
        <button type="submit">Enviar</button>
      </form>
      {success && <p>Foto enviada com sucesso!</p>}
    </div>
  );
}