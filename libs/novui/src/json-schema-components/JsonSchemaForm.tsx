import { useEffect, useRef } from 'react';
import Form, { FormProps } from '@rjsf/core';
import { FormValidation, RegistryWidgetsType, RJSFValidationError, toErrorSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { splitCssProps } from '../../styled-system/jsx';
import { JsxStyleProps } from '../../styled-system/types';
import { css, cx } from '../../styled-system/css';

import { CoreProps } from '../types';
import { ArrayFieldItemTemplate, ArrayFieldTemplate, ArrayFieldTitleTemplate } from './templates/ArrayFieldTemplate';
import { AddButton, MoveDownButton, MoveUpButton, RemoveButton } from './templates/IconButton';
import { ObjectFieldTemplate } from './templates/ObjectFieldTemplate';
import { CheckboxWidget, SelectWidget, InputEditorWidget } from './widgets';
import { JSON_SCHEMA_FORM_ID_DELIMITER } from './constants';
import { InputWidget } from './widgets/InputWidget';
import { TextareaWidget } from './widgets/TextareaWidget';

const WIDGETS: RegistryWidgetsType = {
  CheckboxWidget: CheckboxWidget,
  SelectWidget: SelectWidget,
  TextWidget: InputEditorWidget,
  URLWidget: InputEditorWidget,
  EmailWidget: InputEditorWidget,
};

/** @deprecated TODO: delete after Autocomplete is fully released */
const LEGACY_WIDGETS: RegistryWidgetsType = {
  CheckboxWidget: CheckboxWidget,
  SelectWidget: SelectWidget,
  TextWidget: TextareaWidget,
  URLWidget: InputWidget,
  EmailWidget: InputWidget,
};

const UI_SCHEMA: UiSchema = {
  'ui:globalOptions': { addable: true, copyable: false, label: true, orderable: true },
  'ui:options': {
    hideError: true,
    submitButtonOptions: {
      norender: true,
    },
  },
};

export type JsonSchemaFormProps<TFormData = any> = JsxStyleProps &
  CoreProps &
  Pick<FormProps<TFormData>, 'onChange' | 'onSubmit' | 'onBlur' | 'schema' | 'formData' | 'tagName'> & {
    variables?: string[];
    errors?: any;
  };

const getExtraErrors = (errors: RJSFValidationError[]) => {
  if (!errors) {
    return {};
  }
  // adding a default error for the case of errors in an array not updating correctly
  return { __errors: ['enableShowExtraErrors'], ...toErrorSchema(errors || []) };
};

// Always return an empty array to prevent the default error messages from showing
function transformErrors(_: RJSFValidationError[]) {
  return [];
}
/**
 * Specialized form editor for data passed as JSON.
 */
export function JsonSchemaForm<TFormData = any>(props: JsonSchemaFormProps<TFormData>) {
  const [cssProps, { className, variables, errors, ...formProps }] = splitCssProps(props);

  const isAutocompleteEnabled = Boolean(variables && variables.length > 0);

  const formRef = useRef<Form>(null);

  function customValidate(formData: TFormData, formErrors: FormValidation<TFormData>) {
    const extraErrors = getExtraErrors(errors);

    if (Object.keys(extraErrors)?.length > 0) {
      formErrors = { ...formErrors, ...extraErrors };
    }

    return formErrors;
  }

  useEffect(() => {
    formRef.current.validateForm();
  }, [errors]);

  return (
    <Form
      ref={formRef}
      tagName={'fieldset'}
      className={cx(
        css({
          // default elements to hide
          '& .control-label, & .field-description': {
            display: 'none',
          },
          // hide raw text errors
          '& .panel.panel-danger.errors': {
            display: 'none',
          },
        }),
        css(cssProps),
        className
      )}
      uiSchema={UI_SCHEMA}
      widgets={isAutocompleteEnabled ? WIDGETS : LEGACY_WIDGETS}
      validator={validator}
      // override default behavior don't print to console when there is a validation error
      onError={() => {}}
      transformErrors={transformErrors}
      customValidate={customValidate}
      noHtml5Validate
      liveValidate
      autoComplete={'false'}
      formContext={{ variables }}
      idSeparator={JSON_SCHEMA_FORM_ID_DELIMITER}
      templates={{
        ArrayFieldTitleTemplate,
        ArrayFieldTemplate,
        ArrayFieldItemTemplate,
        ObjectFieldTemplate,
        ButtonTemplates: { MoveDownButton, AddButton, RemoveButton, MoveUpButton },
      }}
      {...formProps}
    />
  );
}
