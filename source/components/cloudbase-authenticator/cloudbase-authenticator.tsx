import React from "react"
import {
  LOGINTYPE,
  AuthState,
  AuthStateHandler,
  EVENT_TYPE,
  EVENTITEM
} from "../../common/auth-type"
import {
  onAuthUIStateChange,
  dispatchAuthStateChangeEvent
} from "../../common/helper"
import { UI_AUTH_CHANNEL } from "../../common/constant"
import cloudbase from "@cloudbase/js-sdk"
import { CloudbaseForgotPassword } from "../cloudbase-forgot-password/cloudbase-forgot-password"
import { CloudbaseRequireNewPassword } from "../cloudbase-require-new-password/cloudbase-require-new-password"
import { CloudbaseSignIn } from "../cloudbase-sign-in/cloudbase-sign-in"
// import { CloudbaseSignOut } from "../cloudbase-sign-out/cloudbase-sign-out"
import { CloudbaseSignUp } from "../cloudbase-sign-up/cloudbase-sign-up"
// const { Page } = require("react-weui")

export interface CloudbaseAuthenticatorProps {
  initialLoginState?: AuthState.SignIn | AuthState.SignUp
  userLoginType: LOGINTYPE
  isUsePassword?: boolean
  handleAuthStateChange?: AuthStateHandler
  app: cloudbase.app.App
}

export interface CloudbaseAuthenticatorState {
  authState: AuthState
  authData: any // loginState, user,
  toastMessage: string
  hideToast: boolean
}

export class CloudbaseAuthenticator extends React.Component<
  CloudbaseAuthenticatorProps,
  CloudbaseAuthenticatorState
> {
  static defaultProps = {
    initialLoginState: AuthState.SignIn
  }

  private eventBus = this.props.app.eventBus

  constructor(props: CloudbaseAuthenticatorProps) {
    super(props)

    this.state = {
      authState: AuthState.Loading,
      authData: {},
      toastMessage: "",
      hideToast: false
    }
  }

  componentDidMount() {
    console.log("authenticator 渲染次数")
    onAuthUIStateChange(this.props.app, (authState, authData) => {
      console.log(">>>>>>>>", authState, authData)
      this.onAuthStateChange(authState, authData as any)
      this.setState({
        toastMessage: ""
      })
    })
    if (!this.state.hideToast) {
      console.log("+++++++")
      this.eventBus.on(UI_AUTH_CHANNEL, this.handleToastEvent)
    }

    setTimeout(() => {
      // 判断是否已登录
      const app = this.props.app
      const auth = app.auth({ persistence: "local" })
      if (auth.hasLoginState()) {
        const user = auth.currentUser
        dispatchAuthStateChangeEvent(
          (app as any).eventBus,
          AuthState.SignedIn,
          user
        )
      } else {
        dispatchAuthStateChangeEvent(
          (app as any).eventBus,
          this.props.initialLoginState || AuthState.SignIn
        )
      }
    }, 0)
  }

  private defaultHandleAuthStateChange: AuthStateHandler = () => {}

  private handleToastEvent = ({ data }: { data: EVENTITEM }) => {
    switch (data.event) {
      case EVENT_TYPE.TOAST_AUTH_ERROR_EVENT:
        if (data.message) {
          this.setState({
            toastMessage: data.message
          })
        }
        break
    }
  }

  private onAuthStateChange(nextAuthState: AuthState, data?: any) {
    if (nextAuthState === undefined) return

    this.setState({
      authState:
        nextAuthState === AuthState.SignedOut
          ? this.props.initialLoginState ||
            CloudbaseAuthenticator.defaultProps.initialLoginState
          : nextAuthState,
      // authState: AuthState.SignIn,
      authData: data
    })
  }

  // Returns the auth component corresponding to the given authState.
  private getAuthComponent(authState: AuthState): React.ReactElement {
    switch (authState) {
      case AuthState.SignIn:
        return (
          <CloudbaseSignIn
            app={this.props.app}
            userLoginType={this.props.userLoginType}
            isUsePassword={this.props.isUsePassword}
          />
        )
      case AuthState.SignUp:
        return (
          <CloudbaseSignUp
            userLoginType={this.props.userLoginType}
            app={this.props.app}
          />
        )
      // case AuthState.ForgotPassword:
      //   return <CloudbaseForgotPassword usernameAlias={this.usernameAlias} />
      // case AuthState.ResetPassword:
      //   return <CloudbaseRequireNewPassword user={this.authData} />
      case AuthState.Loading:
        return <div>Loading...</div>
      default:
        throw new Error(`Unhandled auth state: ${authState}`)
    }
  }

  // Returns a slot containing the Auth component corresponding to the given authState
  private getAuthComponentFromChildren(
    authState: AuthState
  ): React.ReactElement {
    let authComponent = this.getAuthComponent(authState)

    // 识别子组件
    const childrenElement: any = this.props.children

    // 获取当前 authState 对应组件
    if (childrenElement) {
      switch (authState) {
        case AuthState.SignIn:
          authComponent = childrenElement.find(
            (item: any) => item.type === "CloudbaseSignIn"
          )
          break
        default:
          break
      }
    }
    console.log("authComponent", authComponent)
    /**
     * Connect the inner auth component to DOM only if the slot hasn't been overwritten. This prevents
     * the overwritten component from calling its lifecycle methods.
     */
    return authComponent
  }

  componentWillUnmount() {
    const app: any = this.props.app
    const eventBus = app.eventBus
    // Hub.remove(AUTH_CHANNEL, this.handleExternalAuthEvent)
    if (!this.state.hideToast)
      eventBus.off(UI_AUTH_CHANNEL, this.handleToastEvent)
    return onAuthUIStateChange
  }

  render() {
    console.log("authState****", this.state)
    return (
      <div className="page">
        {this.state.authState === AuthState.SignedIn ? (
          <div>hello {this.state.authData.uid}</div>
        ) : (
          <div className="auth-container">
            {this.getAuthComponentFromChildren(this.state.authState)}
          </div>
        )}
      </div>
    )
  }
}
