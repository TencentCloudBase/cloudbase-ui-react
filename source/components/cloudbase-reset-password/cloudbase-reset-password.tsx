import React from 'react';

import {
  FormFieldTypes,
  FormFieldType,
  PhoneNumberInterface,
  PhoneFormFieldType,
  CodeDeliveryType,
  ResetPasswordAttributes
} from '../../common/auth-type';
import {
  AUTHSTATE,
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
  handleResetPassword,
  handleSendCode
  // handlePhoneNumberChange
} from '../../common/helper';
import { stringify } from 'querystring';

interface CloudbaseResetPasswordProps {
  headerText?: string;
  sendButtonText?: string;
  submitButtonText?: string;
  formFields?: FormFieldTypes;
  userLoginType: LOGINTYPE;
  forgotPasswordText?: string;
  app: cloudbase.app.App;
}

interface CloudbaseResetPasswordState {
  loading: boolean;
  phoneNumber: PhoneNumberInterface;
  newFormFields: FormFieldTypes;
  resetPasswordAttrs: ResetPasswordAttributes;
  email: string;
  username: string;
}

export class CloudbaseResetPassword extends React.Component<
  CloudbaseResetPasswordProps,
  CloudbaseResetPasswordState
> {
  private static defaultProps = {
    headerText: Translations.RESET_YOUR_PASSWORD,
    sendButtonText: Translations.SEND_CODE,
    submitButtonText: Translations.SUBMIT,
    forgotPasswordText: Translations.FORGOT_PASSWORD_TEXT,
    formFields: [],
    userLoginType: LOGINTYPE.USERNAME
  };

  private eventBus = this.props.app.eventBus;

  private handleAuthStateChange = dispatchAuthStateChangeEvent;

  public constructor(props: CloudbaseResetPasswordProps) {
    super(props);
    this.state = {
      loading: false,
      phoneNumber: {
        countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
        phoneNumberValue: null
      },
      email: '',
      username: '',
      newFormFields: [],
      resetPasswordAttrs: {
        userInput: '',
        oldPassword: '',
        newPassword: '',
        code: ''
      }
    };
  }

  public componentDidMount() {
    checkUserLoginType(this.props.userLoginType);
    this.buildFormFields();
  }

  public render() {
    const submitFn = (event: any) => this.handleSubmit(event);

    const submitButtonText = this.props.submitButtonText;
    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={submitFn}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        secondaryFooterContent={
          <div className='weui-flex'>
            <div className='weui-cell weui-cell_link weui-flex__item'>
              <div
                className='weui-cell__bd'
                onClick={() =>
                  this.handleAuthStateChange(this.eventBus, AUTHSTATE.SIGNIN)
                }
              >
                {Translations.BACK_TO_SIGN_IN}{' '}
              </div>
            </div>
            <div className='weui-cell weui-cell_link weui-flex__item'></div>
            {this.props.userLoginType === LOGINTYPE.EMAIL ? (
              <div className='weui-cell weui-cell_link weui-flex__item'>
                <div
                  className='weui-cell__bd'
                  onClick={() =>
                    this.handleAuthStateChange(
                      this.eventBus,
                      AUTHSTATE.FORGOTPASSWORD
                    )
                  }
                >
                  {this.props.forgotPasswordText}
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        }
        submitButtonText={this.props.submitButtonText || ''}
      ></CloudbaseFormSection>
    );
  }

  private handleSubmit(event: Event) {
    return this.submit(event);
  }

  private handleSend(app: cloudbase.app.App) {
    // const auth = app.auth({ persistence: 'local' })
    return (value: any) => {
      return handleSendCode(app, this.state.phoneNumber.phoneNumberValue || '');
    };
  }

  private buildFormFields() {
    const formFields = this.props.formFields || [];
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
      this.setFieldValue(newFields, this.state.resetPasswordAttrs);

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
              resetPasswordAttrs: {
                ...prevState.resetPasswordAttrs,
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
              resetPasswordAttrs: {
                ...prevState.resetPasswordAttrs,
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
              resetPasswordAttrs: {
                ...prevstate.resetPasswordAttrs,
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
              resetPasswordAttrs: {
                ...prevstate.resetPasswordAttrs,
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
              resetPasswordAttrs: {
                ...prevState.resetPasswordAttrs,
                code: value
              }
            };
          });
        };
      default:
        return;
    }
  }

  private setFieldValue(
    fields: Array<PhoneFormFieldType | FormFieldType>,
    formAttributes: ResetPasswordAttributes
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

    const username = this.state.resetPasswordAttrs.userInput.trim();

    // this.loading = true
    this.setState({
      loading: true
    });

    try {
      await handleResetPassword({
        app: this.props.app,
        loginType: this.props.userLoginType,
        handleAuthStateChange: this.handleAuthStateChange,
        username,
        oldPassword: this.state.resetPasswordAttrs.oldPassword || '',
        newPassword: this.state.resetPasswordAttrs.newPassword || '',
        code: this.state.resetPasswordAttrs.code || ''
      });
    } catch (error) {
      dispatchToastHubEvent(this.eventBus, {
        code: error.code,
        message: error.message,
        type: EVENT_TYPE.TOAST_AUTH_ERROR_EVENT
      });
    } finally {
      this.setState({});
    }
  }
}
