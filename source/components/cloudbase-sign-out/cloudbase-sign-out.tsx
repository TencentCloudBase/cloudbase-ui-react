import React from "react"
import { AuthState, AuthStateHandler } from "../../common/auth-type"
import {
  dispatchToastHubEvent,
  dispatchAuthStateChangeEvent,
  handleSignOut
} from "../../common/helper"
import { Translations } from "../../common/Translations"
import cloudbase from "@cloudbase/js-sdk"
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

interface CloudbaseSignOutProps {
  buttonText?: string
  handleAuthStateChange?: AuthStateHandler
  app: cloudbase.app.App
}

export class CloudbaseSignOut extends React.Component<CloudbaseSignOutProps> {
  static defaultProps = {
    buttonText: Translations.SIGN_OUT
  }

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent
  private eventBus = this.props.app.eventBus

  private async signOut(event: any) {
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange
    if (event) event.preventDefault()

    try {
      await handleSignOut(this.props.app)
      handleAuthStateChange(this.eventBus, AuthState.SignedOut)
    } catch (error) {
      dispatchToastHubEvent(this.eventBus, error)
    }
  }

  render() {
    return (
      <button
        className="weui-btn weui-btn_primary"
        onClick={(event: any) => this.signOut(event)}
      >
        {this.props.buttonText}
      </button>
    )
  }
}
