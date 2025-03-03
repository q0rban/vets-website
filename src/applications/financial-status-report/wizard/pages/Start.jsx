import React from 'react';
import RadioButtons from '@department-of-veterans-affairs/component-library/RadioButtons';
import recordEvent from 'platform/monitoring/record-event';
import { PAGE_NAMES } from '../constants';

const label = 'What’s this debt related to?';
const options = [
  {
    label:
      'VA disability compensation, education, or pension benefit overpayments',
    value: 'request',
  },
  {
    label: 'VA health care copay bills',
    value: 'copays',
  },
  {
    label: 'Separation pay',
    value: 'separation',
  },
  {
    label: 'Attorney fees',
    value: 'attorney',
  },
  {
    label: 'Rogers STEM program',
    value: 'rogers-stem',
  },
  {
    label: 'VET TEC program',
    value: 'vettec',
  },
];

const Start = ({ setPageState, state = {} }) => {
  const setState = value => {
    switch (value) {
      case 'copays':
        setPageState({ selected: value }, PAGE_NAMES.copays);
        break;
      case 'separation':
      case 'attorney':
        setPageState({ selected: value }, PAGE_NAMES.benefits);
        break;
      case 'rogers-stem':
        setPageState({ selected: value }, PAGE_NAMES.stem);
        break;
      case 'vettec':
        setPageState({ selected: value }, PAGE_NAMES.vettec);
        break;
      default:
        setPageState({ selected: value }, PAGE_NAMES.request);
    }
  };

  return (
    <RadioButtons
      id={`${PAGE_NAMES.start}-option`}
      name={`${PAGE_NAMES.start}-option`}
      label={label}
      options={options}
      value={{ value: state.selected }}
      onValueChange={({ value }) => {
        recordEvent({
          event: 'howToWizard-formChange',
          'form-field-type': 'form-radio-buttons',
          'form-field-label': label,
          'form-field-value': value,
        });
        setState(value);
      }}
    />
  );
};

export default {
  name: PAGE_NAMES.start,
  component: Start,
};
