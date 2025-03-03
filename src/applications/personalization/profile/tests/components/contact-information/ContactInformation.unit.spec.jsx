import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'chai';
import { setupServer } from 'msw/node';

import * as mocks from '@@profile/msw-mocks';
import ContactInformation from '@@profile/components/contact-information/ContactInformation';

import {
  createBasicInitialState,
  renderWithProfileReducers,
} from '../../unit-test-helpers';

describe('ContactInformation', () => {
  let server;
  before(() => {
    server = setupServer(...mocks.updateDD4CNPSuccess);
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  after(() => {
    server.close();
  });

  const ui = (
    <MemoryRouter>
      <ContactInformation />
    </MemoryRouter>
  );

  let initialState;

  it('should render the correct contact based on what exists in the Redux state', () => {
    initialState = createBasicInitialState();
    initialState.user.profile.vapContactInfo.email.emailAddress =
      'alongusername@gmail.com';

    const {
      residentialAddress,
      mailingAddress,
    } = initialState.user.profile.vapContactInfo;

    const view = renderWithProfileReducers(ui, { initialState });

    expect(view.getByText(residentialAddress.addressLine1, { exact: false })).to
      .exist;
    expect(
      view.getByText(
        `${residentialAddress.city}, ${residentialAddress.stateCode} ${
          residentialAddress.zipCode
        }`,
        { exact: false },
      ),
    ).to.exist;

    expect(view.getByText(mailingAddress.addressLine1, { exact: false })).to
      .exist;
    expect(
      view.getByText(
        `${mailingAddress.city}, ${mailingAddress.stateCode} ${
          mailingAddress.zipCode
        }`,
        { exact: false },
      ),
    ).to.exist;

    // It's too cumbersome to convert the raw phone number data into what is
    // displayed so I'm using strings here.
    expect(view.getByText('555-555-5559', { exact: false })).to.exist;
    expect(view.getByText('804-205-5544, ext. 17747')).to.exist;
    expect(view.getByText('214-718-2112', { exact: false })).to.exist;

    expect(view.getByText(/alongusername/)).to.exist;
  });
});
