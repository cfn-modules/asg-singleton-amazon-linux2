const test = require('ava');
const cfntest = require('@cfn-modules/test');

test.serial('with-key-name', async t => {
  const stackName = cfntest.stackName();
  const keyName = cfntest.keyName();
  try {
    const key = await cfntest.createKey(keyName);
    try {
      t.log(await cfntest.createStack(`${__dirname}/with-key-name.yml`, stackName, {
        KeyName: keyName
      }));
      const outputs = await cfntest.getStackOutputs(stackName);
      t.log(outputs);
      t.log(await cfntest.probeSSH(`ec2-user@${outputs.PublicIpAddress}`, key));
    } finally {
      t.log(await cfntest.deleteStack(stackName));
    }
  } finally {
    t.log(await cfntest.deleteKey(keyName));
    t.pass();
  }
});
