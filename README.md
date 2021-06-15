# 云开发 UI 组件

[云开发 UI 组件]() 是云开发官方维护的 UI 组件库，提供基于云开发封装的一系列能力，目前已支持统一登录能力。

## 安装

```
npm install --save @cloudbase/ui-react
```

> 目前仅支持了 React + WEUI 组件库。

> ⚠️ UI 组件需结合 @cloudbase/js-sdk@1.5.4-alpha.0 及以上版本使用。

## 使用

### 推荐用法

```javascript
import React from 'react';

import {
  CloudbaseAuthenticator,
  onAuthUIStateChange,
  AUTHSTATE,
  LOGINTYPE,
  CloudbaseSignOut, // 登出组件
  CloudbaseSignIn, // 登录组件
  CloudbaseSetUsername, // 更新用户名组件
  CloudbaseForgotPassword, // 忘记密码组件
  CloudbaseResetPassword, // 重置密码组件
  CloudbaseSignUp // 注册组件
} from '@cloudbase/ui-react';
import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'your envId'
});

function App() {
  const [authState, setAuthState] = React.useState(AUTHSTATE.SIGNIN);
  const [user, setUser] = React.useState({});

  React.useEffect(() => {
    return onAuthUIStateChange(app, (nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return authState === AUTHSTATE.SIGNEDIN && user ? (
    <div className='App'>
      <header className='App-header'>
        Hello, {user.uid}
        <CloudbaseSignOut app={app}></CloudbaseSignOut> {/* 注册按钮*/}
        <CloudbaseSetUsername
          app={app}
          handleSubmit={() => {
            console.log('更新完成用户名');
            // TODO: 自定义业务逻辑
          }}
        ></CloudbaseSetUsername> {/* 更新用户名组件框*/}
      </header>
    </div>
  ) : (
    <div className='App'>
      <header className='App-header'>
        <CloudbaseAuthenticator userLoginType={LOGINTYPE.PHONE} app={app} />
      </header>
    </div>
  );
}

export default App;
```

### 属性

| 字段              | 类型                                                | 必填 | 说明                                                                                                                                              |
| ----------------- | --------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| userLoginType     | string                                              | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE)，使用登录功能前，需前往[腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)开启对应登录开关。 |
| app               | Cloudbase                                           | 是   | cloudbase 实例                                                                                                                                    |
| initialLoginState | string                                              | 否   | 组件初始状态，AUTHSTATE.SIGNIN or AUTHSTATE.SIGNUP，默认为 AUTHSTATE.SIGNIN，参考[AUTHSTATE](#AUTHSTATE)                                          |
| isUsePassword     | boolean                                             | 否   | 仅在短信登录生效，true 为 密码登录模式，false 为验证码登录模式                                                                                    |
| handleToastEvent  | function                                            | 否   | 错误处理函数，可由开发者自定义                                                                                                                    |
| signIn            | [CloudbaseSignIn](#CloudbaseSignIn)                 | 否   | 登录子组件                                                                                                                                        |
| signUp            | [CloudbaseSignUp](#CloudbaseSignUp)                 | 否   | 注册子组件                                                                                                                                        |
| forgotPassword    | [CloudbaseForgotPassword](#CloudbaseForgotPassword) | 否   | 忘记密码子组件                                                                                                                                    |
| resetPassword     | [CloudbaseResetPassword](#CloudbaseResetPassword)   | 否   | 重置密码子组件                                                                                                                                    |

##### 登录类型 LOGINTYPE

| 字段值        | 类型   | 说明               |
| ------------- | ------ | ------------------ |
| WECHAT_PUBLIC | string | 微信公众号授权登录 |
| WECHAT_OPEN   | string | 微信开放平台登录   |
| EMAIL         | string | 邮箱登录           |
| USERNAME      | string | 用户名密码登录     |
| PHONE         | string | 手机号登录         |

##### 登录界面态 AUTHSTATE

| 字段值         | 类型   | 说明                           |
| -------------- | ------ | ------------------------------ |
| SIGNIN         | string | 登录                           |
| SIGNEDIN       | string | 已登录，基于此状态判断登录完成 |
| SIGNUP         | string | 注册                           |
| FORGOTPASSWORD | string | 重置密码                       |
| RESETPASSWORD  | string | 重置密码                       |
| SIGNEDOUT      | string | 已登出                         |

### 自定义 CSS

暂不支持

## 子组件

### CloudbaseSignIn

登录框组件

![](https://main.qcloudimg.com/raw/9ddbb73e12bddd7a58d410608bc2bdc8.png)

#### 用法

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  signIn={
    <CloudbaseSignIn
      app={app}
      userLoginType={LOGINTYPE.PHONE}
      submitButtonText={'登录按钮文案'}
    />
  }
/>
```

#### 属性

| 字段              | 类型                                          | 必填 | 说明                                                                                                                                   |
| ----------------- | --------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| userLoginType     | string                                        | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE)                                                                                                |
| app               | Cloudbase                                     | 是   | cloudbase 实例                                                                                                                         |
| isUsePassword     | boolean                                       | 否   | 仅在短信登录生效，true 为 密码登录模式，false 为验证码登录模式                                                                         |
| headerText        | string                                        | 否   | 登录框头部文案                                                                                                                         |
| createAccountText | string                                        | 否   | 创建账号文案                                                                                                                           |
| resetPasswordText | string                                        | 否   | 重置密码文案                                                                                                                           |
| submitButtonText  | string                                        | 否   | 登录按钮文案                                                                                                                           |
| hideSignUp        | boolean                                       | 否   | 是否隐藏注册跳转按钮                                                                                                                   |
| oauthConfig       | [OAuthConfig](#OAuthConfig)                   | 否   | 第三方登录配置，目前支持微信公众号授权登录，微信开放平台登录，相关文档[参考](https://docs.cloudbase.net/authentication/introduce.html) |
| formFields        | Array&lt;[FormFieldType](#FormFieldType) &gt; | 否   | 自定义表单项输入框                                                                                                                     |

##### OAuthConfig

| 字段  | 类型   | 必填 | 说明                                                                 |
| ----- | ------ | ---- | -------------------------------------------------------------------- |
| appid | string | 是   | 微信 appid                                                           |
| scope | string | 是   | "snsapi_base" , "snsapi_userinfo" , "snsapi_login"，参考微信授权登录 |

##### FormFieldType

| 字段        | 类型      | 必填 | 说明                                                                                                 |
| ----------- | --------- | ---- | ---------------------------------------------------------------------------------------------------- |
| value       | string    | 否   | 输入框值                                                                                             |
| inputProps  | string    | 否   | 输入框自定义属性，[参考](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes) |
| placeholder | string    | 否   | 输入框 placeholder                                                                                   |
| disabled    | boolean   | 否   | 是否禁用                                                                                             |
| required    | boolean   | 否   | 是否必填                                                                                             |
| label       | string    | 否   | 输入框左侧标签                                                                                       |
| type        | InputType | 是   | 输入框类型，必填，参考[InputType](#InputType)                                                        |

##### InputType

| 字段值       | 类型   | 说明                 |
| ------------ | ------ | -------------------- |
| email        | string | 邮箱                 |
| password     | string | 密码                 |
| phone_number | string | 手机号               |
| oldPassword  | string | 旧密码，重置密码场景 |
| newPassword  | string | 新密码，重置密码场景 |
| code         | string | 短信验证码           |
| username     | string | 用户名               |

#### 自定义 formFields

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  signIn={
    <CloudbaseSignIn
      app={app}
      userLoginType={LOGINTYPE.PHONE}
      submitButtonText={'登录按钮文案'}
      formFields={[
        {
          type: 'phone_number',
          required: true,
          placeholder: '请输入手机号',
          inputProps: {
            maxlength: 11
          }
        },
        {
          type: 'password',
          required: true,
          placeholder: '请输入密码',
          inputProps: {
            minlength: 8,
            maxlength: 15,
            autoComplete: 'current-password', // 自动填充设置（HTML 标准属性）
            pattern: '[a-zA-Z0-9]+' // 正则校验，支持大小写字母及数字
          }
        }
      ]}
    />
  }
/>
```

### CloudbaseSignUp

注册框组件

![](https://main.qcloudimg.com/raw/ee4b6355b7f35b7aa1530bb2f4b34fa6.png)

#### 用法

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  signUp={
    <CloudbaseSignUp
      app={app}
      submitButtonText={'注册按钮文案'}
      userLoginType={LOGINTYPE.PHONE}
    />
  }
/>
```

#### 属性

| 字段             | 类型                                          | 必填 | 说明                                    |
| ---------------- | --------------------------------------------- | ---- | --------------------------------------- |
| headerText       | string                                        | 否   | 注册框头部文案                          |
| submitButtonText | string                                        | 否   | 注册按钮文案                            |
| signInText       | string                                        | 否   | 返回登录文案                            |
| userLoginType    | string                                        | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE) |
| formFields       | Array&lt;[FormFieldType](#FormFieldType) &gt; | 否   | 自定义表单项输入框                      |
| app              | Cloudbase                                     | 是   | cloudbase 实例                          |

#### 自定义 formFields

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  signUp={
    <CloudbaseSignUp
      app={app}
      userLoginType={LOGINTYPE.PHONE}
      submitButtonText={'注册按钮文案'}
      formFields={[
        {
          type: 'phone_number',
          required: true,
          placeholder: '请输入手机号',
          inputProps: {
            maxlength: 11
          }
        },
        {
          type: 'code',
          required: 'true',
          placeholder: '请输入验证码'
        },
        {
          type: 'password',
          required: true,
          placeholder: '请输入密码',
          inputProps: {
            minlength: 8,
            maxlength: 15,
            autoComplete: 'current-password', // 自动填充设置（HTML 标准属性）
            pattern: '[a-zA-Z0-9]+' // 正则校验，支持大小写字母及数字
          }
        }
      ]}
    />
  }
/>
```

### CloudbaseForgotPassword

忘记密码组件

![](https://main.qcloudimg.com/raw/6c741c08ab1b50b37e0a8bd3e1df8f3d.png)

> ⚠️ CloudbaseForgotPassword 组件暂只支持邮箱登录场景。

#### 用法

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.EMAIL}
  app={app}
  forgotPassword={
    <CloudbaseForgotPassword
      app={app}
      userLoginType={LOGINTYPE.EMAIL}
      submitButtonText={'忘记密码按钮文案'}
    />
  }
/>
```

#### 属性

| 字段             | 类型                                          | 必填 | 说明                                                  |
| ---------------- | --------------------------------------------- | ---- | ----------------------------------------------------- |
| headerText       | string                                        | 否   | 忘记密码框头部文案                                    |
| submitButtonText | string                                        | 否   | 按钮文案                                              |
| userLoginType    | string                                        | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE)，暂只支持邮箱 |
| formFields       | Array&lt;[FormFieldType](#FormFieldType) &gt; | 否   | 自定义表单项输入框                                    |
| app              | Cloudbase                                     | 是   | cloudbase 实例                                        |

#### 自定义 formFields

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.EMAIL}
  app={app}
  forgotPassword={
    <CloudbaseForgotPassword
      app={app}
      userLoginType={LOGINTYPE.EMAIL}
      submitButtonText={'忘记密码按钮文案'}
      formFields={[
        {
          type: 'email',
          required: true,
          placeholder: '请输入邮箱',
          inputProps: {
            maxlength: 11
          }
        }
      ]}
    />
  }
/>
```

### CloudbaseResetPassword

重置密码组件

![](https://main.qcloudimg.com/raw/0bc43253081303284946482f13aa4b56.png)

#### 用法

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  resetPassword={
    <CloudbaseResetPassword
      app={app}
      userLoginType={LOGINTYPE.PHONE}
      submitButtonText={'重置密码按钮文案'}
    />
  }
/>
```

#### 属性

| 字段             | 类型                                          | 必填 | 说明                                     |
| ---------------- | --------------------------------------------- | ---- | ---------------------------------------- |
| headerText       | string                                        | 否   | 重置框头部文案                           |
| submitButtonText | string                                        | 否   | 重置按钮文案                             |
| sendButtonText   | string                                        | 否   | 发送验证码按钮文案，仅支持手机号登录场景 |
| userLoginType    | string                                        | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE)  |
| formFields       | Array&lt;[FormFieldType](#FormFieldType) &gt; | 否   | 自定义表单项输入框                       |
| app              | Cloudbase                                     | 是   | cloudbase 实例                           |

#### 自定义 formFields

```javascript
<CloudbaseAuthenticator
  userLoginType={LOGINTYPE.PHONE}
  app={app}
  resetPassword={
    <CloudbaseResetPassword
      app={app}
      userLoginType={LOGINTYPE.PHONE}
      submitButtonText={'重置按钮文案'}
      formFields={[
        {
          type: 'phone_number',
          required: true,
          placeholder: '请输入手机号',
          inputProps: {
            maxlength: 11
          }
        },
        {
          type: 'code',
          required: 'true',
          placeholder: '请输入验证码'
        },
        {
          type: 'oldPassword',
          required: true,
          placeholder: '请输入旧密码',
          inputProps: {
            minlength: 8,
            maxlength: 15,
            autoComplete: 'current-password', // 自动填充设置（HTML 标准属性）
            pattern: '[a-zA-Z0-9]+' // 正则校验，支持大小写字母及数字
          }
        },
        {
          type: 'newPassword',
          required: true,
          placeholder: '请输入新密码',
          inputProps: {
            minlength: 8,
            maxlength: 15,
            autoComplete: 'new-password', // 自动填充设置（HTML 标准属性）
            pattern: '[a-zA-Z0-9]+' // 正则校验，支持大小写字母及数字
          }
        }
      ]}
    />
  }
/>
```

### CloudbaseSignOut

登出组件

![](https://main.qcloudimg.com/raw/eee994878066b5c34f6d155c661f904c.png)

#### 用法

参考[推荐用法](#推荐用法)，需在状态判断为已登录后使用。

#### 属性

| 字段             | 类型      | 必填 | 说明                                    |
| ---------------- | --------- | ---- | --------------------------------------- |
| submitButtonText | string    | 否   | 登出按钮文案                            |
| userLoginType    | string    | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE) |
| app              | Cloudbase | 是   | cloudbase 实例                          |

### CloudbaseSetUsername

更新用户名组件

![](https://main.qcloudimg.com/raw/7ef35ef2342cc0ff6cb316734736b44c.png)

#### 用法

参考[推荐用法](#推荐用法)，需在状态判断为已登录后使用。

#### 属性

| 字段             | 类型                                          | 必填 | 说明                                    |
| ---------------- | --------------------------------------------- | ---- | --------------------------------------- |
| submitButtonText | string                                        | 否   | 更新用户名按钮文案                      |
| userLoginType    | string                                        | 是   | 登录类型， 参考 [LOGINTYPE](#LOGINTYPE) |
| app              | Cloudbase                                     | 是   | cloudbase 实例                          |
| handleSubmit     | Cloudbase                                     | 否   | 自定义更新后业务逻辑                    |
| formFields       | Array&lt;[FormFieldType](#FormFieldType) &gt; | 否   | 自定义表单项输入框                      |

#### 自定义 formFields

```javascript
<CloudbaseSetUsername
  app={app}
  userLoginType={LOGINTYPE.PHONE}
  submitButtonText={'更新用户名文案'}
  formFields={[
    {
      type: 'username',
      required: true,
      placeholder: '请输入用户名',
      inputProps: {
        maxlength: 11
      }
    }
  ]}
/>
```

## 工具方法

### onAuthUIStateChange(app, handleStateChange)

状态监听器

#### 输入参数

| 字段              | 类型      | 必填 | 说明                                                                                                                                            |
| ----------------- | --------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| app               | Cloudbase | 是   | 完成 init 的 Cloudbase 实例                                                                                                                     |
| handleStateChange | Function  | 是   | 自定义状态处理回调函数，接收 2 个参数，参数 1 authState 表示监听到的 UI 状态，参数 2 authData 表示推送的 数据，若完成登录，则推送当前 user 信息 |

## 在线示例

<iframe src="https://codesandbox.io/embed/elegant-ganguly-59l0g?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="elegant-ganguly-59l0g"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   > </iframe>
