import { TextFieldTypes } from '../../common/ui-types';
import React, { ReactNode } from 'react';
import '../../../css/cloudbase-form-field/cloudbase-form-field.css';

interface CloudbaseFormFieldProps {
  fieldId?: string;
  label?: string;
  description?: string | null;
  hint?: string | ReactNode | null;
  type?: TextFieldTypes;
  required?: boolean;
  handleInputChange?: (inputEvent: React.FormEvent<HTMLInputElement>) => void;
  sendCode?: (phoneNumber: string) => Promise<boolean>;
  sendCodeIntervalTime?: number;
  placeholder?: string;
  name?: string;
  value?: string;
  inputProps?: object;
  disabled?: boolean;
}

interface CloudbaseFormFieldState {
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

export class CloudbaseFormField extends React.Component<
  CloudbaseFormFieldProps,
  CloudbaseFormFieldState
> {
  private static defaultProps = {
    sendCodeIntervalTime: 10
  };

  public constructor(props: CloudbaseFormFieldProps) {
    super(props);
    this.state = {
      sendCodeBtnDisabled: false,
      sendCodeBtnNumber: this.props.sendCodeIntervalTime || 60
    };
  }

  public render() {
    let content = null;
    switch (this.props.fieldId) {
      case 'code':
        content = (
          <div className='weui-cell weui-cell_vcode'>
            <div className='weui-cell__bd'>
              <input
                className='weui-input'
                id={this.props.fieldId}
                onInput={this.props.handleInputChange}
                placeholder={this.props.placeholder}
                name={this.props.name}
                value={this.props.value}
                {...this.props.inputProps}
                disabled={this.props.disabled}
              />
            </div>
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
        break;
      case 'phone_number':
        content = (
          <div className='weui-cell weui-cell_select weui-cell_select-before'>
            <div className='weui-cell__hd'>
              <select className='weui-select'>
                <option value='1'>+86</option>
              </select>
            </div>
            <div className='weui-cell__bd'>
              <input
                className='weui-input'
                id={this.props.fieldId}
                type='tell'
                onInput={this.props.handleInputChange}
                placeholder={this.props.placeholder}
                name={this.props.name}
                value={this.props.value}
                {...this.props.inputProps}
                disabled={this.props.disabled}
              />
            </div>
          </div>
        );
        break;
      default: {
        content = (
          <div className='weui-cell'>
            {this.props.label && (
              <div className='weui-cell__hd'>
                <div>
                  <label>{this.props.label}</label>
                </div>
              </div>
            )}
            <div className='weui-cell__bd'>
              <input
                className='weui-input'
                id={this.props.fieldId}
                type={this.props.type}
                onInput={this.props.handleInputChange}
                placeholder={this.props.placeholder}
                name={this.props.name}
                value={this.props.value}
                {...this.props.inputProps}
                disabled={this.props.disabled}
              />
            </div>
          </div>
        );
        break;
      }
    }

    return content;
  }
}
