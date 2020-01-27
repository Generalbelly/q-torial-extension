import { UPDATE_STATE } from '../constants/command-types';
import uuidv4 from 'uuid';

export const sendCommand = (c, d = {}) =>
  new Promise(resolve => {
    const taskId = uuidv4();
    window.addEventListener('message', event => {
      if (event.origin !== window.parent.location.origin) return;
      if (typeof event.data !== 'object' || Array.isArray(event.data)) return;
      const { app = null, command = '', data = {}, id = null } = event.data;
      if (
        app === process.env.VUE_APP_NAME &&
        command === UPDATE_STATE &&
        id === taskId
      ) {
        resolve(data);
      }
    });
    window.parent.postMessage(
      {
        id: taskId,
        app: process.env.VUE_APP_NAME,
        command: c,
        data: d,
      },
      window.parent.location.origin
    );
  });
