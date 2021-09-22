import React from 'react';
import Telephone, {
  CONTACTS,
  PATTERNS,
} from '@department-of-veterans-affairs/component-library/Telephone';

const Alert = ({ children }) => children;

Alert.Error = () => (
  <va-alert class="row vads-u-margin-bottom--5" status="error">
    <h3 slot="headline">
      We can’t access your current copay balances right now
    </h3>
    <p>
      We’re sorry. Something went wrong on our end. You won’t be able to access
      information about your copay balances at this time.
    </p>
    <h4>What you can do</h4>
    <p>
      <strong className="vads-u-margin-right--0p5">
        For questions about your payment or relief options,
      </strong>
      contact us at
      <Telephone contact={'866-400-1238'} className="vads-u-margin-x--0p5" />
      (TTY:
      <Telephone
        contact={CONTACTS[711]}
        pattern={PATTERNS['3_DIGIT']}
        className="vads-u-margin-left--0p5"
      />
      ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
    </p>
    <p>
      <strong className="vads-u-margin-right--0p5">
        For questions about your treatment or your charges,
      </strong>
      contact the VA health care facility where you received care.
    </p>
    <a href="#">Find the contact information for your facility</a>
  </va-alert>
);

Alert.Maintenance = () => (
  <va-alert class="row vads-u-margin-bottom--5" status="info">
    <h3 slot="headline">Down for maintenance</h3>
    <p className="vads-u-font-size--base vads-u-font-family--sans">
      We’re sorry it’s not working right now.
    </p>
  </va-alert>
);

Alert.Deceased = () => (
  <va-alert class="row vads-u-margin-bottom--5" status="warning">
    <h3 slot="headline">Our records show that this Veteran is deceased</h3>
    <p className="vads-u-font-size--base vads-u-font-family--sans">
      We can’t show copay statements for this Veteran.
    </p>
    <p>
      If this information is incorrect, please call Veterans Benefits Assistance
      at <Telephone contact={'800-827-1000'} />, Monday through Friday, 8:00
      a.m. to 9:00 p.m. ET.
    </p>
  </va-alert>
);

Alert.NoHealthcare = () => (
  <va-alert class="row vads-u-margin-bottom--5" status="warning">
    <h3 slot="headline">You’re not enrolled in VA health care</h3>
    <p className="vads-u-font-size--base vads-u-font-family--sans">
      You can’t view copay balances at this time because our records show that
      you’re not enrolled in VA health care.
      <a href="#" className="vads-u-margin-left--0p5">
        Find out how to apply for VA health care benefits
      </a>
      .
    </p>
    <p>
      If you think this is incorrect, call our toll-free hotline at
      <Telephone contact={'877-222-8387'} className="vads-u-margin-x--0p5" />,
      Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
    </p>
  </va-alert>
);

Alert.NoHistory = () => (
  <va-alert class="row vads-u-margin-bottom--5" status="info">
    <h3 slot="headline">
      You haven’t received a copay bill in the past [x] months
    </h3>
    <p className="vads-u-font-size--base vads-u-font-family--sans">
      You can’t view copay balances at this time because our records show that
      you haven’t received a copay bill in the past [x] months.
    </p>
    <p>
      If you think this is incorrect, contact the VA Health Resource Center at
      <Telephone contact={'866-400-1238'} className="vads-u-margin-left--0p5" />
      . (TTY:
      <Telephone
        contact={CONTACTS[711]}
        pattern={PATTERNS['3_DIGIT']}
        className="vads-u-margin-left--0p5"
      />
      ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
    </p>
  </va-alert>
);

export default Alert;