let status = {
  success: 0,
  failed: 0,
  retry: 0
};
let errors = [];

function updateStatus(type) {
  if (status[type] !== undefined) status[type]++;
}

function getStatus() {
  return status;
}

function resetStatus() {
  status = { success: 0, failed: 0, retry: 0 };
  errors = [];
}

function addError(error) {
  errors.push(error);
}

function getErrors() {
  return errors;
}

module.exports = { updateStatus, getStatus, resetStatus, addError, getErrors }; 