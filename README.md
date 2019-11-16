# AWS Serverless CRUD App 

## Implements Lambdas, API Gateway, and DynamoDB

This project runs a serverless application locally by implementing Lambdas, API Gateway, and DynamoDB.  This project uses [AWS SAM](https://aws.amazon.com/serverless/sam/).  [Tutorial on getting AWS SAM running locally](https://github.com/aaronwht/aws-sam-dynamodb-local).  

This project has a [companion client-side project](https://github.com/aaronwht/aws-serverless-client) for UI interactions.

.env file:   
DYNAMODB_ENDPOINT=http://docker.for.mac.host.internal:8000   
AWS_UPLOAD_BUCKET=YOUR_AWS_UPLOAD_BUCKET   
AWS_UPLOAD_BUCKET_REGION=YOUR_AWS_UPLOAD_BUCKET_REGION   

AWS_ACCESS_KEY_ID=YOUR_KEY  
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY  