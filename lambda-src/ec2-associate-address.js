const AWS = require('aws-sdk');
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});
const autoscaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});

exports.handler = async function(event, context) {
  console.log(JSON.stringify(event));
  if (event.Records.length !== 1) {
    throw Error(`BatchSize must be 1, but received ${event.Records.length}`);
  } else {
    const record = event.Records[0];
    const body = JSON.parse(record.body);
    if (body.Event === 'autoscaling:TEST_NOTIFICATION') {
      return true;
    } else if (body.LifecycleTransition === 'autoscaling:EC2_INSTANCE_LAUNCHING') {
      const metadata = JSON.parse(body.NotificationMetadata);
      if ('AllocationId' in metadata) {
        await ec2.associateAddress({
          AllocationId: metadata.AllocationId,
          AllowReassociation: true,
          InstanceId: body.EC2InstanceId
        }).promise();
      }
      if ('HostedZoneId' in metadata && 'Name' in metadata) {
        const describeInstancesData = await ec2.describeInstances({
          InstanceIds: [body.EC2InstanceId]
        }).promise();
        const ipv4 = describeInstancesData.Reservations[0].Instances[0].PrivateIpAddress;
        await route53.changeResourceRecordSets({
          HostedZoneId: metadata.HostedZoneId,
          ChangeBatch: {
            Changes: [{
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: metadata.Name,
                Type: 'A',
                TTL: 60,
                ResourceRecords: [{
                  Value: ipv4
                }]
              }
            }]
          }
        }).promise();
      }
      await autoscaling.completeLifecycleAction({
        AutoScalingGroupName: body.AutoScalingGroupName,
        LifecycleActionResult: 'CONTINUE',
        LifecycleActionToken: body.LifecycleActionToken,
        LifecycleHookName: body.LifecycleHookName
      }).promise();
      return true;
    } else {
      throw Error(`unexpected lifecycle transition received ${body.LifecycleTransition}`);
    }
  }
};
