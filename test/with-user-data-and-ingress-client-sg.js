const test = require('ava');
const cfntest = require('@cfn-modules/test');

test.serial('with-user-data-and-ingress', async t => {
  const stackName = cfntest.stackName();
  const keyName = cfntest.keyName();
  try {
    const key = await cfntest.createKey(keyName);
    try {
      t.log(await cfntest.createStack(`${__dirname}/with-user-data-and-ingress-client-sg.yml`, stackName, {
        KeyName: keyName
      }));
      const outputs = await cfntest.getStackOutputs(stackName);
      t.log(outputs);
      const stdout = await cfntest.probeSSH(`ec2-user@${outputs.ClientPublicIpAddress}`, key, `curl http://${outputs.ServerPublicIpAddress}`);
      t.log(stdout);
      t.is(stdout.trim(), 'cfn-modules');
    } finally {
      t.log(await cfntest.deleteStack(stackName));
      t.pass();
    }
   } finally {
    t.log(await cfntest.deleteKey(keyName));
    t.pass();
  }
});
