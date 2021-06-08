import React from 'react';

import {
  FormFieldTypes,
  FormFieldType,
  PhoneNumberInterface,
  PhoneFormFieldType,
  LOGINTYPE,
  OAuthConfig
} from '../../common/auth-type';
import { AuthState, AuthStateHandler } from '../../common/auth-type';
import { Translations } from '../../common/Translations';
import { COUNTRY_DIAL_CODE_DEFAULT } from '../../common/constant';
import { CloudbaseFormSection } from '../cloudbase-form-section/cloudbase-form-section';

import {
  dispatchAuthStateChangeEvent,
  checkUserLoginType,
  handleSendCode
} from '../../common/helper';
import { handleSignIn, checkWXOauthLoginCode } from '../../common/helper';
import cloudbase from '../../common/cloudbase';

interface SignInAttributes {
  userInput: string;
  password?: string;
  code?: string;
}

interface CloudbaseSignInProps {
  userLoginType: LOGINTYPE;
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  headerText?: string;
  submitButtonText?: string;
  handleAuthStateChange?: AuthStateHandler;
  formFields?: FormFieldTypes;
  hideSignUp?: boolean;
  app: cloudbase.app.App;
  isUsePassword?: boolean;
  oauthConfig?: OAuthConfig;
  createAccountText?: string;
  resetPasswordText?: string;
}

interface CloudbaseSignInState {
  loading: boolean;
  signInAttributes: {
    userInput: string;
    password?: string;
    code?: string;
  };
  newFormFields: FormFieldTypes;
  phoneNumber?: PhoneNumberInterface;
  email?: string;
  username?: string;
}

export class CloudbaseSignIn extends React.Component<
  CloudbaseSignInProps,
  CloudbaseSignInState
> {
  private static defaultProps = {
    headerText: Translations.SIGN_IN_HEADER_TEXT,
    submitButtonText: Translations.SIGN_IN_ACTION,
    formFields: [],
    hideSignUp: false,
    isUsePassword: true, // Used in phoneNumber login
    createAccountText: Translations.CREATE_ACCOUNT_TEXT,
    resetPasswordText: Translations.RESET_PASSWORD_TEXT
  };

  private eventBus = this.props.app.eventBus;

  public constructor(props: CloudbaseSignInProps) {
    super(props);
    this.state = {
      loading: false,
      signInAttributes: {
        userInput: '',
        password: '',
        code: ''
      },
      newFormFields: [],
      phoneNumber: {
        countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
        phoneNumberValue: null
      },
      email: '',
      username: ''
    };
  }

  // TODO:
  public componentDidMount() {
    checkUserLoginType(this.props.userLoginType);
    this.buildFormFields();
    // 微信授权登录特殊处理
    if (this.props.userLoginType.indexOf('WECHAT') > -1) {
      const code = checkWXOauthLoginCode();

      if (code) {
        this.setState({
          loading: true
        });

        handleSignIn({
          app: this.props.app,
          loginType: this.props.userLoginType,
          handleAuthStateChange:
            this.props.handleAuthStateChange ||
            this.defaultHandleAuthStateChange,
          oauthConfig: this.props.oauthConfig
        }).then(() => {
          this.setState({
            loading: false
          });
        });
      }
    }
  }

  public render() {
    const handleSubmit =
      this.props.handleSubmit || this.defaultHandleSubmit.bind(this);
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;

    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={handleSubmit}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        submitButtonText={
          this.props.userLoginType.indexOf('WECHAT') >= 0
            ? Translations.WECHAT_OAUTH_LOGIN
            : this.props.submitButtonText || ''
        }
        secondaryFooterContent={
          !this.props.hideSignUp ? (
            <div className='weui-flex'>
              <div className='weui-cell weui-cell_link weui-flex__item'>
                <div
                  className='weui-cell__bd'
                  onClick={() =>
                    handleAuthStateChange(this.eventBus, AuthState.SignUp)
                  }
                >
                  {this.props.createAccountText}
                </div>
              </div>
              <div className='weui-cell weui-cell_link weui-flex__item'></div>
              <div className='weui-cell weui-cell_link weui-flex__item'>
                <div
                  className='weui-cell__bd'
                  onClick={() =>
                    handleAuthStateChange(
                      this.eventBus,
                      AuthState.ForgotPassword
                    )
                  }
                >
                  {this.props.resetPasswordText}
                </div>
              </div>
            </div>
          ) : (
            <span></span>
          )
        }
      ></CloudbaseFormSection>
    );
  }

  private defaultHandleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }
    return this.signIn();
  }

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent;

  private handleFormFieldInputChange(fieldType: string): any {
    switch (fieldType) {
      case 'phone_number':
        return (event: any) => {
          const value = event.target.value;
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                userInput: value
              },
              phoneNumber: {
                ...prevState.phoneNumber,
                phoneNumberValue: value
              }
            };
          });
        };
      case 'email':
        return (event: any) => {
          const value = event.target.value;
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                userInput: value
              },
              email: value
            };
          });
        };
      case 'username':
        return (event: any) => {
          const value = event.target.value;
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                userInput: value
              },
              username: value
            };
          });
        };
      case 'password':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevstate) => {
            return {
              ...prevstate,
              signInAttributes: {
                ...prevstate.signInAttributes,
                password: value
              }
            };
          });
        };

      case 'code':
        return (event: any) => {
          const value = event.target.value;

          // (this.signUpAttributes.password = event.target.value)
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                code: value
              }
            };
          });
        };
    }
  }

  private handleFormFieldInputWithCallback(
    event: React.FormEvent<HTMLInputElement>,
    field: FormFieldType
  ) {
    const fnToCall = field['handleInputChange']
      ? field['handleInputChange']
      : (event: any, cb: any) => {
          cb(event);
        };
    const callback = this.handleFormFieldInputChange(field.type);
    fnToCall(event, callback.bind(this));
  }

  private async signIn() {
    this.setState({
      loading: true
    });

    const username = this.state.signInAttributes.userInput.trim();
    await handleSignIn({
      app: this.props.app,
      loginType: this.props.userLoginType,
      handleAuthStateChange:
        this.props.handleAuthStateChange || this.defaultHandleAuthStateChange,
      username,
      password: this.state.signInAttributes.password || '',
      code: this.state.signInAttributes.code || '',
      isUsePassword:
        this.props.isUsePassword !== undefined
          ? this.props.isUsePassword
          : true,
      oauthConfig: this.props.oauthConfig
    });
    this.setState({
      loading: false
    });
  }

  private handleSend(app: cloudbase.app.App) {
    // const auth = app.auth({ persistence: 'local' })
    return (value: any) => {
      return handleSendCode(
        app,
        this.state.phoneNumber?.phoneNumberValue || ''
      );
    };
  }

  private buildDefaultFormFields() {
    const formFieldInputs: any = [];
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;

    switch (this.props.userLoginType) {
      case LOGINTYPE.PHONE:
        formFieldInputs.push({
          fieldId: 'phone_number',
          type: 'phone_number',
          placeholder: Translations.PHONENUMBER_PLACEHOLDER,
          required: true,
          handleInputChange: this.handleFormFieldInputChange('phone_number')
        });
        break;
      case LOGINTYPE.EMAIL:
        formFieldInputs.push({
          fieldId: 'email',
          type: 'email',
          placeholder: Translations.EMAIL_PLACEHOLDER,
          required: true,
          handleInputChange: this.handleFormFieldInputChange('email')
        });
        break;
      case LOGINTYPE.USERNAME:
        formFieldInputs.push({
          fieldId: 'username',
          type: 'username',
          required: true,
          placeholder: Translations.USERNAME_PLACEHOLDER,
          handleInputChange: this.handleFormFieldInputChange('username')
        });
        break;
      default:
        break;
    }

    // use password or code
    if (this.props.userLoginType.indexOf('WECHAT') < 0) {
      if (this.props.isUsePassword) {
        formFieldInputs.push({
          fieldId: 'password',
          type: 'password',
          placeholder: Translations.PASSWORD_PLACEHOLDER,
          required: true,
          handleInputChange: this.handleFormFieldInputChange('password')
        });
      } else {
        formFieldInputs.push({
          fieldId: 'code',
          type: 'code',
          placeholder: Translations.CODE_PLACEHOLDER,
          required: true,
          handleInputChange: this.handleFormFieldInputChange('code'),
          sendCode: this.handleSend(this.props.app)
        });
      }
    }

    this.setState({
      newFormFields: [...formFieldInputs]
    });
  }

  private buildFormFields() {
    const formFields = this.props.formFields || [];
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;
    if (formFields.length === 0) {
      this.buildDefaultFormFields();
    } else {
      const newFields: any = [];
      formFields.forEach((field) => {
        const newField = { ...field };
        // TODO: handle hint better
        if (newField.type === 'password') {
          newField['hint'] = (
            <div>
              {Translations.FORGOT_PASSWORD_TEXT}{' '}
              <button
                className='weui-btn weui-btn_primary'
                onClick={() =>
                  handleAuthStateChange(this.eventBus, AuthState.ForgotPassword)
                }
              >
                {Translations.RESET_PASSWORD_TEXT}
              </button>
            </div>
          );
        }
        newField['handleInputChange'] = (
          event: React.FormEvent<HTMLInputElement>
        ) => this.handleFormFieldInputWithCallback(event, field);
        newFields.push(newField);
      });
      this.setFieldValue(newFields, this.state.signInAttributes);
      // this.newFormFields = newFields
      this.setState({
        newFormFields: newFields
      });
    }
  }

  private setFieldValue(
    fields: Array<PhoneFormFieldType | FormFieldType>,
    formAttributes: SignInAttributes
  ) {
    let newFormAttributes: any = {};
    const newPhoneNumber: any = {};
    let newEmailValue = '',
      newUsernameValue = '';

    for (let field of fields) {
      switch (field.type) {
        case 'username':
          if (field.value === undefined) {
            newFormAttributes.userInput = '';
          } else {
            newFormAttributes.userInput = field.value;
          }
          newUsernameValue = newFormAttributes.userInput;
          break;
        case 'email':
          if (field.value === undefined) {
            newFormAttributes.userInput = '';
          } else {
            newFormAttributes.userInput = field.value;
          }
          newEmailValue = newFormAttributes.userInput;
          break;
        case 'phone_number':
          if ((field as PhoneFormFieldType).dialCode) {
            newPhoneNumber.countryDialCodeValue = (field as PhoneFormFieldType).dialCode;
          }
          newPhoneNumber.phoneNumberValue = field.value;
          break;
        case 'password':
          if (field.value === undefined) {
            newFormAttributes.password = '';
          } else {
            newFormAttributes.password = field.value;
          }
          break;
      }
    }

    newFormAttributes = {
      ...formAttributes,
      newFormAttributes
    };

    this.setState((prevstate) => {
      return {
        ...prevstate,
        phoneNumber: newPhoneNumber,
        email: newEmailValue,
        username: newUsernameValue,
        signInAttributes: newFormAttributes
      };
    });
  }
}
