export enum AuthStrings {
    BACK_TO_SIGN_IN = '返回登陆',
    CODE_PLACEHOLDER = '输入验证码',
    PHONENUMBER_PLACEHOLDER = '输入手机号',
    CREATE_ACCOUNT_TEXT = '创建账户',
    WECHAT_OAUTH_LOGIN = '微信授权登录',
    EMAIL_PLACEHOLDER = '输入邮箱地址',
    FORGOT_PASSWORD_TEXT = 'Forgot your password?',
    USERNAME_REMOVE_WHITESPACE = 'Username cannot contain whitespace',
    PASSWORD_REMOVE_WHITESPACE = 'Password cannot start or end with whitespace',

    NEW_PASSWORD_PLACEHOLDER = '输入新密码',
    OLD_PASSWORD_PLACEHOLDER = '输入旧密码',
    PASSWORD_PLACEHOLDER = '输入密码',
    RESET_PASSWORD_TEXT = '重置密码',
    RESET_YOUR_PASSWORD = '重置密码',
    SEND_CODE = 'Send Code',
    SUBMIT = '提交',
    SIGN_IN_ACTION = '登录',
    UPDATE_USERNAME_ACTION = '更新',
    SIGN_IN_HEADER_TEXT = '登陆账户',
    SIGN_IN_TEXT = '登陆',
    SIGN_OUT = '退出',
    SIGN_UP_HAVE_ACCOUNT_TEXT = '已有账户?',
    SIGN_UP_HEADER_TEXT = '创建账户',
    SIGN_UP_SUBMIT_BUTTON_TEXT = '创建账户',
    USERNAME_PLACEHOLDER = '请输入用户名',
    UPDATE_USERNAME_HEADER_TEXT = '更新用户名',
}

export enum AuthErrorStrings {
    EMPTY_USERNAME = 'Username cannot be empty',
}

export const Translations = { ...AuthStrings, ...AuthErrorStrings };
