import React from 'react';

import {
  FormFieldTypes,
  FormFieldType,
  LOGINTYPE,
  EVENT_TYPE
} from '../../common/auth-type';
import { AuthState, AuthStateHandler } from '../../common/auth-type';
import { Translations } from '../../common/Translations';
import { CloudbaseFormSection } from '../cloudbase-form-section/cloudbase-form-section';

import {
  dispatchAuthStateChangeEvent,
  handleUpdateUsername
} from '../../common/helper';
import cloudbase from '../../common/cloudbase';

interface CloudbaseSetUsernameProps {
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  headerText?: string;
  submitButtonText?: string;
  handleAuthStateChange?: AuthStateHandler;
  formFields?: FormFieldTypes;
  app: cloudbase.app.App;
}

interface CloudbaseSetUsernameState {
  loading: boolean;
  newFormFields: FormFieldTypes;
  username: string;
}

export class CloudbaseSetUsername extends React.Component<
  CloudbaseSetUsernameProps,
  CloudbaseSetUsernameState
> {
  private static defaultProps = {
    headerText: Translations.UPDATE_USERNAME_HEADER_TEXT,
    submitButtonText: Translations.UPDATE_USERNAME_ACTION,
    formFields: []
  };

  private eventBus = this.props.app.eventBus;

  public constructor(props: CloudbaseSetUsernameProps) {
    super(props);
    this.state = {
      loading: false,
      newFormFields: [],
      username: ''
    };
  }

  // TODO:
  public componentDidMount() {
    this.buildFormFields();
  }

  public render() {
    const customHandleSubmit = (e: any) => {
      this.defaultHandleSubmit
        .bind(this)(e)
        .then(() => {
          this.props.handleSubmit && this.props.handleSubmit(e);
        });
    };

    const handleSubmit = this.props.handleSubmit
      ? customHandleSubmit
      : this.defaultHandleSubmit.bind(this);
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;
    return (
      <CloudbaseFormSection
        headerText={this.props.headerText}
        handleSubmit={handleSubmit}
        formFields={this.state.newFormFields}
        loading={this.state.loading}
        submitButtonText={this.props.submitButtonText || ''}
      ></CloudbaseFormSection>
    );
  }

  private defaultHandleAuthStateChange = dispatchAuthStateChangeEvent;

  private async defaultHandleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }
    return this.updateUsername();
  }

  private handleFormFieldInputChange(fieldType: string): any {
    switch (fieldType) {
      case 'username':
        return (event: any) => {
          const value = event.target.value;
          this.setState({
            username: value
          });
        };
    }
  }

  private handleFormFieldInputWithCallback(
    event: React.FormEvent<HTMLInputElement>,
    field: FormFieldType
  ) {
    const fnToCall = field['handleInputChange']
      ? field['handleInputChange']
      : (event: any, cb: any) => {
          cb(event);
        };
    const callback = this.handleFormFieldInputChange(field.type);
    fnToCall(event, callback.bind(this));
  }

  private async updateUsername() {
    this.setState({
      loading: true
    });

    const username = this.state.username.trim();
    if (!username) {
      return;
    }

    await handleUpdateUsername(this.props.app, username);
    this.setState({
      loading: false
    });
  }

  private buildDefaultFormFields() {
    const formFieldInputs: any = [];
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;

    formFieldInputs.push({
      fieldId: 'username',
      type: 'username',
      placeholder: Translations.USERNAME_PLACEHOLDER,
      required: true,
      handleInputChange: this.handleFormFieldInputChange('username')
    });

    this.setState({
      newFormFields: [...formFieldInputs]
    });
  }

  private buildFormFields() {
    // const formFields = this.props.formFields || []
    const handleAuthStateChange =
      this.props.handleAuthStateChange || this.defaultHandleAuthStateChange;

    const formFields = this.props.formFields || [];
    if (formFields.length === 0) {
      this.buildDefaultFormFields();
    } else {
      const newFields: any = [];
      formFields.forEach((field) => {
        const newField = { ...field };
        newField['handleInputChange'] = (event) =>
          this.handleFormFieldInputWithCallback(event, field);
        newFields.push(newField);
      });
      this.setFieldValue(newFields);

      this.setState({
        newFormFields: newFields
      });
    }
  }

  private setFieldValue(fields: Array<FormFieldType>) {
    let newUsername = '';
    for (let field of fields) {
      switch (field.type) {
        case 'username':
          if (field.value === undefined) {
            newUsername = '';
          } else {
            newUsername = field.value;
          }
          break;
      }
    }

    this.setState((prevstate) => {
      return {
        ...prevstate,
        username: newUsername
      };
    });
  }
}
