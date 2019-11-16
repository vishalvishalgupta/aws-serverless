'use strict'
const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({ region: process.env.REGION, apiVersion: '2012-08-10' })
if (process.env.AWS_SAM_LOCAL) AWS.config.update({ dynamodb: { endpoint: process.env.DYNAMODB_ENDPOINT } })

const docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
    try {
        // This code will NOT work if you've specified a global secondary index!!!
        const place = await docClient.get({ TableName: 'Places', Key: { "placeKey": event.pathParameters.id } }).promise()
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'success', place: place.Item })
          }
    } catch (err) {
        return {
            statusCode: 200,
            status: 'error',
            message: err
        }
    }
}