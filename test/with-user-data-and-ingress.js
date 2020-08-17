const test = require('ava');
const cfntest = require('@cfn-modules/test');

test.serial('with-user-data-and-ingress', async t => {
  const stackName = cfntest.stackName();
  try {
    t.log(await cfntest.createStack(`${__dirname}/with-user-data-and-ingress.yml`, stackName, {}));
    const outputs = await cfntest.getStackOutputs(stackName);
    t.log(outputs);
    const res = await cfntest.probeHttpGet(`http://${outputs.PublicIpAddress}`);
    t.is(res.status, 200);
  } finally {
    t.log(await cfntest.deleteStack(stackName));
    t.pass();
  }
});
