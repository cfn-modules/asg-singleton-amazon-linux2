const test = require('ava');
const cfntest = require('@cfn-modules/test');

// TODO the problem is that the private zone stack can not be deleted because the entry (8.8.8.8) was changed
/*test.serial('with-hosted-zone-private', async t => {
  const stackName = cfntest.stackName();
  try {
    t.log(await cfntest.createStack(`${__dirname}/with-hosted-zone-private.yml`, stackName, {}));
    // what could we test here?
  } finally {
    t.log(await cfntest.deleteStack(stackName));
    t.pass();
  }
});*/
