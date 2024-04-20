import moment from 'moment';

export function isString(data) {
  if (typeof data === 'string')
    return true;
  return false
} 

export function compareStatesModified(data, message) {
  const oldState = moment(data['state_changed_at'], 'DD/MM/YYYY');
  const newState = moment(message['state_changed_at'], 'DD/MM/YYYY');

  if (newState.isAfter(oldState)) {
    return true
  }
  return false;
}