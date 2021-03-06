import React from 'react';
import {
  LOGINTYPE,
  AUTHSTATE,
  AuthStateHandler,
  EVENT_TYPE,
  EVENTITEM,
  OAuthConfig
} from '../../common/auth-type';
import {
  onAuthUIStateChange,
  dispatchAuthStateChangeEvent
} from '../../common/helper';
import { UI_AUTH_CHANNEL } from '../../common/constant';
import cloudbase from '../../common/cloudbase';
import { CloudbaseForgotPassword } from '../cloudbase-forgot-password/cloudbase-forgot-password';
import { CloudbaseResetPassword } from '../cloudbase-reset-password/cloudbase-reset-password';
import { CloudbaseSignIn } from '../cloudbase-sign-in/cloudbase-sign-in';
import { CloudbaseSignUp } from '../cloudbase-sign-up/cloudbase-sign-up';

export interface CloudbaseAuthenticatorProps {
  initialLoginState?: AUTHSTATE.SIGNIN | AUTHSTATE.SIGNUP;
  userLoginType: LOGINTYPE;
  isUsePassword?: boolean;
  handleAuthStateChange?: AuthStateHandler;
  app: cloudbase.app.App;
  handleToastEvent?: ({ data }: { data: EVENTITEM }) => {};
  signIn?: React.ReactElement;
  signUp?: React.ReactElement;
  forgotPassword?: React.ReactElement;
  resetPassword?: React.ReactElement;
  oauthConfig?: OAuthConfig;
}

export interface CloudbaseAuthenticatorState {
  authState: AUTHSTATE;
  authData: any; // loginState, user,
  toastMessage: string;
  toastType: string;
  hideToast: boolean;
}

export class CloudbaseAuthenticator extends React.Component<
  CloudbaseAuthenticatorProps,
  CloudbaseAuthenticatorState
> {
  private static defaultProps = {
    initialLoginState: AUTHSTATE.SIGNIN
  };

  private eventBus = this.props.app.eventBus;
  private toastEle: any;

  private loadingTimer: any = null;

  public constructor(props: CloudbaseAuthenticatorProps) {
    super(props);

    this.toastEle = React.createRef();
    this.state = {
      authState: AUTHSTATE.LOADING,
      authData: {},
      toastMessage: '',
      toastType: '',
      hideToast: false
    };
  }

  public componentDidMount() {
    const handleToastEvent =
      this.props.handleToastEvent || this.defaultHandleToastEvent;
    onAuthUIStateChange(this.props.app, (authState, authData) => {
      this.onAuthStateChange(authState, authData as any);
    });
    if (!this.state.hideToast) {
      this.eventBus.on(UI_AUTH_CHANNEL, handleToastEvent);
    }

    setTimeout(() => {
      // ?????????????????????
      const app = this.props.app;
      const auth = app.auth({ persistence: 'local' });
      if (auth.hasLoginState()) {
        const user = auth.currentUser;
        dispatchAuthStateChangeEvent(
          (app as any).eventBus,
          AUTHSTATE.SIGNEDIN,
          user
        );
      } else {
        dispatchAuthStateChangeEvent(
          (app as any).eventBus,
          this.props.initialLoginState || AUTHSTATE.SIGNIN
        );
      }
    }, 0);
  }

  public componentWillUnmount() {
    const handleToastEvent =
      this.props.handleToastEvent || this.defaultHandleToastEvent;
    const app: any = this.props.app;
    const eventBus = app.eventBus;
    this.loadingTimer && clearTimeout(this.loadingTimer);
    if (!this.state.hideToast) eventBus.off(UI_AUTH_CHANNEL, handleToastEvent);
    return onAuthUIStateChange;
  }

  public render() {
    return (
      <div className='page'>
        <div
          id='toast'
          style={
            this.state.toastMessage
              ? {
                  display: 'block'
                }
              : {
                  display: 'none'
                }
          }
          ref={this.toastEle}
        >
          <div className='weui-mask_transparent'></div>
          <div className='weui-toast weui-toast_text-more'>
            <i
              className={`${
                this.state.toastType === EVENT_TYPE.TOAST_SUCCESS_MSG
                  ? 'weui-icon-success-no-circle'
                  : 'weui-icon-warn'
              } weui-icon_toast`}
            ></i>
            <p className='weui-toast__content'>{this.state.toastMessage}</p>
          </div>
        </div>
        {this.state.authState === AUTHSTATE.SIGNEDIN ? (
          <div></div>
        ) : (
          <div className='auth-container'>
            {this.getAuthComponentFromChildren(this.state.authState)}
          </div>
        )}
      </div>
    );
  }

  private defaultHandleToastEvent = (params: { data: EVENTITEM }) => {
    const { data } = params;
    switch (data.event) {
      case EVENT_TYPE.TOAST_AUTH_ERROR_EVENT:
        if (data.message) {
          this.setState({
            toastMessage: data.message,
            toastType: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
          });

          this.loadingTimer = setTimeout(() => {
            this.setState({ toastMessage: '' });
          }, 2000);
        }
        break;
      case EVENT_TYPE.TOAST_SUCCESS_MSG:
        this.setState({
          toastMessage: data.message,
          toastType: EVENT_TYPE.TOAST_SUCCESS_MSG
        });
        this.loadingTimer = setTimeout(() => {
          this.setState({ toastMessage: '' });
        }, 2000);
        break;
    }
  };

  private onAuthStateChange(nextAuthState: AUTHSTATE, data?: any) {
    if (nextAuthState === undefined) return;

    this.setState({
      authState:
        nextAuthState === AUTHSTATE.SIGNEDOUT
          ? this.props.initialLoginState ||
            CloudbaseAuthenticator.defaultProps.initialLoginState
          : nextAuthState,
      // authState: AUTHSTATE.SIGNIN,
      authData: data
    });
  }

  // Returns the auth component corresponding to the given authState.
  private getAuthComponent(authState: AUTHSTATE): React.ReactElement {
    switch (authState) {
      case AUTHSTATE.SIGNIN:
        return this.props.signIn ? (
          this.props.signIn
        ) : (
          <CloudbaseSignIn
            app={this.props.app}
            userLoginType={this.props.userLoginType}
            isUsePassword={this.props.isUsePassword}
            hideSignUp={
              this.props.userLoginType === LOGINTYPE.WECHAT_OPEN ||
              this.props.userLoginType === LOGINTYPE.WECHAT_PUBLIC
            }
          />
        );
      case AUTHSTATE.SIGNUP:
        return this.props.signUp ? (
          this.props.signUp
        ) : (
          <CloudbaseSignUp
            userLoginType={this.props.userLoginType}
            app={this.props.app}
          />
        );
      case AUTHSTATE.FORGOTPASSWORD:
        return this.props.forgotPassword ? (
          this.props.forgotPassword
        ) : (
          <CloudbaseForgotPassword
            userLoginType={this.props.userLoginType}
            app={this.props.app}
          />
        );
      case AUTHSTATE.RESETPASSWORD:
        return this.props.resetPassword ? (
          this.props.resetPassword
        ) : (
          <CloudbaseResetPassword
            userLoginType={this.props.userLoginType}
            app={this.props.app}
          />
        );
      case AUTHSTATE.LOADING:
        return <div>Loading...</div>;
      default:
        throw new Error(`Unhandled auth state: ${authState}`);
    }
  }

  // Returns a slot containing the Auth component corresponding to the given authState
  private getAuthComponentFromChildren(
    authState: AUTHSTATE
  ): React.ReactElement {
    let authComponent = this.getAuthComponent(authState);

    // ???????????????
    const childrenElement: any = this.props.children;

    // ???????????? authState ????????????
    if (childrenElement) {
      switch (authState) {
        case AUTHSTATE.SIGNIN:
          authComponent = childrenElement.find(
            (item: any) => item.type === 'CloudbaseSignIn'
          );
          break;
        default:
          break;
      }
    }
    /**
     * Connect the inner auth component to DOM only if the slot hasn't been overwritten. This prevents
     * the overwritten component from calling its lifecycle methods.
     */
    return authComponent;
  }
}
