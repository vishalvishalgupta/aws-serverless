'use strict'

const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({ region: process.env.REGION, apiVersion: '2012-08-10' })
if (process.env.AWS_SAM_LOCAL) AWS.config.update({ dynamodb: { endpoint: process.env.DYNAMODB_ENDPOINT } })

const docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
    try {
        // This code works locally and when calling a Lambda function
        // using API Gateway.  It returns the message 'Unexpected token u in JSON at position 0 when
        // 'testing' the Lambda function in the AWS Lambda console.  - Don't know why this is.
        const body = JSON.parse(JSON.stringify(event.body))
        const { placeKey } = JSON.parse(body)

        if (!placeKey) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Please specify a place to delete'
                })
            }
        }

        try {
            // This code will NOT work if you've specified a global secondary index!!!
            const params = {
                TableName: "Places",
                Key: { "placeKey": placeKey }
            }
            await docClient.delete(params).promise()
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'success',
                    message: 'Place successfully deleted',
                    placeKey
                })
            }
        } catch(err) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'error',
                    message: err.message,
                    placeKey
                })
            }
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
