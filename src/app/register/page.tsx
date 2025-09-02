import RegisterPage from '@/containers/register';
import { registerUser } from '@/services/users-service';
import { FormDataState } from '@/types/forms';

const registerAction = async (form: FormDataState) => {
  'use server';
  const result = await registerUser(form);
  return result;
};

export default function Register() {
  return <RegisterPage onRegister={registerAction} />;
}
