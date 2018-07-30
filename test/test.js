const test = require('ava');
const cfntest = require('@cfn-modules/test');
const axios = require('axios');

test('defaults', async t => {
  const stackName = cfntest.stackName();
  try {
    t.log(await cfntest.createStack(`${__dirname}/defaults.yml`, stackName, {}));
    // what could we test here?
  } finally {
    t.log(await cfntest.deleteStack(stackName));
    t.pass();
  }
});

test('key-name', async t => {
  const stackName = cfntest.stackName();
  const keyName = cfntest.keyName();
  try {
    const key = await cfntest.createKey(keyName);
    try {
      t.log(await cfntest.createStack(`${__dirname}/key-name.yml`, stackName, {
        KeyName: keyName
      }));
      const outputs = await cfntest.getStackOutputs(stackName);
      t.log(outputs);
      await cfntest.probeSSH(`ec2-user@${outputs.PublicIpAddress}`, key);
    } finally {
      t.log(await cfntest.deleteStack(stackName));
    }
  } finally {
    t.log(await cfntest.deleteKey(keyName));
    t.pass();
  }
});

test('user-data-ingress', async t => {
  const stackName = cfntest.stackName();
  try {
    t.log(await cfntest.createStack(`${__dirname}/user-data-ingress.yml`, stackName, {}));
    const outputs = await cfntest.getStackOutputs(stackName);
    t.log(outputs);
    const res = await axios.post(`http://${outputs.PublicIpAddress}`);
    t.is(res.status, 200);
  } finally {
    t.log(await cfntest.deleteStack(stackName));
    t.pass();
  }
});

test('file-system', async t => {
  const stackName = cfntest.stackName();
  const keyName = cfntest.keyName();
  try {
    const key = await cfntest.createKey(keyName);
    try {
      t.log(await cfntest.createStack(`${__dirname}/file-system.yml`, stackName, {
        KeyName: keyName
      }));
      const outputs = await cfntest.getStackOutputs(stackName);
      t.log(outputs);
      await cfntest.probeSSH(`ec2-user@${outputs.PublicIpAddress}`, key, 'echo -n "test" > /mnt/efs1/test.txt');
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

// TODO test SSH access with IAM user (IAMUserSSHAccess := true)
// TODO test SSH access with BastionModule
// TODO test FileSystemModule1
