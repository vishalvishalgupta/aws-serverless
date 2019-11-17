'use strict'

const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({ region: process.env.REGION, apiVersion: '2012-08-10' })

module.exports.handler = async (event) => {
    try {
        const content = JSON.parse(event.body)
        let fileName = content.fileName
        fileName = updateFileName(fileName)
        const s3bucket = new AWS.S3({
            region: process.env.AWS_UPLOAD_BUCKET_REGION, // MUST BE THE SAME REGION WHERE YOUR BUCKET EXISTS!!!
            accessKeyId: process.env.AWS_S3_UPLOAD_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_S3_UPLOAD_SECRET_ACCESS_KEY,
            Bucket: process.env.AWS_UPLOAD_BUCKET
        })
        
        let s3Params = {
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: fileName,
            Expires: 60,
            ContentType: '*/*',
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