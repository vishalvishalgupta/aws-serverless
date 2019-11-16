aws dynamodb create-table --table-name Places \
--attribute-definitions AttributeName=placeKey,AttributeType=S \
--key-schema AttributeName=placeKey,KeyType=HASH \
--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
--endpoint-url http://localhost:8000


aws dynamodb update-table --table-name Places \
--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
--global-secondary-index-updates '[{
    "Update": {
        "IndexName": "Email-index",
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 2,
            "WriteCapacityUnits": 1
        }
    }
}]'