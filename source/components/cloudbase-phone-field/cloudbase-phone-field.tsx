import { TextFieldTypes } from '../../common/ui-types'
import React, { ReactNode } from 'react'
import '../../../css/cloudbase-form-field/cloudbase-form-field.css'
import { CloudbaseFormFieldBase } from '../cloudbase-form-field-base/cloudbase-form-field-base'
import { Translations } from '../../common/Translations'

interface CloudbasePhoneFieldProps {
  fieldId?: string
  label?: string
  type?: TextFieldTypes
  required?: boolean
  handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  name?: string
  value?: string
  inputProps?: object
  disabled?: boolean
}

export class CloudbasePhoneField extends React.Component<CloudbasePhoneFieldProps> {
  static defaultProps = {
    fieldId: 'phone_number',
    label: '',
    placeholder: Translations.PHONENUMBER_PLACEHOLDER,
    required: false
  }
  constructor(props: CloudbasePhoneFieldProps) {
    super(props)
  }

  render() {
    return (
      <div className='weui-cell weui-cell_select weui-cell_select-before'>
        <div className='weui-cell__hd'>
          <select className='weui-select'>
            <option value='1'>+86</option>
          </select>
        </div>
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
    )
  }
}
