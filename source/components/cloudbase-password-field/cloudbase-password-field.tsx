import { TextFieldTypes } from '../../common/ui-types';
import React, { ReactNode } from 'react';
import '../../../css/cloudbase-form-field/cloudbase-form-field.css';
import { CloudbaseFormFieldBase } from '../cloudbase-form-field-base/cloudbase-form-field-base';
import { Translations } from '../../common/Translations';

interface CloudbasePasswordFieldProps {
  fieldId?: string;
  label?: string;
  type?: TextFieldTypes;
  required?: boolean;
  handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  value?: string;
  inputProps?: object;
  disabled?: boolean;
}

export class CloudbasePasswordField extends React.Component<CloudbasePasswordFieldProps> {
  private static defaultProps = {
    fieldId: 'password',
    label: '',
    placeholder: Translations.PASSWORD_PLACEHOLDER,
    required: false
  };
  public constructor(props: CloudbasePasswordFieldProps) {
    super(props);
  }

  public render() {
    return (
      <div className='weui-cell'>
        {this.props.label && (
          <div className='weui-cell__hd'>
            <div>
              <label>{this.props.label}</label>
            </div>
          </div>
        )}
        <CloudbaseFormFieldBase
          fieldId={this.props.fieldId}
          placeholder={this.props.placeholder}
          required={this.props.required}
          handleInputChange={this.props.handleInputChange}
          value={this.props.value}
          inputProps={this.props.inputProps}
          disabled={this.props.disabled}
          type={this.props.type}
        ></CloudbaseFormFieldBase>
      </div>
    );
  }
}
