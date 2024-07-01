const fs = require("fs");

function isProduction() {
  //TODO: Works only in Amazon Linux 2 Instances, update this to node env
  const ec2MetadataPath = "/home/ec2-user";
  return fs.existsSync(ec2MetadataPath);
}

module.exports = isProduction;
