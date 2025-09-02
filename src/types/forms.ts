export interface FormDataState {
  fullName: string;
  age: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export type FormErrors = {
  [key in keyof FormDataState]?: string;
};
