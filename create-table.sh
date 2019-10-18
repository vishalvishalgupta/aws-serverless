aws dynamodb create-table --table-name Persons \
--attribute-definitions AttributeName=personKey,AttributeType=S \
--key-schema AttributeName=personKey,KeyType=HASH \
--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
--endpoint-url http://localhost:8000