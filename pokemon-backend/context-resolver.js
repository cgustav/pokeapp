const fs = require("fs");

function isProduction() {
  const ec2MetadataPath = "/var/lib/cloud/data/instance-identity/document";
  return fs.existsSync(ec2MetadataPath);
}

module.exports = isProduction;
