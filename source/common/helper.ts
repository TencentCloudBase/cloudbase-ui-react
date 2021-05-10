import { AuthStateHandler, AuthState, PhoneNumberInterface, UsernameAlias, LOGINTYPE } from './auth-type'
import { AUTH_STATE_CHANGE_EVENT, UI_AUTH_CHANNEL, TOAST_AUTH_ERROR_EVENT, PHONE_EMPTY_ERROR_MESSAGE, COUNTRY_DIAL_CODE_SUFFIX, PHONE_SUFFIX } from './constant'
import cloudbase from '@cloudbase/js-sdk'
import { Translations } from "./Translations"


export const onAuthUIStateChange = (app: cloudbase.app.App, authStateHandler: AuthStateHandler) => {
    //
    console.log('flag')
    const authUIStateHandler = (data: any) => {
        console.log('data', data)
        const { data: payload } = data;
        console.log('payload', payload)
        switch (payload.event) {
            case AUTH_STATE_CHANGE_EVENT:
                if (payload.message) {
                    if (payload.message === AuthState.SignedIn) {
                        // for AuthState.SignedIn, use an Auth Guard
                        try {
                            // const user = await Auth.currentAuthenticatedUser();
                            const user = app.auth({ persistence: "local" }).currentUser // TODO: use config
                            console.log('gggggg', payload.message, user)
                            authStateHandler(payload.message as AuthState, user);
                        } catch (e) {
                        }
                    } else {
                        authStateHandler(payload.message as AuthState, payload.data);
                    }
                }
                break;
        }
    };

    const eventBus = (app as any).eventBus
    eventBus.on(UI_AUTH_CHANNEL, authUIStateHandler);
    return () => eventBus.off(UI_AUTH_CHANNEL, authUIStateHandler);
};

export interface ToastError {
    code?: string;
    message: string;
}

export const dispatchToastHubEvent = (eventBus: any, error: ToastError) => {
    eventBus.fire(UI_AUTH_CHANNEL, {
        event: TOAST_AUTH_ERROR_EVENT,
        message: error.message
    });
};

export const dispatchAuthStateChangeEvent = (eventBus: any, nextAuthState: AuthState, data?: object | null) => {
    console.log('dispatch an event')
    eventBus.fire(UI_AUTH_CHANNEL, {
        event: AUTH_STATE_CHANGE_EVENT,
        message: nextAuthState,
        data,
    });
};

// export const composePhoneNumberInput = (phoneNumber: PhoneNumberInterface) => {
//     console.log('((())))')
//     if (!phoneNumber.phoneNumberValue) {
//         throw new Error(PHONE_EMPTY_ERROR_MESSAGE);
//     }

//     const sanitizedPhoneNumberValue = phoneNumber.phoneNumberValue.replace(/[-()\s]/g, '');

//     return `${phoneNumber.countryDialCodeValue}${sanitizedPhoneNumberValue}`;
// };

// export const checkUsernameAlias = (usernameAlias: any) => {
//     if (!(usernameAlias in UsernameAlias)) {
//         throw new Error(`Invalid username Alias - ${usernameAlias}. Instead use ${Object.values(UsernameAlias)}`);
//     }
// };

export const checkUserLoginType = (loginType: LOGINTYPE) => {
    if (!(loginType in LOGINTYPE)) {
        throw new Error(`Invalid loginType - ${loginType}. Instead use ${Object.values(LOGINTYPE)}`);
    }
};


// export function handlePhoneNumberChange(event: any, phoneNumber: PhoneNumberInterface) {
//     const name = event.target.name;
//     const value = event.target.value;

//     console.log('phone change name value', name,)

//     /** Cognito expects to have a string be passed when signing up. Since the Select input is separate
//      * input from the phone number input, we need to first capture both components values and combined
//      * them together.
//      */

//     if (name === COUNTRY_DIAL_CODE_SUFFIX) {
//         phoneNumber.countryDialCodeValue = value;
//     }

//     if (name === PHONE_SUFFIX) {
//         phoneNumber.phoneNumberValue = value;
//     }

//     return
// }

interface ISignInParams {
    app: cloudbase.app.App
    loginType: LOGINTYPE
    handleAuthStateChange: AuthStateHandler
    username: string
    password: string
    code: string
    isUsePassword: boolean
}

export const handleSignIn = async (params: ISignInParams) => {
    console.log('==+++++')
    const { app, loginType, handleAuthStateChange, username, password, code, isUsePassword } = params
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })
    try {
        switch (loginType) {
            case LOGINTYPE.PHONE: {
                let reqParams: any = {}
                if (isUsePassword) {
                    reqParams = {
                        phoneNumber: username,
                        password: password
                    }
                } else {
                    reqParams = {
                        phoneNumber: username,
                        phoneCode: code,
                    }
                }
                await auth.signInWithPhoneCodeOrPassword({
                    ...reqParams
                })

                const user = auth.currentUser
                if (user) {
                    dispatchAuthStateChangeEvent(
                        (app as any).eventBus,
                        AuthState.SignedIn,
                        user
                    )
                }

            }; break
            default: ; break
        }
    } catch (error) {
        if (error.code === 'UserNotConfirmedException') {
            console.debug('the user is not confirmed');
            handleAuthStateChange(AuthState.ConfirmSignUp, { username });
        } else if (error.code === 'PasswordResetRequiredException') {
            console.debug('the user requires a new password');
            handleAuthStateChange(AuthState.ForgotPassword, { username });
        } else if (error.code === 'InvalidParameterException' && password === '') {
            console.debug('Password cannot be empty');
            error.message = Translations.EMPTY_PASSWORD;
        }
        dispatchToastHubEvent(eventBus, error);
    }
};

export const handleSignUp = async (app: cloudbase.app.App, loginType: LOGINTYPE, handleAuthStateChange: AuthStateHandler, username: string, password: string, code: string) => {
    const auth = app.auth({ persistence: 'local' })
    switch (loginType) {
        case LOGINTYPE.PHONE: await auth.signUpWithPhoneCode(
            username,
            code,
            password
        ); break
        case LOGINTYPE.EMAIL: await auth.signUpWithEmailAndPassword(username, password); break
        default: ; break
    }
}


export const handleSignOut = async (app: cloudbase.app.App) => {
    const auth = app.auth({ persistence: 'local' })
    await auth.signOut()
}
