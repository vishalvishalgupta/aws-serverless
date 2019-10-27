'use strict'

// docker run -p 8000:8000 -v $(pwd)/local/dynamodb:/data/ amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /data
// sam local start-api --port 3030 --skip-pull-image

const AWS = require('aws-sdk') // dev dependency to save space
require('dotenv').config() // process.env variables
const uuidv4 = require('uuid/v4')

AWS.config.update({
    region: 'us-west-2',
    // dynamodb: { endpoint: process.env.AWS_DYNAMODB_ENDPOINT },
    apiVersion: '2012-08-10'
})

const docClient = new AWS.DynamoDB.DocumentClient()
module.exports.handler = async (event) => {
    try {
        const persons = await docClient.scan({ TableName: "Persons" }).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ persons: persons.Items, v: 4 })
          }
    } catch (err) {
        return {
            statusCode: 200,
            status: 'error',
            message: err
        }
    }
}

module.exports.getPerson = async (event) => {
    try {
        const person = await docClient.get({ TableName: 'Persons', Key: { 'personKey': event.pathParameters.id } }).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'success', person: person.Item })
          }
    } catch (err) {
        return {
            statusCode: 200,
            status: 'error',
            message: err
        }
    }
}

module.exports.addPerson = async (event) => {  
    try {
        const { body } = event
        const input = JSON.parse(body)
        const { firstName, lastName, age } = input

        if (!firstName || !lastName || !age) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Please complete all fields'
                })
            }
        }

        const personKey = uuidv4()
        const params = {
            TableName: 'Persons',
            Item: { personKey, firstName, lastName, age }
        }
        const data = await docClient.put(params).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'success',
                message: 'Member successfully created',
                personKey
            })
        }
    } catch (err) {
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'error',
                message: err.message
            })
        }
    }
}

module.exports.updatePerson = async (event) => {  
    try {
        const { body } = event
        const input = JSON.parse(body)
        const { personKey, firstName, lastName, age } = input

        if (!personKey) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: 'A person record was not provided'
                })
            }
        }

        if (!firstName || !lastName || !age) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Please complete all fields'
                })
            }
        }

        const params = {
            TableName: 'Persons',
            Key: { personKey },
            UpdateExpression: "set firstName = :firstName, lastName = :lastName, age = :age",
            ExpressionAttributeValues:{
                ":firstName":firstName,
                ":lastName":lastName,
                ":age":age,
            },
            ReturnValues:"UPDATED_NEW"
        }
        const data = await docClient.update(params).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'success',
                message: 'Member successfully updated',
                personKey
            })
        }
    } catch (err) {
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'error',
                message: err.message
            })
        }
    }
}

module.exports.deletePerson = async (event) => {  
    try {
        const { body } = event
        const input = JSON.parse(body)
        const { personKey } = input

        if (!personKey) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Please specify a person to delete'
                })
            }
        }

        const params = {
            TableName: 'Persons',
            Key: { personKey }
        }
        await docClient.delete(params).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'success',
                message: 'Member successfully deleted',
                personKey
            })
        }
    } catch (err) {
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'error',
                message: err.message
            })
        }
    }
}