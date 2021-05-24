import enrollmentStatusEnrolled from '@@profile/tests/fixtures/enrollment-system/enrolled.json';

import { mockFeatureToggles } from './helpers';

import { mockFolderResponse } from '../../utils/mocks/messaging/folder';
import { mockMessagesResponse } from '../../utils/mocks/messaging/messages';

import {
  makeUserObject,
  mockLocalStorage,
} from '~/applications/personalization/dashboard/tests/e2e/dashboard-e2e-helpers';

describe('MyVA Dashboard - CTA Links', () => {
  beforeEach(() => {
    mockLocalStorage();
  });
  context('when user is has messaging and rx features', () => {
    beforeEach(() => {
      const mockUser = makeUserObject({
        isCerner: false,
        messaging: true,
        rx: true,
        facilities: [{ facilityId: '123', isCerner: false }],
        isPatient: true,
      });

      cy.login(mockUser);
      cy.intercept(
        'GET',
        '/v0/health_care_applications/enrollment_status',
        enrollmentStatusEnrolled,
      );
      cy.intercept('/v0/folders/0', mockFolderResponse);
      cy.intercept('/v0/folders/0/messages', mockMessagesResponse);
      mockFeatureToggles();
    });
    it('should show the rx and messaging CTAs', () => {
      cy.visit('my-va/');
      cy.findByRole('link', {
        name: /schedule and view.*appointments/i,
      }).should('exist');
      cy.findByRole('link', { name: /unread message/i }).should('exist');
      cy.findByRole('link', {
        name: /refill and track.*prescriptions/i,
      }).should('exist');
    });
  });
  context('when user lacks messaging and rx features', () => {
    beforeEach(() => {
      mockLocalStorage();
      const mockUser = makeUserObject({
        isCerner: false,
        messaging: false,
        rx: false,
        facilities: [{ facilityId: '123', isCerner: false }],
        isPatient: true,
      });

      cy.login(mockUser);
      cy.intercept(
        'GET',
        '/v0/health_care_applications/enrollment_status',
        enrollmentStatusEnrolled,
      );
      cy.intercept('/v0/folders/0', mockFolderResponse);
      cy.intercept('/v0/folders/0/messages', mockMessagesResponse);
      mockFeatureToggles();
    });
    it('should not show the rx and messaging CTAs', () => {
      cy.visit('my-va/');
      cy.findByRole('link', {
        name: /schedule and view.*appointments/i,
      }).should('exist');
      cy.findByRole('link', { name: /send a.*message/i }).should('not.exist');
      cy.findByRole('link', {
        name: /refill and track.*prescriptions/i,
      }).should('not.exist');
    });
  });
});