import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { adminApi } from "./adminApi";

export type AuthRole = "talent" | "client" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  avatar?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "admin">;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  // Present ONLY in development when no email provider (RESEND_API_KEY) is
  // configured, so the reset flow stays testable. In production this is never
  // returned — the token is delivered by email only.
  devResetUrl?: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "auth/register", method: "POST", body }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            adminApi.util.invalidateTags([
              { type: "AdminOverview", id: "OVERVIEW" },
              { type: "Account", id: "LIST" },
            ]),
          );
        } catch {
          // swallow — the form already surfaces the error to the user
        }
      },
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
