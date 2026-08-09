import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

interface FormField {
  id: string;
  value: string;
}

interface FieldError {
  id: string;
  error: string;
}

interface SignInSuccess {
  status: "OK";
  user: { id: string; emails: string[] };
}
interface SignInWrongCredentials {
  status: "WRONG_CREDENTIALS_ERROR";
}
type SignInResponse = SignInSuccess | SignInWrongCredentials;

interface SignInArgs {
  email: string;
  password: string;
}

interface SignUpSuccess {
  status: "OK";
  user: { id: string; emails: string[] };
}
interface SignUpFieldError {
  status: "FIELD_ERROR";
  formFields: FieldError[];
}
type SignUpResponse = SignUpSuccess | SignUpFieldError;

interface SignUpArgs {
  email: string;
  password: string;
  role: "employer" | "employee";
}

interface FieldErrorResponse {
  status: "FIELD_ERROR";
  formFields: FieldError[];
}

type RequestPasswordResetResponse = { status: "OK" } | FieldErrorResponse;

interface RequestPasswordResetArgs {
  email: string;
}

type SubmitNewPasswordResponse =
  | { status: "OK" }
  | { status: "RESET_PASSWORD_INVALID_TOKEN_ERROR" }
  | FieldErrorResponse;

interface SubmitNewPasswordArgs {
  token: string;
  password: string;
}

type VerifyEmailResponse = { status: "OK" } | { status: "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR" };

interface VerifyEmailArgs {
  token: string;
}

interface EmailVerificationStatus {
  status: "OK";
  isVerified: boolean;
}

type ResendVerificationResponse = { status: "OK" } | { status: "EMAIL_ALREADY_VERIFIED_ERROR" };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  tagTypes: ["User", "Job", "Application", "Company"],
  endpoints: (builder) => ({
    signIn: builder.mutation<SignInResponse, SignInArgs>({
      query: ({ email, password }) => ({
        url: "/auth/signin",
        method: "POST",
        headers: { rid: "emailpassword" },
        body: {
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
          ] satisfies FormField[],
        },
      }),
      invalidatesTags: ["User"],
    }),

    signUp: builder.mutation<SignUpResponse, SignUpArgs>({
      query: ({ email, password, role }) => ({
        url: "/auth/signup",
        method: "POST",
        headers: { rid: "emailpassword" },
        body: {
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
            { id: "role", value: role },
          ] satisfies FormField[],
        },
      }),
      invalidatesTags: ["User"],
    }),

    requestPasswordReset: builder.mutation<RequestPasswordResetResponse, RequestPasswordResetArgs>({
      query: ({ email }) => ({
        url: "/auth/user/password/reset/token",
        method: "POST",
        headers: { rid: "emailpassword" },
        body: { formFields: [{ id: "email", value: email }] satisfies FormField[] },
      }),
    }),

    submitNewPassword: builder.mutation<SubmitNewPasswordResponse, SubmitNewPasswordArgs>({
      query: ({ token, password }) => ({
        url: "/auth/user/password/reset",
        method: "POST",
        headers: { rid: "emailpassword" },
        body: { token, formFields: [{ id: "password", value: password }] satisfies FormField[] },
      }),
    }),

    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailArgs>({
      query: ({ token }) => ({
        url: "/auth/user/email/verify",
        method: "POST",
        headers: { rid: "emailverification" },
        body: { token },
      }),
    }),

    getEmailVerificationStatus: builder.query<EmailVerificationStatus, void>({
      query: () => ({
        url: "/auth/user/email/verify",
        headers: { rid: "emailverification" },
      }),
      providesTags: ["User"],
    }),

    resendVerificationEmail: builder.mutation<ResendVerificationResponse, void>({
      query: () => ({
        url: "/auth/user/email/verify/token",
        method: "POST",
        headers: { rid: "emailverification" },
      }),
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useRequestPasswordResetMutation,
  useSubmitNewPasswordMutation,
  useVerifyEmailMutation,
  useGetEmailVerificationStatusQuery,
  useResendVerificationEmailMutation,
} = authApi;