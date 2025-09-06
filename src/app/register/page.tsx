import RegisterPage from '@/containers/register';
import { registerUser } from '@/services/users-service';
import { UserRegistration } from '@/types';

const registerAction = async (form: UserRegistration) => {
  'use server';
  const result = await registerUser(form);
  return result;
};

export default function Register() {
  return <RegisterPage onRegister={registerAction} />;
}
