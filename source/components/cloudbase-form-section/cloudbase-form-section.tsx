import React from 'react';
import { FormFieldType, FormFieldTypes } from '../../common/auth-type';
// import { CloudbaseFormField } from '../cloudbase-form-field/cloudbase-form-field'
import { CloudbaseCodeField } from '../cloudbase-code-field/cloudbase-code-field';
import { CloudbasePhoneField } from '../cloudbase-phone-field/cloudbase-phone-field';
import { CloudbaseEmailField } from '../cloudbase-email-field/cloudbase-email-field';
import { CloudbaseUsernameField } from '../cloudbase-username-field/cloudbase-username-field';
import { CloudbasePasswordField } from '../cloudbase-password-field/cloudbase-password-field';

interface CloudbaseFormSectionProps {
  submitButtonText: string;
  loading: boolean;
  headerText?: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formFields: FormFieldTypes;
  secondaryFooterContent?: string | React.ReactNode | null;
}

/**
 * @slot amplify-form-section-header - Content for the header section
 * @slot subtitle - Content for the subtitle. This is inside of `amplify-form-section-header`.
 * @slot amplify-form-section-footer - Content for the footer section.
 */
export class CloudbaseFormSection extends React.Component<CloudbaseFormSectionProps> {
  public constructor(props: CloudbaseFormSectionProps) {
    super(props);
  }

  public render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <div className='weui-cells weui-cells_form'>
          <div className='weui-cell'>
            <div className='weui-cell__bd'>
              <h3 className='header'>{this.props.headerText}</h3>
            </div>
          </div>

          <div className='auth-fields'>
            {this.constructFormFieldOptions(this.props.formFields)}
          </div>
          <div className='weui-cell'>
            <div className='weui-cell__bd'>
              <button
                type='submit'
                className='weui-btn weui-btn_primary'
                // onClick={this.props.handleSubmit as any}
              >
                {this.props.loading ? (
                  <>loading</>
                ) : (
                  <span>{this.props.submitButtonText}</span>
                )}
              </button>
            </div>
          </div>
          {this.props.secondaryFooterContent}
        </div>
      </form>
    );
  }

  private handleFormSubmit(ev: any) {
    this.props.handleSubmit(ev.detail);
  }

  private componentFieldMapping(ff: FormFieldType, index: number) {
    const { type } = ff;
    let fieldContent;
    switch (type) {
      case 'phone_number':
        fieldContent = (
          <CloudbasePhoneField
            key={index}
            label={ff.label}
            placeholder={ff.placeholder}
            required={ff.required}
            handleInputChange={ff.handleInputChange}
            value={ff.value}
            inputProps={ff.inputProps}
            disabled={ff.disabled}
          ></CloudbasePhoneField>
        );
        break;
      case 'username':
        fieldContent = (
          <CloudbaseUsernameField
            key={index}
            label={ff.label}
            placeholder={ff.placeholder}
            required={ff.required}
            handleInputChange={ff.handleInputChange}
            value={ff.value}
            inputProps={ff.inputProps}
            disabled={ff.disabled}
          ></CloudbaseUsernameField>
        );
        break;
      case 'email':
        fieldContent = (
          <CloudbaseEmailField
            key={index}
            label={ff.label}
            placeholder={ff.placeholder}
            required={ff.required}
            handleInputChange={ff.handleInputChange}
            value={ff.value}
            inputProps={ff.inputProps}
            disabled={ff.disabled}
          ></CloudbaseEmailField>
        );
        break;
      case 'code':
        fieldContent = (
          <CloudbaseCodeField
            key={index}
            label={ff.label}
            placeholder={ff.placeholder}
            required={ff.required}
            handleInputChange={ff.handleInputChange}
            value={ff.value}
            inputProps={ff.inputProps}
            disabled={ff.disabled}
            sendCode={ff.sendCode}
          ></CloudbaseCodeField>
        );
        break;
      case 'password':
      case 'oldPassword':
      case 'newPassword':
        fieldContent = (
          <CloudbasePasswordField
            key={index}
            label={ff.label}
            placeholder={ff.placeholder}
            required={ff.required}
            handleInputChange={ff.handleInputChange}
            value={ff.value}
            inputProps={ff.inputProps}
            disabled={ff.disabled}
          ></CloudbasePasswordField>
        );
        break;
      default:
        break;
    }
    return fieldContent;
  }

  private constructFormFieldOptions(formFields: FormFieldTypes) {
    const content: any[] = [];

    if (formFields === undefined) return content;

    formFields.forEach((formField: FormFieldType, index) => {
      content.push(this.componentFieldMapping(formField, index));
    });

    return content;
  }
}
