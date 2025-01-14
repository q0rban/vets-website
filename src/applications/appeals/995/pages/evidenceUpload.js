import {
  UploadDescription,
  evidenceOtherText,
} from '../content/evidenceUpload';
import { ancillaryFormUploadUi } from '../utils/upload';
import { ATTACHMENTS_OTHER } from '../constants';

export default {
  uiSchema: {
    additionalDocuments: {
      ...ancillaryFormUploadUi(evidenceOtherText),
      'ui:description': UploadDescription,
    },
  },

  schema: {
    type: 'object',
    required: ['additionalDocuments'],
    properties: {
      additionalDocuments: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'attachmentId'],
          properties: {
            name: {
              type: 'string',
            },
            attachmentId: {
              type: 'string',
              enum: Object.keys(ATTACHMENTS_OTHER),
              enumNames: Object.values(ATTACHMENTS_OTHER),
            },
          },
        },
      },
    },
  },
};
