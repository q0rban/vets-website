import { expect } from 'chai';
import sinon from 'sinon';
import { VA_FORM_IDS } from 'platform/forms/constants';
import environment from 'platform/utilities/environment';

import {
  SET_SAVE_FORM_STATUS,
  SET_AUTO_SAVE_FORM_STATUS,
  SET_FETCH_FORM_STATUS,
  SET_IN_PROGRESS_FORM,
  SAVE_STATUSES,
  LOAD_STATUSES,
  setSaveFormStatus,
  setFetchFormStatus,
  setInProgressForm,
  migrateFormData,
  saveAndRedirectToReturnUrl,
  fetchInProgressForm,
  removeInProgressForm,
  setPrefillComplete,
  setFetchFormPending,
  setStartOver,
} from '../../save-in-progress/actions';

import { logOut } from '../../../user/authentication/actions';
import { inProgressApi } from '../../helpers';
import {
  mockFetch,
  setFetchJSONFailure,
  setFetchJSONResponse,
} from '../../../testing/unit/helpers';

const setup = () => {
  mockFetch();
};

const getState = () => ({ form: { trackingPrefix: 'test' } });

describe('Schemaform save / load actions:', () => {
  describe('setSaveFormStatus', () => {
    it('should return action', () => {
      const status = SAVE_STATUSES.success;
      const action = setSaveFormStatus(
        'saveAndRedirect',
        SAVE_STATUSES.success,
      );

      expect(action.type).to.equal(SET_SAVE_FORM_STATUS);
      expect(action.status).to.equal(status);
    });
    it('should return different action for auto saveType', () => {
      const status = SAVE_STATUSES.success;
      const action = setSaveFormStatus('auto', SAVE_STATUSES.success);

      expect(action.type).to.equal(SET_AUTO_SAVE_FORM_STATUS);
      expect(action.status).to.equal(status);
    });
  });
  describe('setFetchFormStatus', () => {
    it('should return action', () => {
      const status = LOAD_STATUSES.success;
      const action = setFetchFormStatus(status);

      expect(action.type).to.equal(SET_FETCH_FORM_STATUS);
      expect(action.status).to.equal(status);
    });
  });
  describe('setInProgressForm', () => {
    it('should return action', () => {
      const data = {};
      const action = setInProgressForm(data);

      expect(action.type).to.equal(SET_IN_PROGRESS_FORM);
      expect(action.data).to.equal(data);
    });
  });
  describe('migrateFormData', () => {
    it('should return migrated data', () => {
      const data = {
        formData: {
          field: 'stuff',
        },
        metadata: {
          version: 0,
        },
      };
      const migrations = [
        savedData => {
          savedData.formData.field = savedData.formData.field.toUpperCase(); // eslint-disable-line no-param-reassign
          return savedData;
        },
      ];
      const migratedData = migrateFormData(data, migrations);

      expect(migratedData).to.eql({
        formData: {
          field: 'STUFF',
        },
        metadata: {
          version: 0,
        },
      });
    });
    it('should migrate multiple times', () => {
      const data = {
        formData: {
          field: 'stuff',
        },
        metadata: {
          version: 0,
        },
      };
      const migrations = [
        savedData => {
          savedData.formData.field = savedData.formData.field.toUpperCase(); // eslint-disable-line no-param-reassign
          return savedData;
        },
        savedData => {
          savedData.formData.field = `${savedData.formData.field} to do`; // eslint-disable-line no-param-reassign
          return savedData;
        },
      ];
      const migratedData = migrateFormData(data, migrations);

      expect(migratedData).to.eql({
        formData: {
          field: 'STUFF to do',
        },
        metadata: {
          version: 0,
        },
      });
    });
  });
  describe('saveAndRedirectToReturnUrl', () => {
    beforeEach(setup);

    it('dispatches a pending', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();

      thunk(dispatch, getState)
        .then(() => {
          expect(
            dispatch.calledWith(
              setSaveFormStatus('saveAndRedirect', SAVE_STATUSES.pending),
            ),
          ).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('calls the api to save the form', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();

      thunk(dispatch, getState)
        .then(() => {
          expect(global.fetch.args[0][0]).to.contain(
            '/v0/in_progress_forms/1010ez',
          );
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('calls the Form 526-specific api to save the form', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_21_526EZ, {});
      const dispatch = sinon.spy();

      thunk(dispatch, getState)
        .then(() => {
          expect(global.fetch.args[0][0]).to.contain(
            inProgressApi(VA_FORM_IDS.FORM_21_526EZ),
          );
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('dispatches a success if the form is saved', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0), {
        data: {
          attributes: {
            metadata: {
              expiresAt: 1507504729,
              lastUpdated: 1502320729,
              returnUrl: '/veteran-information/personal-information',
              savedAt: 1502320728979,
              version: 0,
            },
          },
        },
      });

      thunk(dispatch, getState)
        .then(() => {
          expect(dispatch.secondCall.args[0].status).to.equal(
            SAVE_STATUSES.success,
          );
          expect(dispatch.secondCall.args[0].type).to.equal(
            SET_SAVE_FORM_STATUS,
          );
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('dispatches a no-auth if the api returns a 401', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(
        Promise.resolve({
          url: environment.API_URL,
          ok: false,
          status: 401,
        }),
      );

      thunk(dispatch, getState)
        .then(() => {
          expect(
            dispatch.calledWith(
              setSaveFormStatus('saveAndRedirect', SAVE_STATUSES.noAuth),
            ),
          ).to.be.true;
          expect(dispatch.calledWith(logOut())).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('dispatches a failure on any other failure', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(
        Promise.resolve(
          new Response(null, {
            url: environment.API_URL,
            status: 404,
          }),
        ),
      );

      thunk(dispatch, getState)
        .then(() => {
          expect(
            dispatch.calledWith(
              setSaveFormStatus('saveAndRedirect', SAVE_STATUSES.failure),
            ),
          ).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });
    it('dispatches a client failure when a network error occurs', done => {
      const thunk = saveAndRedirectToReturnUrl(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(Promise.reject(new Error('No network connection')));

      thunk(dispatch, getState)
        .then(() => {
          expect(
            dispatch.calledWith(
              setSaveFormStatus('saveAndRedirect', SAVE_STATUSES.clientFailure),
            ),
          ).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
  describe('fetchInProgressForm', () => {
    beforeEach(setup);

    it('dispatches a pending', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONFailure(global.fetch.onCall(0));

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledWith(setFetchFormPending(false))).to.be.true;
      });
    });
    it('attempts to fetch an in-progress form', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();

      thunk(dispatch, getState).then(() => {
        expect(global.fetch.args[0][0]).to.contain(
          '/v0/in_progress_forms/1010ez',
        );
      });
    });
    it('dispatches a success if the form is loaded', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0), {
        formData: { field: 'foo' },
        metadata: {
          version: 0,
        },
      });

      return thunk(dispatch, getState).then(() => {
        expect(global.fetch.args[0][0]).to.contain(
          '/v0/in_progress_forms/1010ez',
        );
      });
    });
    it('dispatches a success from the form 526-specific api on form load', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_21_526EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0), {
        formData: { field: 'foo' },
        metadata: {
          version: 0,
        },
      });

      return thunk(dispatch, getState).then(() => {
        expect(global.fetch.args[0][0]).to.contain(
          inProgressApi(VA_FORM_IDS.FORM_21_526EZ),
        );
      });
    });
    it('dispatches a no-auth if the api returns a 401', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(
        Promise.resolve({
          url: environment.API_URL,
          ok: false,
          status: 401,
        }),
      );

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledThrice).to.be.true;
        expect(dispatch.calledWith(logOut())).to.be.true;
        expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.noAuth))).to
          .be.true;
      });
    });
    it('dispatches a not-found if the api returns a 404', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(
        Promise.resolve({
          url: environment.API_URL,
          ok: false,
          status: 404,
        }),
      );

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.notFound)))
          .to.be.true;
      });
    });
    it('dispatches a not-found if the api returns an empty object', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0), {});

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.notFound)))
          .to.be.true;
      });
    });
    it("dispatches an invalid-data if the data returned from the api isn't an object", () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0), []); // return not an object

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(
          dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.invalidData)),
        ).to.be.true;
      });
    });
    it("dispatches an invalid-data if the api doesn't return valid json", () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(
        global.fetch.onCall(0),
        Promise.reject(new SyntaxError('Error parsing json')),
      );

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(
          dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.invalidData)),
        ).to.be.true;
      });
    });
    it('dispatches a failure on api response error', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONFailure(global.fetch.onCall(0));

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.failure)))
          .to.be.true;
      });
    });
    it('dispatches a failure on network error', () => {
      const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(
        global.fetch.onCall(0),
        Promise.reject(new Error('No network connection')),
      );

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledTwice).to.be.true;
        expect(
          dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.clientFailure)),
        ).to.be.true;
      });
    });
    describe('prefill', () => {
      it('dispatches a no-auth if the api returns a 401', () => {
        const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {}, true);
        const dispatch = sinon.spy();
        global.fetch.returns(
          Promise.resolve({
            url: environment.API_URL,
            ok: false,
            status: 401,
          }),
        );

        return thunk(dispatch, getState).then(() => {
          expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.noAuth)))
            .to.be.true;
        });
      });
      it('dispatches a success if the api returns a 404', () => {
        const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {}, true);
        const dispatch = sinon.spy();
        global.fetch.returns(
          Promise.resolve({
            url: environment.API_URL,
            ok: false,
            status: 404,
          }),
        );

        return thunk(dispatch, getState).then(() => {
          expect(dispatch.calledWith(setPrefillComplete())).to.be.true;
        });
      });
      it('dispatches a success if the api returns an empty object', () => {
        const thunk = fetchInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {}, true);
        const dispatch = sinon.spy();
        setFetchJSONResponse(global.fetch.onCall(0), {});

        return thunk(dispatch, getState).then(() => {
          expect(dispatch.calledWith(setPrefillComplete())).to.be.true;
        });
      });
      it('calls prefill transform when response is prefilled', () => {
        const prefillTransformer = sinon.spy();
        const thunk = fetchInProgressForm(
          VA_FORM_IDS.FORM_10_10EZ,
          {},
          true,
          prefillTransformer,
        );
        const dispatch = sinon.spy();
        setFetchJSONResponse(global.fetch.onCall(0), {
          formData: {},
          metadata: {
            prefill: true,
          },
        });

        return thunk(dispatch, getState).then(() => {
          expect(prefillTransformer.called).to.be.true;
          expect(dispatch.calledWith(setPrefillComplete())).to.be.true;
        });
      });
    });
  });
  describe('removeInProgressForm', () => {
    beforeEach(setup);
    window.dataLayer = [];

    it('dispatches a start over action', () => {
      const thunk = removeInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONFailure(global.fetch.onCall(0));

      return thunk(dispatch, getState).then(() => {
        expect(dispatch.calledWith(setStartOver())).to.be.true;
      });
    });
    it('attempts to remove an in-progress form', () => {
      const thunk = removeInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();

      thunk(dispatch, getState).then(() => {
        expect(global.fetch.firstCall.args[0]).to.contain(
          '/v0/in_progress_forms/1010ez',
        );
        expect(global.fetch.firstCall.args[1].method).to.equal('DELETE');
      });
    });
    it('removes a form and fetches prefill data', () => {
      const thunk = removeInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONResponse(global.fetch.onCall(0));

      return thunk(dispatch, getState).then(() => {
        expect(global.fetch.firstCall.args[1].method).to.equal('DELETE');
        expect(dispatch.lastCall.args[0]).to.be.a('function');
      });
    });
    it('handles remove error and fetches prefill data', () => {
      const thunk = removeInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      setFetchJSONFailure(global.fetch.onCall(0));

      return thunk(dispatch, getState).then(() => {
        expect(global.fetch.firstCall.args[1].method).to.equal('DELETE');
        expect(dispatch.lastCall.args[0]).to.be.a('function');
      });
    });
    it('sets no-auth status if session expires', () => {
      const thunk = removeInProgressForm(VA_FORM_IDS.FORM_10_10EZ, {});
      const dispatch = sinon.spy();
      global.fetch.returns(
        Promise.resolve({
          ok: false,
          url: environment.API_URL,
          status: 401,
        }),
      );

      return thunk(dispatch, getState).then(() => {
        expect(global.fetch.firstCall.args[1].method).to.equal('DELETE');
        expect(dispatch.calledWith(logOut()));
        expect(dispatch.calledWith(setFetchFormStatus(LOAD_STATUSES.noAuth)));
        expect(dispatch.lastCall.args[0]).not.to.be.a('function');
      });
    });
  });
});
