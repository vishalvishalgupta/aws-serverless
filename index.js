'use strict'

// docker run -p 8000:8000 -v $(pwd)/local/dynamodb:/data/ amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /data
// sam local start-api --port 3030 --skip-pull-image

/*
THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
*/
const AWS = require('aws-sdk') // dev dependency to save space
require('dotenv').config() // process.env variables
const uuidv4 = require('uuid/v4')

AWS.config.update({ region: process.env.REGION, apiVersion: '2012-08-10' })
if (process.env.DYNAMODB_ENDPOINT) AWS.config.update({ dynamodb: { endpoint: process.env.DYNAMODB_ENDPOINT } })

const docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
    try {
        // THIS CODE IS NOT PRODUCTION WORTH - FOR TUTORIAL PURPOSES ONLY
        const persons = await docClient.scan({ TableName: "Persons" }).promise()        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ persons: persons.Items, v: 1 })
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

module.exports.getUploadLocation = async (event) => {
    try {
        const content = JSON.parse(event.body)
        let fileName = content.fileName
        fileName = updateFileName(fileName)

        const s3bucket = new AWS.S3({
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            Bucket: process.env.AWS_BUCKET
        })

        let s3Params = {
            Bucket: process.env.AWS_BUCKET,
            Key: process.env.AWS_BUCKET_FOLDER + '/' + fileName,
            Expires: 60,
            ContentType: 'image/*',
        }

        const data = await s3bucket.getSignedUrl('putObject', s3Params)
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ signedUrl: data })
        }
    } catch (err) {
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            status: 'error',
            message: err.message
        }
    }
}

function updateFileName(fileName) {
    if (!fileName) return

    fileName = fileName.toLowerCase()
    // strip out non-alpha numeric, dots, hyphens, underscores
    fileName = fileName.replace(/[^a-z-0-9.-_]+/gi, '')
    if (fileName === '') return
    if (fileName.indexOf('.') === -1) return

    // assign a random five digit number
    let min = Math.ceil(10000)
    let max = Math.floor(99999)
    const randomNumber = (Math.floor(Math.random() * (max - min + 1)) + min).toString()

    const existingFileName = fileName.split('.')
    let newFileName = ''
    for (let i = 0; i < existingFileName.length-1; i++) {
        newFileName = newFileName + existingFileName[i] + '.'
    }

    newFileName = newFileName.substr(0, newFileName.length - 1)
    const fileExtension = fileName.split('.').pop()
    return newFileName + '-' + randomNumber + '.' + fileExtension
}