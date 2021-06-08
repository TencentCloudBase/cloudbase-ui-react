import React from 'react';
import cloudbase from '../../common/cloudbase';

import {
  FormFieldTypes,
  PhoneNumberInterface,
  FormFieldType,
  PhoneFormFieldType,
  LOGINTYPE,
  EVENT_TYPE
} from '../../common/auth-type';
import { COUNTRY_DIAL_CODE_DEFAULT } from '../../common/constant';
import {
  AuthState,
  AuthStateHandler,
  UsernameAliasStrings
} from '../../common/auth-type';

import {
  dispatchAuthStateChangeEvent,
  dispatchToastHubEvent,
  checkUserLoginType,
  handleSendCode
  // handlePhoneNumberChange
} from '../../common/helper';

import { CloudbaseFormSection } from '../cloudbase-form-section/cloudbase-form-section';

import { Translations } from '../../common/Translations';
import { handleSignIn, handleSignUp } from '../../common/helper';

interface SignUpAttributes {
  username: string;
  password: string;
  code?: string;
  attributes: {
    [userAttributes: string]: string;
  };
}

interface CloudbaseSignUpProps {
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  validationErrors?: string;
  headerText?: string;
  submitButtonText?: string;
  haveAccountText?: string;
  signInText?: string;
  userLoginType: LOGINTYPE;
  formFields?: FormFieldTypes;
  handleAuthStateChange?: AuthStateHandler;
  app: cloudbase.app.App;
}

interface CloudbaseSignUpState {
  loading: boolean;
  signUpAttributes: SignUpAttributes;
  newFormFields: FormFieldTypes;
  phoneNumber: PhoneNumberInterface;
  email: string;
}

export class CloudbaseSignUp extends React.Component<
  CloudbaseSignUpProps,
  CloudbaseSignUpState
> {
  private static defaultProps = {
    headerText: Translations.SIGN_UP_HEADER_TEXT,
    submitButtonText: Translations.SIGN_UP_SUBMIT_BUTTON_TEXT,
    haveAccountText: Translations.SIGN_UP_HAVE_ACCOUNT_TEXT,
    signInText: Translations.SIGN_IN_TEXT,
    formFields: [],
    userLoginType: LOGINTYPE.PHONE
  };

  private eventBus = this.props.app.eventBus;

  public constructor(props: CloudbaseSignUpProps) {
    super(props);
    this.state = {
      newFormFields: [],
      phoneNumber: {
        countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
        phoneNumberValue: null
      },
      loading: false,
      signUpAttributes: {
        username: '',
        password: '',
        code: '',
        attributes: {}
      },
      email: ''
    };
  }

  public componentDidMount() {
    checkUserLoginType(this.props.userLoginType);
    this.buildFormFields();
  }

  public render() {
    const handleSubmit = this.props.handleSubmit || this.defaultHandleSubmit;
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;
    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={handleSubmit}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        submitButtonText={this.props.submitButtonText || ''}
        secondaryFooterContent={
          <div className='weui-cell weui-cell_link'>
            {this.props.haveAccountText}{' '}
            <div
              className='cell__bd'
              onClick={() =>
                handleAuthStateChange(this.eventBus, AuthState.SignIn)
              }
            >
              {this.props.signInText}
            </div>
          </div>
        }
      ></CloudbaseFormSection>
    );
  }

  private defaultHandleSubmit = (event: React.FormEvent<HTMLFormElement>) =>
    this.signUp(event);

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent;

  private handleFormFieldInputChange(fieldType: string) {
    switch (fieldType) {
      case 'password':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevState) => {
            return {
              ...prevState,
              signUpAttributes: {
                ...prevState.signUpAttributes,
                password: value
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
              signUpAttributes: {
                ...prevState.signUpAttributes,
                username: value
              },
              email: value
            };
          });
        };
      case 'code':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevState) => {
            return {
              ...prevState,
              signUpAttributes: {
                ...prevState.signUpAttributes,
                code: value
              }
            };
          });
        };
      case 'phone_number':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevState) => {
            return {
              ...prevState,
              signUpAttributes: {
                ...prevState.signUpAttributes,
                username: value
              },
              phoneNumber: {
                ...prevState.phoneNumber,
                phoneNumberValue: value
              }
            };
          });
        };
      default:
        break;
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
    fnToCall(event, callback?.bind(this));
  }

  private async signUp(event: React.FormEvent<HTMLFormElement>) {
    const app = this.props.app;
    if (event) {
      event.preventDefault();
    }

    this.setState({
      loading: true
    });

    try {
      if (!this.state.signUpAttributes.username) {
        throw new Error(Translations.EMPTY_USERNAME);
      }
      if (this.state.signUpAttributes.username.indexOf(' ') >= 0) {
        throw new Error(Translations.USERNAME_REMOVE_WHITESPACE);
      }
      if (
        this.state.signUpAttributes.password !==
        this.state.signUpAttributes.password.trim()
      ) {
        throw new Error(Translations.PASSWORD_REMOVE_WHITESPACE);
      }

      // const data = await Auth.signUp(this.signUpAttributes)
      await handleSignUp(
        app,
        this.props.userLoginType,
        this.props.handleAuthStateChange || this.defaultHandleAuthStateChange,
        this.state.signUpAttributes.username,
        this.state.signUpAttributes.password,
        this.state.signUpAttributes.code || ''
      );
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  private handleSend(app: cloudbase.app.App) {
    return (value: any) => {
      return handleSendCode(app, this.state.phoneNumber.phoneNumberValue || '');
    };
  }

  private buildDefaultFormFields() {
    let newFormFields: any = [];
    switch (this.props.userLoginType) {
      case LOGINTYPE.PHONE:
        newFormFields = [
          {
            type: 'phone_number',
            fieldId: 'phone_number',
            required: true,
            placeholder: Translations.PHONENUMBER_PLACEHOLDER,
            handleInputChange: this.handleFormFieldInputChange('phone_number')
          },
          {
            fieldId: 'code',
            type: 'code',
            placeholder: Translations.CODE_PLACEHOLDER,
            required: true,
            handleInputChange: this.handleFormFieldInputChange('code'),
            sendCode: this.handleSend(this.props.app)
          },
          {
            type: 'password',
            fieldId: 'password',
            placeholder: Translations.PASSWORD_PLACEHOLDER,
            required: true,
            handleInputChange: this.handleFormFieldInputChange('password')
          }
        ];
        break;
      case LOGINTYPE.EMAIL:
        newFormFields = [
          {
            type: 'email',
            fieldId: 'email',
            required: true,
            placeholder: Translations.EMAIL_PLACEHOLDER,
            handleInputChange: this.handleFormFieldInputChange('email')
          },
          {
            type: 'password',
            fieldId: 'password',
            placeholder: Translations.PASSWORD_PLACEHOLDER,
            required: true,
            handleInputChange: this.handleFormFieldInputChange('password')
          }
        ];
        break;
      default:
        throw new Error(`unsupport sign up type ${this.props.userLoginType}`);
        break;
    }
    this.setState({
      newFormFields
    });
  }

  private buildFormFields() {
    const formFields = this.props.formFields || [];
    if (formFields.length === 0) {
      this.buildDefaultFormFields();
    } else {
      const newFields: FormFieldTypes = [];
      formFields.forEach((field) => {
        const newField = { ...field };
        newField['handleInputChange'] = (event) =>
          this.handleFormFieldInputWithCallback(event, field);
        newFields.push(newField);
      });
      this.setFieldValue(newFields, this.state.signUpAttributes);
      // this.newFormFields = newFields
      this.setState({
        newFormFields: newFields
      });
    }
  }

  private setFieldValue(
    fields: Array<PhoneFormFieldType | FormFieldType>,
    formAttributes: SignUpAttributes
  ) {
    let newFormAttributes: any = {};
    let newPhoneNumber: any = {};

    for (let field of fields) {
      switch (field.type) {
        case 'username':
          if (field.value === undefined) {
            newFormAttributes.username = '';
          } else {
            newFormAttributes.username = field.value;
          }
          break;
        case 'password':
          if (field.value === undefined) {
            newFormAttributes.password = '';
          } else {
            newFormAttributes.password = field.value;
          }
          break;
        case 'email':
          newFormAttributes.attributes.email = field.value;
          break;
        case 'phone_number':
          if ((field as PhoneFormFieldType).dialCode) {
            newPhoneNumber.countryDialCodeValue = (field as PhoneFormFieldType).dialCode;
          }
          newPhoneNumber.phoneNumberValue = field.value;
          break;
        default:
          newFormAttributes.attributes[field.type] = field.value;
          break;
      }
    }

    this.setState({
      signUpAttributes: newFormAttributes,
      phoneNumber: newPhoneNumber
    });
  }
}
