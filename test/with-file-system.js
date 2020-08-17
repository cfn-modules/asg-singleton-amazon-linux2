const test = require('ava');
const cfntest = require('@cfn-modules/test');

test.serial('with-file-system', async t => {
  const stackName = cfntest.stackName();
  const keyName = cfntest.keyName();
  try {
    const key = await cfntest.createKey(keyName);
    try {
      t.log(await cfntest.createStack(`${__dirname}/with-file-system.yml`, stackName, {
        KeyName: keyName
      }));
      const outputs = await cfntest.getStackOutputs(stackName);
      t.log(outputs);
      t.log(await cfntest.probeSSH(`ec2-user@${outputs.PublicIpAddress}`, key, 'echo -n "test" > /mnt/efs1/test.txt'));
      // TODO kill EC2 instance and wait for new instance to become available...
      const stdout = await cfntest.probeSSH(`ec2-user@${outputs.PublicIpAddress}`, key, 'cat /mnt/efs1/test.txt');
      t.log(stdout);
      t.is(stdout, 'test');
    } finally {
      t.log(await cfntest.deleteStack(stackName));
    }
  } finally {
    t.log(await cfntest.deleteKey(keyName));
    t.pass();
  }
});
