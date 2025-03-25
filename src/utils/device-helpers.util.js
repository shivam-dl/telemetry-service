const requestIp = require('request-ip');

const getDeviceDetails = (req) => {
  const ip = requestIp.getClientIp(req);
  const { headers } = req;
  return {
    user_agent: headers['user-agent'],
    device_type: headers['device-type'],
    os_name: headers['os-name'],
    user_ip: ip,
  };
};

module.exports = { getDeviceDetails };
