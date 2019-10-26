sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket aws-lambda-dynamodb
sam deploy --template-file packaged.yaml --stack-name aws-lambda-dynamodb --capabilities CAPABILITY_IAM
# mkdir pipeline
# cd pipeline
# sam init --location gh:aws-samples/cookiecutter-aws-pipe
# move buildspec.yaml to root
# aws ssm put-parameter --name "/service/aws-lambda-dynamodb-pipe/github/repo" --description "Github Repository name for Cloudformation Stack aws-lambda-dynamodb-pipe" --type "String" --value "aws-lambda-dynamodb-local"
# aws ssm put-parameter --name "/service/aws-lambda-dynamodb-pipe/github/token" --description "Github Token for Cloudformation Stack aws-lambda-dynamodb-pipe" --type "String" --value "TOKEN"
# aws ssm put-parameter --name "/service/aws-lambda-dynamodb-pipe/github/user" --description "Github Username for Cloudformation Stack aws-lambda-dynamodb-pipe" --type "String" --value "aaronwht"
# cd pipeline
aws cloudformation create-stack --stack-name aws-serverless-pipeline --template-body file://pipeline.yaml --capabilities CAPABILITY_NAMED_IAM
aws cloudformation deploy --template-file packaged.yaml --stack-name aws-serverless --capabilities CAPABILITY_IAM