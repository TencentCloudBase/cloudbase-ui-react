import React from 'react';
import { AUTHSTATE, AuthStateHandler, LOGINTYPE } from '../../common/auth-type';
import {
  dispatchAuthStateChangeEvent,
  handleSignOut
} from '../../common/helper';
import { Translations } from '../../common/Translations';
import cloudbase from '../../common/cloudbase';

interface CloudbaseSignOutProps {
  submitButtonText?: string;
  handleAuthStateChange?: AuthStateHandler;
  app: cloudbase.app.App;
  userLoginType?: LOGINTYPE;
}

export class CloudbaseSignOut extends React.Component<CloudbaseSignOutProps> {
  private static defaultProps = {
    submitButtonText: Translations.SIGN_OUT
  };

  private eventBus = this.props.app.eventBus;

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent;

  public render() {
    return (
      <button
        className='weui-btn weui-btn_primary'
        onClick={(event: any) => this.signOut(event)}
      >
        {this.props.submitButtonText}
      </button>
    );
  }

  private async signOut(event: any) {
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;
    if (event) event.preventDefault();

    await handleSignOut(this.props.app, this.props.userLoginType as LOGINTYPE);
  }
}
