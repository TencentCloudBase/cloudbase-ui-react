import React from "react"
import { FormFieldType, FormFieldTypes } from "../../common/auth-type"
import { CloudbaseFormField } from "../cloudbase-form-field/cloudbase-form-field"
// import ReactWEUI from "react-weui"

// const {
//   Form,
//   FormCell,
//   CellBody,
//   CellFooter,
//   CellHeader,
//   Label,
//   Button,
//   Input,
//   Select,
//   Page
// } = ReactWEUI as any

interface CloudbaseFormSectionProps {
  submitButtonText: string
  loading: boolean
  headerText?: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  formFields: FormFieldTypes
  secondaryFooterContent?: string | React.ReactNode | null
}

/**
 * @slot amplify-form-section-header - Content for the header section
 * @slot subtitle - Content for the subtitle. This is inside of `amplify-form-section-header`.
 * @slot amplify-form-section-footer - Content for the footer section.
 */
export class CloudbaseFormSection extends React.Component<CloudbaseFormSectionProps> {
  constructor(props: CloudbaseFormSectionProps) {
    super(props)
  }

  private handleFormSubmit(ev: any) {
    this.props.handleSubmit(ev.detail)
  }

  private componentFieldMapping(
    ff: FormFieldType,
    index: number,
    children?: React.ReactNode
  ) {
    return (
      <CloudbaseFormField
        fieldId={ff.fieldId}
        key={index}
        label={ff.label}
        placeholder={ff.placeholder}
        required={ff.required}
        handleInputChange={ff.handleInputChange}
        sendCode={ff.sendCode}
        value={ff.value}
        inputProps={ff.inputProps}
        disabled={ff.disabled}
      />
    )
  }

  private constructFormFieldOptions(formFields: FormFieldTypes) {
    const content: any[] = []

    if (formFields === undefined) return content

    formFields.forEach((formField: FormFieldType, index) => {
      content.push(this.componentFieldMapping(formField, index))
    })

    return content
  }

  render() {
    return (
      <div className="weui-cells weui-cells_form">
        <div className="weui-cell">
          <div className="weui-cell__bd">
            <h3 className="header">{this.props.headerText}</h3>
          </div>
        </div>

        <div className="auth-fields">
          {this.constructFormFieldOptions(this.props.formFields)}
        </div>
        <div className="weui-cell">
          <div className="weui-cell__bd">
            <button
              className="weui-btn weui-btn_primary"
              onClick={this.props.handleSubmit as any}
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
    )
  }
}
