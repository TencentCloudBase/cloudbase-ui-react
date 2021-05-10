import React from "react"

import {
  FormFieldTypes,
  FormFieldType,
  PhoneNumberInterface,
  PhoneFormFieldType,
  LOGINTYPE
} from "../../common/auth-type"
import { AuthState, AuthStateHandler } from "../../common/auth-type"
import { Translations } from "../../common/Translations"
import { COUNTRY_DIAL_CODE_DEFAULT } from "../../common/constant"
import { CloudbaseFormSection } from "../cloudbase-form-section/cloudbase-form-section"

import {
  dispatchAuthStateChangeEvent,
  checkUserLoginType
  // handlePhoneNumberChange
} from "../../common/helper"
import { handleSignIn } from "../../common/helper"
import cloudbase from "@cloudbase/js-sdk"
// const { Button, Cell, CellBody } = require("react-weui")
// import ReactWEUI from "react-weui"

// const {
//   Form,
//   FormCell,
//   Cell,
//   CellBody,
//   CellFooter,
//   CellHeader,
//   Label,
//   Button,
//   Input,
//   Select,
//   Page
// } = ReactWEUI as any
interface SignInAttributes {
  userInput: string
  password?: string
  code?: string
}

interface CloudbaseSignInProps {
  userLoginType: LOGINTYPE
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  headerText?: string
  submitButtonText?: string
  handleAuthStateChange?: AuthStateHandler
  formFields?: FormFieldTypes
  hideSignUp?: boolean
  app: cloudbase.app.App
  isUsePassword?: boolean
}

interface CloudbaseSignInState {
  loading: boolean
  signInAttributes: {
    userInput: string
    password?: string
    code?: string
  }
  newFormFields: FormFieldTypes
  phoneNumber: PhoneNumberInterface
}

// /**
//  * @slot header-subtitle - Subtitle content placed below header text
//  * @slot federated-buttons - Content above form fields used for sign in federation buttons
//  * @slot footer - Content is place in the footer of the component
//  * @slot primary-footer-content - Content placed on the right side of the footer
//  * @slot secondary-footer-content - Content placed on the left side of the footer
//  */

export class CloudbaseSignIn extends React.Component<
  CloudbaseSignInProps,
  CloudbaseSignInState
> {
  static defaultProps = {
    headerText: Translations.SIGN_IN_HEADER_TEXT,
    submitButtonText: Translations.SIGN_IN_ACTION,
    formFields: [],
    hideSignUp: false,
    isUsePassword: true // Used in phoneNumber login
  }

  constructor(props: CloudbaseSignInProps) {
    super(props)
    this.state = {
      loading: false,
      signInAttributes: {
        userInput: "",
        password: "",
        code: ""
      },
      newFormFields: [],
      phoneNumber: {
        countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
        phoneNumberValue: null
      }
    }
  }

  private eventBus = this.props.app.eventBus

  defaultHandleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // avoid submitting the form
    if (event) {
      event.preventDefault()
    }
    return this.signIn(event)
  }

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent

  // TODO:
  componentDidMount() {
    checkUserLoginType(this.props.userLoginType)
    this.buildFormFields()
  }

  private handleFormFieldInputChange(fieldType: string): any {
    switch (fieldType) {
      case "phone_number":
        // return (event: any) => handlePhoneNumberChange(event, this.phoneNumber)
        return (event: any) => {
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                userInput: event.target.value
              },
              phoneNumber: {
                ...prevState.phoneNumber,
                phoneNumberValue: event.target.value
              }
            }
          })
        }
      case "password":
        return (event: any) =>
          this.setState((prevstate) => {
            return {
              ...prevstate,
              signInAttributes: {
                ...prevstate.signInAttributes,
                password: event.target.value
              }
            }
          })
      case "code":
        return (event: any) =>
          // (this.signUpAttributes.password = event.target.value)
          this.setState((prevState) => {
            return {
              ...prevState,
              signInAttributes: {
                ...prevState.signInAttributes,
                code: event.target.value
              }
            }
          })
    }
  }

  private handleFormFieldInputWithCallback(
    event: React.FormEvent<HTMLInputElement>,
    field: FormFieldType
  ) {
    const fnToCall = field["handleInputChange"]
      ? field["handleInputChange"]
      : (event: any, cb: any) => {
          cb(event)
        }
    const callback = this.handleFormFieldInputChange(field.type)
    fnToCall(event, callback.bind(this))
  }

  private async signIn(event: React.FormEvent<HTMLFormElement>) {
    this.setState({
      loading: true
    })

    const username = this.state.signInAttributes.userInput.trim()
    await handleSignIn({
      app: this.props.app,
      loginType: this.props.userLoginType,
      handleAuthStateChange:
        this.props.handleAuthStateChange || this.defaultHandleAuthStateChange,
      username,
      password: this.state.signInAttributes.password || "",
      code: this.state.signInAttributes.code || "",
      isUsePassword:
        this.props.isUsePassword !== undefined ? this.props.isUsePassword : true
    })
    this.setState({
      loading: false
    })
  }

  buildDefaultFormFields() {
    const formFieldInputs = []
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange

    switch (this.props.userLoginType) {
      case LOGINTYPE.PHONE:
        formFieldInputs.push({
          fieldId: "phone_number",
          type: "phone_number",
          placeholder: Translations.PHONENUMBER_PLACEHOLDER,
          required: true,
          handleInputChange: this.handleFormFieldInputChange("phone_number")
        })
        break
      case LOGINTYPE.USERNAME:
      default:
        formFieldInputs.push({
          fieldId: "username",
          type: "username",
          required: true,
          handleInputChange: this.handleFormFieldInputChange("username")
        })
        break
    }

    // use password or code
    if (this.props.isUsePassword) {
      formFieldInputs.push({
        fieldId: "password",
        type: "password",
        placeholder: Translations.PASSWORD_PLACEHOLDER,
        hint: (
          <div>
            {Translations.FORGOT_PASSWORD_TEXT}{" "}
            <button
              className="weui-btn weui-btn_primary"
              onClick={() =>
                handleAuthStateChange(this.eventBus, AuthState.ForgotPassword)
              }
            >
              {Translations.RESET_PASSWORD_TEXT}
            </button>
          </div>
        ),
        required: true,
        handleInputChange: this.handleFormFieldInputChange("password")
      })
    } else {
      formFieldInputs.push({
        fieldId: "code",
        type: "code",
        placeholder: Translations.CODE_PLACEHOLDER,
        required: true,
        handleInputChange: this.handleFormFieldInputChange("password")
      })
    }

    // this.newFormFields = [...formFieldInputs]

    // console.log(")))))))))newFormFields", this.newFormFields)
    this.setState({
      newFormFields: [...formFieldInputs]
    })
  }

  buildFormFields() {
    const formFields = this.props.formFields || []
    console.log("formFields(((((((", formFields)
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange
    if (formFields.length === 0) {
      this.buildDefaultFormFields()
    } else {
      const newFields: any = []
      formFields.forEach((field) => {
        const newField = { ...field }
        // TODO: handle hint better
        if (newField.type === "password") {
          newField["hint"] = (
            <div>
              {Translations.FORGOT_PASSWORD_TEXT}{" "}
              <button
                className="weui-btn weui-btn_primary"
                onClick={() =>
                  handleAuthStateChange(this.eventBus, AuthState.ForgotPassword)
                }
              >
                {Translations.RESET_PASSWORD_TEXT}
              </button>
            </div>
          )
        }
        newField["handleInputChange"] = (
          event: React.FormEvent<HTMLInputElement>
        ) => this.handleFormFieldInputWithCallback(event, field)
        this.setFieldValue(newField, this.state.signInAttributes)
        newFields.push(newField)
      })
      // this.newFormFields = newFields
      this.setState({
        newFormFields: newFields
      })
    }
  }

  setFieldValue(
    field: PhoneFormFieldType | FormFieldType,
    formAttributes: SignInAttributes
  ) {
    let newFormAttributes: any = {}
    let newPhoneNumber: any = {}

    switch (field.type) {
      case "username":
      case "email":
        if (field.value === undefined) {
          newFormAttributes.userInput = ""
        } else {
          newFormAttributes.userInput = field.value
        }
        break
      case "phone_number":
        if ((field as PhoneFormFieldType).dialCode) {
          newPhoneNumber.countryDialCodeValue = (field as PhoneFormFieldType).dialCode
        }
        newPhoneNumber.phoneNumberValue = field.value
        break
      case "password":
        if (field.value === undefined) {
          newFormAttributes.password = ""
        } else {
          newFormAttributes.password = field.value
        }
        break
    }

    newFormAttributes = {
      ...formAttributes,
      newFormAttributes
    }

    this.setState((prevstate) => {
      return {
        ...prevstate,
        phoneNumber: newPhoneNumber,
        signInAttributes: newFormAttributes
      }
    })
  }

  render() {
    console.log("newFormFields", this.state.newFormFields)
    const handleSubmit =
      this.props.handleSubmit || this.defaultHandleSubmit.bind(this)
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange
    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={handleSubmit}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        submitButtonText={this.props.submitButtonText || ""}
        secondaryFooterContent={
          !this.props.hideSignUp ? (
            <div className="weui-cell weui-cell_link">
              {Translations.NO_ACCOUNT_TEXT}{" "}
              <div
                className="weui-cell__bd"
                onClick={() =>
                  handleAuthStateChange(this.eventBus, AuthState.SignUp)
                }
              >
                {Translations.CREATE_ACCOUNT_TEXT}
              </div>
            </div>
          ) : (
            <span></span>
          )
        }
      ></CloudbaseFormSection>
    )
  }
}
