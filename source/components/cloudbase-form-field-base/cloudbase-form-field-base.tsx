import { TextFieldTypes } from '../../common/ui-types';
import React, { ReactNode } from 'react';
import '../../../css/cloudbase-form-field/cloudbase-form-field.css';

interface CloudbaseFormFieldBaseProps {
  fieldId?: string;
  label?: string;
  description?: string | null;
  type?: TextFieldTypes;
  required?: boolean;
  handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  value?: string;
  inputProps?: object;
  disabled?: boolean;
}

export class CloudbaseFormFieldBase extends React.Component<CloudbaseFormFieldBaseProps> {
  public constructor(props: CloudbaseFormFieldBaseProps) {
    super(props);
  }

  public render() {
    return (
      <div className='weui-cell__bd'>
        <input
          className='weui-input'
          id={this.props.fieldId}
          type={this.props.type}
          onInput={this.props.handleInputChange}
          placeholder={this.props.placeholder}
          name={this.props.name}
          value={this.props.value}
          required={this.props.required}
          {...this.props.inputProps}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}
