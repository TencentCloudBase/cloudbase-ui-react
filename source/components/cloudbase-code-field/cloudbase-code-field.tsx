import { TextFieldTypes } from '../../common/ui-types';
import React, { ReactNode } from 'react';
import '../../../css/cloudbase-form-field/cloudbase-form-field.css';
import { CloudbaseFormFieldBase } from '../cloudbase-form-field-base/cloudbase-form-field-base';
import { Translations } from '../../common/Translations';

interface CloudbaseCodeFieldProps {
  fieldId?: string;
  label?: string;
  type?: TextFieldTypes;
  required?: boolean;
  handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  sendCode?: (phoneNumber: string) => Promise<boolean>;
  sendCodeIntervalTime?: number;
  name?: string;
  value?: string;
  inputProps?: object;
  disabled?: boolean;
}

interface CloudbaseCodeFieldState {
  sendCodeBtnDisabled?: boolean;
  sendCodeBtnNumber?: number;
}

function countdown(
  totalTime: number,
  internalCallBack: any,
  finishCallback: any
) {
  if (totalTime === 0) {
    finishCallback();
    return;
  }

  const timer = setTimeout(() => {
    internalCallBack();
    clearTimeout(timer);
    countdown(--totalTime, internalCallBack, finishCallback);
  }, 1000);
}

export class CloudbaseCodeField extends React.Component<
  CloudbaseCodeFieldProps,
  CloudbaseCodeFieldState
> {
  private static defaultProps = {
    fieldId: 'code',
    label: '',
    placeholder: Translations.CODE_PLACEHOLDER,
    required: false,
    sendCodeIntervalTime: 10
  };
  public constructor(props: CloudbaseCodeFieldProps) {
    super(props);
    this.state = {
      sendCodeBtnDisabled: false,
      sendCodeBtnNumber: this.props.sendCodeIntervalTime || 60
    };
  }

  public render() {
    return (
      <div className='weui-cell weui-cell_vcode'>
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
        <div className='weui-cell__ft'>
          <a
            // type="vcode"
            className={
              this.state.sendCodeBtnDisabled
                ? 'isDisabled weui-vcode-btn'
                : 'btnNormal weui-vcode-btn'
            }
            onClick={(event: any) => {
              event.preventDefault();
              this.setState({
                sendCodeBtnDisabled: true
              });
              if (this.props.sendCode) {
                this.props.sendCode(this.props.value || '');

                // 指定时间内禁用
                countdown(
                  this.props.sendCodeIntervalTime || 60,
                  () => {
                    this.setState((prevState: any) => {
                      return {
                        ...prevState,
                        sendCodeBtnNumber: prevState.sendCodeBtnNumber - 1
                      };
                    });
                  },
                  () => {
                    this.setState({
                      sendCodeBtnDisabled: false,
                      sendCodeBtnNumber: this.props.sendCodeIntervalTime
                    });
                  }
                );
              }
            }}
          >
            {this.state.sendCodeBtnDisabled
              ? `${this.state.sendCodeBtnNumber} s 发送`
              : '发送'}
          </a>
        </div>
      </div>
    );
  }
}
