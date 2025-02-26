# cfn-modules Contributor Guide

### Generate ImageId mappings
To update the ImageId map execute the following lines in your terminal:

```
$ regions=$(aws ec2 describe-regions --query "Regions[].RegionName" --output text)
$ for region in $regions; do id=$(aws --region $region ec2 describe-images --owner amazon --filters "Name=name,Values=amzn2-ami-hvm-2.0.20190508-x86_64-gp2" --query "Images[0].ImageId" --output "text"); printf "'$region':\n  ImageId: '$id'\n"; done
```