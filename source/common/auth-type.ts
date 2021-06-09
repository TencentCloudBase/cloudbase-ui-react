import React, { ReactNode } from 'react'

export enum LOGINTYPE {
    ANONYMOUS = 'ANONYMOUS',
    WECHAT = 'WECHAT',
    WECHAT_PUBLIC = 'WECHAT-PUBLIC',
    WECHAT_OPEN = 'WECHAT-OPEN',
    CUSTOM = 'CUSTOM',
    EMAIL = 'EMAIL',
    USERNAME = 'USERNAME',
    NULL = 'NULL', // 未登录
    PHONE = 'PHONE'
}

export enum AuthState {
    SignUp = 'signup',
    SignOut = 'signout',
    SignIn = 'signin',
    Loading = 'loading',
    SignedOut = 'signedout',
    SignedIn = 'signedin',
    SigningUp = 'signingup',
    ConfirmSignUp = 'confirmSignUp',
    ConfirmSignIn = 'confirmSignIn',
    ForgotPassword = 'forgotpassword',
    ResetPassword = 'resettingpassword'
}

export type AuthStateHandler = (nextAuthState: AuthState, data?: any) => void;

export const EVENT_TYPE = {
    TOAST_AUTH_ERROR_EVENT: 'ToastAuthError',
    TOAST_SUCCESS_MSG: 'ToastSuccessMsg'
}

export interface OAuthConfig {
    appid: string
    scope: "snsapi_base" | "snsapi_userinfo" | "snsapi_login"
}

export interface EVENTITEM {
    event: string
    message: string
}

export interface FormFieldType {
    fieldId?: string;
    type: string;
    label?: string;
    placeholder?: string;
    hint?: string | null | ReactNode;
    required?: boolean;
    handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void;
    value?: string;
    inputProps?: any;
    disabled?: boolean;
    sendCode?: () => Promise<boolean>
}

export interface PhoneFormFieldType extends FormFieldType {
    dialCode?: string;
}

export type FormFieldTypes = Array<FormFieldType>

export interface PhoneNumberInterface {
    countryDialCodeValue?: string;
    phoneNumberValue?: string | null;
}

export enum UsernameAlias {
    username = 'username',
    email = 'email',
    phone_number = 'phone_number',
}

export type UsernameAliasStrings = keyof typeof UsernameAlias;

export type CodeDeliveryType = 'SMS';

export interface ForgotPasswordAttributes {
    userInput: string;
    newPassword: string;
    code: string;
}

export interface ResetPasswordAttributes {
    userInput: string;
    oldPassword: string;
    newPassword: string;
    code: string;
}

