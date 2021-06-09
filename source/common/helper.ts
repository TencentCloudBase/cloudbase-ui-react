import { AuthStateHandler, AuthState, LOGINTYPE, OAuthConfig, EVENT_TYPE } from './auth-type'
import { AUTH_STATE_CHANGE_EVENT, UI_AUTH_CHANNEL, TOAST_AUTH_ERROR_EVENT } from './constant'
import cloudbase from './cloudbase'

export const onAuthUIStateChange = (app: cloudbase.app.App, authStateHandler: AuthStateHandler) => {
    const authUIStateHandler = (data: any) => {
        const { data: payload } = data
        switch (payload.event) {
            case AUTH_STATE_CHANGE_EVENT:
                if (payload.message) {
                    if (payload.message === AuthState.SignedIn) {
                        try {
                            const user = app.auth({ persistence: 'local' }).currentUser // TODO: use config
                            authStateHandler(payload.message as AuthState, user)
                        } catch (e) {
                        }
                    } else {
                        authStateHandler(payload.message as AuthState, payload.data)
                    }
                }
                break
        }
    }

    const eventBus = (app as any).eventBus
    eventBus.on(UI_AUTH_CHANNEL, authUIStateHandler);
    return () => eventBus.off(UI_AUTH_CHANNEL, authUIStateHandler);
}

export interface ToastEvent {
    code?: string;
    message: string;
    type: string
}

export const dispatchToastHubEvent = (eventBus: any, eventItem: ToastEvent) => {
    eventBus.fire(UI_AUTH_CHANNEL, {
        event: eventItem.type,
        code: eventItem.code,
        message: eventItem.message
    });
};

export const dispatchAuthStateChangeEvent = (eventBus: any, nextAuthState: AuthState, data?: object | null) => {
    eventBus.fire(UI_AUTH_CHANNEL, {
        event: AUTH_STATE_CHANGE_EVENT,
        message: nextAuthState,
        data,
    });
};

export const checkUserLoginType = (loginType: LOGINTYPE) => {
    const values = Object.values(LOGINTYPE)
    if (values.indexOf(loginType) < 0) {
        throw new Error(`Invalid loginType - ${loginType}. Instead use ${Object.values(LOGINTYPE)}`);
    }
};

interface ISignInParams {
    app: cloudbase.app.App
    loginType: LOGINTYPE
    handleAuthStateChange?: AuthStateHandler
    username?: string
    password?: string
    code?: string
    isUsePassword?: boolean
    oauthConfig?: OAuthConfig
}

export const handleSignIn = async (params: ISignInParams) => {
    const { app, loginType, username = '', password = '', code, isUsePassword, oauthConfig } = params
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
            }; break
            case LOGINTYPE.EMAIL: {
                // let reqParams: any = {}
                await auth.signInWithEmailAndPassword(username, password)
            }; break
            case LOGINTYPE.USERNAME: {
                // let reqParams: any = {}
                await auth.signInWithUsernameAndPassword(username, password)
            }; break
            case LOGINTYPE.WECHAT:
            case LOGINTYPE.WECHAT_OPEN:
            case LOGINTYPE.WECHAT_PUBLIC:
                {
                    const provider = auth.weixinAuthProvider(oauthConfig as OAuthConfig);
                    const loginState = await provider.getRedirectResult()
                    if (!loginState) {
                        provider.signInWithRedirect();
                    }
                }
            default: break
        }

        const user = auth.currentUser
        if (user) {
            dispatchToastHubEvent((app as any).eventBus, {
                message: '登录成功',
                type: EVENT_TYPE.TOAST_SUCCESS_MSG
            })

            dispatchAuthStateChangeEvent(
                (app as any).eventBus,
                AuthState.SignedIn,
                user
            )
        }
    } catch (error) {
        console.log('error.code', error.code)
        console.log('error.message', error.message)
        dispatchToastHubEvent(eventBus, {
            code: error.code,
            message: error.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT,
        });
    }
};

interface IForgotPassword {
    app: cloudbase.app.App
    loginType: LOGINTYPE
    handleAuthStateChange: AuthStateHandler
    username: string
    newPassword: string
    code: string
}

interface IResetPassword {
    app: cloudbase.app.App
    loginType: LOGINTYPE
    handleAuthStateChange: AuthStateHandler
    username: string
    oldPassword: string
    newPassword: string
    code: string
}


export const handleResetPassword = async (params: IResetPassword) => {
    const { app, loginType, handleAuthStateChange, username, oldPassword, newPassword, code } = params
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })
    try {
        switch (loginType) {
            case LOGINTYPE.PHONE: {
                let reqParams: any = {
                    phoneNumber: username,
                    phoneCode: code,
                }
                await auth.signInWithPhoneCodeOrPassword({
                    ...reqParams
                })
            }; break
            case LOGINTYPE.EMAIL: {
                await auth.signInWithEmailAndPassword(
                    username,
                    oldPassword
                )
            }; break
            case LOGINTYPE.USERNAME: {
                // let reqParams: any = {}
                await auth.signInWithUsernameAndPassword(username, oldPassword)
            }; break
            default: break
        }

        const user = auth.currentUser
        if (user) {
            // 重置密码
            const updateRes = await user.updatePassword(newPassword, oldPassword)

            dispatchToastHubEvent((app as any).eventBus, {
                message: '重置成功',
                type: EVENT_TYPE.TOAST_SUCCESS_MSG
            })

            dispatchAuthStateChangeEvent(
                (app as any).eventBus,
                AuthState.SignIn,
                user
            )
        }
    } catch (error) {
        console.log('error****', error)
        dispatchToastHubEvent(eventBus, {
            code: error.code,
            message: error.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT,
        });
    }
};

export const handleForgotPassword = async (params: IForgotPassword) => {
    const { app, loginType, handleAuthStateChange, username, newPassword, code } = params
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })
    try {
        switch (loginType) {
            case LOGINTYPE.PHONE: {

                console.log("can't support now")

                // let reqParams: any = {
                //     phoneNumber: username,
                //     phoneCode: code,
                // }
                // await auth.signInWithPhoneCodeOrPassword({
                //     ...reqParams
                // })
            }; break
            case LOGINTYPE.EMAIL: {
                await auth.sendPasswordResetEmail(username)
            }; break

            default: break
        }

        // 跳转至 SignIn

        dispatchToastHubEvent((app as any).eventBus, {
            message: '发送重置邮件成功',
            type: EVENT_TYPE.TOAST_SUCCESS_MSG
        })

        dispatchAuthStateChangeEvent(
            (app as any).eventBus,
            AuthState.SignIn
        )
    } catch (error) {
        console.log('error****', error)
        dispatchToastHubEvent(eventBus, {
            code: error.code,
            message: error.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT,
        });
    }
};

export const handleSignUp = async (app: cloudbase.app.App, loginType: LOGINTYPE, handleAuthStateChange: AuthStateHandler, username: string, password: string, code: string) => {
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })
    try {
        switch (loginType) {
            case LOGINTYPE.PHONE: await auth.signUpWithPhoneCode(
                username,
                code,
                password
            ); break
            case LOGINTYPE.EMAIL: await auth.signUpWithEmailAndPassword(username, password); break
            default: ; break
        }

        // 检查是否输入用户名，是则设置用户名
        // 跳转至登录页
        if (loginType === LOGINTYPE.EMAIL) {
            dispatchToastHubEvent((app as any).eventBus, {
                message: '发送注册邮件成功',
                type: EVENT_TYPE.TOAST_SUCCESS_MSG
            })
        } else {
            dispatchToastHubEvent((app as any).eventBus, {
                message: '注册成功',
                type: EVENT_TYPE.TOAST_SUCCESS_MSG
            })
        }
        dispatchAuthStateChangeEvent((app as any).eventBus, AuthState.SignIn)
    } catch (e) {
        dispatchToastHubEvent(eventBus, {
            code: e.code,
            message: e.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
        });
    }
}

export function removeParam(key: string, sourceURL: string) {
    let rtn = sourceURL.split('?')[0];
    let param;
    let params_arr = [];
    let queryString =
        sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
    if (queryString !== '') {
        params_arr = queryString.split('&');
        for (let i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split('=')[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + '?' + params_arr.join('&');
    }
    return rtn;
};

export const handleSignOut = async (app: cloudbase.app.App, loginType: LOGINTYPE) => {
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })

    // 判断是否为微信授权登录后退出，是则重置url query
    try {
        await auth.signOut()
        if (loginType.indexOf('WECHAT') > -1) {
            const currUrl = removeParam('code', location.href);
            location.href = currUrl
        }
        dispatchAuthStateChangeEvent((app as any).eventBus,
            AuthState.SignedOut)

    } catch (e) {
        dispatchToastHubEvent(eventBus, {
            code: e.code,
            message: e.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
        });
    }

}

export const handleSendCode = async (app: cloudbase.app.App, phoneNumberValue: string) => {
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })
    try {
        await auth.sendPhoneCode(phoneNumberValue)
    } catch (e) {
        dispatchToastHubEvent(eventBus, {
            code: e.code,
            message: e.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
        });
    }
}

export const handleUpdateUsername = async (app: cloudbase.app.App, username: string) => {
    const eventBus = (app as any).eventBus
    const auth = app.auth({ persistence: 'local' })

    try {
        if (!(await auth.isUsernameRegistered(username))) {
            // 检查用户名是否绑定过
            await auth.currentUser?.updateUsername(username); // 绑定用户名
        }
    } catch (error) {
        dispatchToastHubEvent(eventBus, {
            code: error.code,
            message: error.message,
            type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
        });
    }

}

export const checkWXOauthLoginCode = () => {
    // 判断url中是否有code，有则直接调用登录
    const code = getQuery('code') || getHash('code');
    return code
}

export function getQuery(name: string, url?: string) {
    if (typeof window === 'undefined') {
        return false;
    }
    // 参数：变量名，url为空则表从当前页面的url中取
    let u = url || window.location.search;
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    let r = u.substr(u.indexOf('?') + 1).match(reg);
    return r != null ? r[2] : '';
};

export const getHash = function (name: string) {
    if (typeof window === 'undefined') {
        return '';
    }
    const matches = window.location.hash.match(
        new RegExp(`[#\?&\/]${name}=([^&#]*)`)
    );
    return matches ? matches[1] : '';
};