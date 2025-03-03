import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';

import {
  validateServiceDates,
  validateDependentDate,
  // validateMarriageDate,
  validateCurrency,
} from '../utils/validation';

describe('hca validation', () => {
  describe('validateServiceDates', () => {
    it('should set message if discharge date is before entry date', () => {
      const errors = {
        lastDischargeDate: {
          addError: sinon.spy(),
        },
      };
      validateServiceDates(
        errors,
        {
          lastDischargeDate: '2010-01-01',
          lastEntryDate: '2011-01-01',
        },
        {
          veteranDateOfBirth: '1980-01-01',
        },
      );

      expect(errors.lastDischargeDate.addError.callCount).to.equal(1);
    });
    it('should set message if discharge date is later than 1 year from today', () => {
      const errors = {
        lastDischargeDate: {
          addError: sinon.spy(),
        },
      };
      validateServiceDates(
        errors,
        {
          lastDischargeDate: moment()
            .add(367, 'days')
            .format('YYYY-MM-DD'),
          lastEntryDate: '2011-01-01',
        },
        {},
      );
      expect(errors.lastDischargeDate.addError.callCount).to.equal(1);
    });
    it('should not set message if discharge date is 1 year from today', () => {
      const errors = {
        lastDischargeDate: {
          addError: sinon.spy(),
        },
      };
      validateServiceDates(
        errors,
        {
          lastDischargeDate: moment()
            .add(1, 'year')
            .format('YYYY-MM-DD'),
          lastEntryDate: '2011-01-01',
        },
        {},
      );
      expect(errors.lastDischargeDate.addError.callCount).to.equal(0);
    });
    it('should set message if entry date is less than 15 years after dob', () => {
      const errors = {
        lastEntryDate: {
          addError: sinon.spy(),
        },
      };
      validateServiceDates(
        errors,
        {
          lastDischargeDate: '2010-03-01',
          lastEntryDate: '2000-01-01',
        },
        {
          veteranDateOfBirth: '1990-01-01',
        },
      );
      expect(errors.lastEntryDate.addError.callCount).to.equal(1);
    });
  });
  // describe('validateMarriageDate', () => {
  //   it('should set message if marriage date is after spouse dob', () => {
  //     const errors = {
  //       addError: sinon.spy(),
  //     };
  //     validateMarriageDate(errors, '2010-01-01', {
  //       spouseDateOfBirth: '2011-01-01',
  //       veteranDateOfBirth: '1980-01-01',
  //       discloseFinancialInformation: true,
  //     });

  //     expect(errors.addError.callCount).to.equal(1);
  //   });
  //   it('should set message if marriage date is after veteran dob', () => {
  //     const errors = {
  //       addError: sinon.spy(),
  //     };
  //     validateMarriageDate(errors, '2010-01-01', {
  //       veteranDateOfBirth: '2011-01-01',
  //       spouseDateOfBirth: '1980-01-01',
  //       discloseFinancialInformation: true,
  //     });

  //     expect(errors.addError.callCount).to.equal(1);
  //   });
  //   it('should not set message if not disclosing financials', () => {
  //     const errors = {
  //       addError: sinon.spy(),
  //     };
  //     validateMarriageDate(errors, '2010-01-01', {
  //       veteranDateOfBirth: '2011-01-01',
  //       spouseDateOfBirth: '2011-01-01',
  //       discloseFinancialInformation: false,
  //     });

  //     expect(errors.addError.callCount).to.equal(0);
  //   });
  // });
  describe('validateDependentDate', () => {
    it('should set message if birth date is after dependent date', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateDependentDate(
        errors,
        '2010-01-01',
        {
          discloseFinancialInformation: true,
          children: [
            {
              childDateOfBirth: '2011-01-01',
            },
          ],
        },
        null,
        null,
        0,
      );

      expect(errors.addError.callCount).to.equal(1);
    });
    it('should not set message if not disclosing financials', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateDependentDate(
        errors,
        '2010-01-01',
        {
          discloseFinancialInformation: false,
          children: [
            {
              childDateOfBirth: '2011-01-01',
            },
          ],
        },
        null,
        null,
        0,
      );

      expect(errors.addError.callCount).to.equal(0);
    });
  });
  describe('validateCurrency', () => {
    it('should set message if value has three decimals', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateCurrency(errors, '234.234');

      expect(errors.addError.callCount).to.equal(1);
    });
    it('should set message if value has trailing whitespace', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateCurrency(errors, '234234 ');

      expect(errors.addError.callCount).to.equal(1);
    });
    it('should set message if value has leading whitespace', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateCurrency(errors, ' 234234');

      expect(errors.addError.callCount).to.equal(1);
    });
    it('should not set message if value includes dollar sign', () => {
      const errors = {
        addError: sinon.spy(),
      };
      validateCurrency(errors, '$234,234');

      expect(errors.addError.callCount).to.equal(0);
    });
  });
});
