import React from 'react';

import {
  FormFieldTypes,
  FormFieldType,
  PhoneNumberInterface,
  PhoneFormFieldType,
  CodeDeliveryType,
  ForgotPasswordAttributes
} from '../../common/auth-type';
import {
  AuthState,
  AuthStateHandler,
  UsernameAliasStrings,
  LOGINTYPE,
  EVENT_TYPE
} from '../../common/auth-type';
import { COUNTRY_DIAL_CODE_DEFAULT } from '../../common/constant';
import { Translations } from '../../common/Translations';
import cloudbase from '../../common/cloudbase';
import { CloudbaseFormSection } from '../cloudbase-form-section/cloudbase-form-section';

import {
  dispatchToastHubEvent,
  dispatchAuthStateChangeEvent,
  checkUserLoginType,
  handleForgotPassword,
  handleSendCode
  // handlePhoneNumberChange
} from '../../common/helper';
import { stringify } from 'querystring';

interface CloudbaseForgotPasswordProps {
  headerText?: string;
  sendButtonText?: string;
  submitButtonText?: string;
  formFields: FormFieldTypes;
  userLoginType: LOGINTYPE;
  app: cloudbase.app.App;
}

interface CloudbaseForgotPasswordState {
  delivery: CodeDeliveryType | null;
  loading: boolean;
  phoneNumber: PhoneNumberInterface;
  newFormFields: FormFieldTypes;
  forgotPasswordAttrs: ForgotPasswordAttributes;
  email: string;
  username: string;
}

export class CloudbaseForgotPassword extends React.Component<
  CloudbaseForgotPasswordProps,
  CloudbaseForgotPasswordState
> {
  static defaultProps = {
    headerText: Translations.RESET_YOUR_PASSWORD,
    sendButtonText: Translations.SEND_CODE,
    submitButtonText: Translations.SUBMIT,
    formFields: [],
    userLoginType: LOGINTYPE.USERNAME
  };

  private eventBus = this.props.app.eventBus;

  constructor(props: CloudbaseForgotPasswordProps) {
    super(props);
    this.state = {
      delivery: null,
      loading: false,
      phoneNumber: {
        countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
        phoneNumberValue: null
      },
      email: '',
      username: '',
      newFormFields: [],
      forgotPasswordAttrs: {
        userInput: '',
        oldPassword: '',
        newPassword: '',
        code: ''
      }
    };
  }

  private handleSubmit(event: Event) {
    return this.submit(event);
  }

  private handleAuthStateChange = dispatchAuthStateChangeEvent;

  componentDidMount() {
    checkUserLoginType(this.props.userLoginType);
    this.buildFormFields();
  }

  private handleSend(app: cloudbase.app.App) {
    // const auth = app.auth({ persistence: 'local' })
    return (value: any) => {
      return handleSendCode(app, this.state.phoneNumber.phoneNumberValue || '');
    };
  }

  private buildFormFields() {
    const formFields = this.props.formFields;
    if (formFields.length === 0) {
      this.buildDefaultFormFields();
    } else {
      const newFields: any = [];
      formFields.forEach((field) => {
        const newField = { ...field };
        newField['handleInputChange'] = (event) =>
          this.handleFormFieldInputWithCallback(event, field);
        newFields.push(newField);
      });
      this.setFieldValue(newFields, this.state.forgotPasswordAttrs);

      this.setState({
        newFormFields: newFields
      });
    }
  }

  private buildDefaultFormFields() {
    let newFormFields: any = [];
    const defaultFields = [
      {
        type: 'oldPassword',
        fieldId: 'oldPassword',
        placeholder: Translations.OLD_PASSWORD_PLACEHOLDER,
        required: true,
        handleInputChange: this.handleFormFieldInputChange('oldPassword')
      },
      {
        type: 'newPassword',
        fieldId: 'newPassword',
        placeholder: Translations.NEW_PASSWORD_PLACEHOLDER,
        required: true,
        handleInputChange: this.handleFormFieldInputChange('newPassword')
      }
    ];
    switch (this.props.userLoginType) {
      case LOGINTYPE.PHONE:
        newFormFields = [
          {
            fieldId: 'phone_number',
            type: 'phone_number',
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
          }
        ].concat(defaultFields);
        break;
      case LOGINTYPE.EMAIL:
        newFormFields = [
          {
            fieldId: 'email',
            type: 'email',
            required: true,
            placeholder: Translations.EMAIL_PLACEHOLDER,
            handleInputChange: this.handleFormFieldInputChange('email')
          }
        ].concat(defaultFields);
        break;
      case LOGINTYPE.USERNAME:
        newFormFields = [
          {
            fieldId: 'username',
            type: 'username',
            required: true,
            placeholder: Translations.USERNAME_PLACEHOLDER,
            handleInputChange: this.handleFormFieldInputChange('username')
          }
        ].concat(defaultFields);
        break;
      default:
        break;
    }

    this.setState({
      newFormFields: [...newFormFields]
    });
  }

  private handleFormFieldInputChange(fieldType: string): any {
    switch (fieldType) {
      case 'phone_number':
        return (event: any) => {
          const value = event.target.value;
          this.setState((prevState) => {
            return {
              ...prevState,
              forgotPasswordAttrs: {
                ...prevState.forgotPasswordAttrs,
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
              forgotPasswordAttrs: {
                ...prevState.forgotPasswordAttrs,
                userInput: value
              },
              email: value
            };
          });
        };
      // handlePhoneNumberChange(event, this.phoneNumber)
      case 'oldPassword':
        return (event: any) => {
          const value = event.target.value;
          this.setState((prevstate) => {
            return {
              ...prevstate,
              forgotPasswordAttrs: {
                ...prevstate.forgotPasswordAttrs,
                oldPassword: value
              }
            };
          });
        };
      case 'newPassword':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevstate) => {
            return {
              ...prevstate,
              forgotPasswordAttrs: {
                ...prevstate.forgotPasswordAttrs,
                newPassword: value
              }
            };
          });
        };
      // (this.forgotPasswordAttrs[fieldType] = event.target.value)
      case 'code':
        return (event: any) => {
          const value = event.target.value;

          this.setState((prevState) => {
            return {
              ...prevState,
              forgotPasswordAttrs: {
                ...prevState.forgotPasswordAttrs,
                code: value
              }
            };
          });
        };
      default:
        return;
    }
  }

  setFieldValue(
    fields: Array<PhoneFormFieldType | FormFieldType>,
    formAttributes: ForgotPasswordAttributes
  ) {
    let newFormAttributes: any = {};
    const newPhoneNumber: any = {};
    for (let field of fields) {
      switch (field.type) {
        case 'username':
        case 'email':
          if (field.value === undefined) {
            newFormAttributes.userInput = '';
          } else {
            newFormAttributes.userInput = field.value;
          }
          break;
        case 'phone_number':
          if ((field as PhoneFormFieldType).dialCode) {
            newPhoneNumber.countryDialCodeValue = (field as PhoneFormFieldType).dialCode;
          }
          newPhoneNumber.phoneNumberValue = field.value;
          break;
        case 'oldPassword':
        case 'newPassword':
        case 'code':
          if (field.value === undefined) {
            newFormAttributes[field.type] = '';
          } else {
            newFormAttributes[field.type] = field.value;
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
        forgotPasswordAttrs: newFormAttributes
      };
    });
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

  private async submit(event: Event) {
    if (event) {
      event.preventDefault();
    }

    const username = this.state.forgotPasswordAttrs.userInput.trim();

    // this.loading = true
    this.setState({
      loading: true
    });

    try {
      await handleForgotPassword({
        app: this.props.app,
        loginType: this.props.userLoginType,
        handleAuthStateChange: this.handleAuthStateChange,
        username,
        oldPassword: this.state.forgotPasswordAttrs.oldPassword || '',
        newPassword: this.state.forgotPasswordAttrs.newPassword || '',
        code: this.state.forgotPasswordAttrs.code || ''
      });
    } catch (error) {
      dispatchToastHubEvent(this.eventBus, {
        code: error.code,
        message: error.message,
        type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
      });
    } finally {
      // this.loading = false
      this.setState({});
    }
  }

  render() {
    const submitFn = (event: any) => this.handleSubmit(event);

    const submitButtonText = this.props.submitButtonText;
    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={submitFn}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        secondaryFooterContent={
          <div className='weui-cell weui-cell_link'>
            <div
              className='weui-cell__bd'
              onClick={() =>
                this.handleAuthStateChange(this.eventBus, AuthState.SignIn)
              }
            >
              {Translations.BACK_TO_SIGN_IN}{' '}
            </div>
          </div>
        }
        submitButtonText={this.props.submitButtonText || ''}
      ></CloudbaseFormSection>
    );
  }
}
