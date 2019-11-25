#!/usr/bin/env node

const path = require('path')
// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage')

const projectId =
  process.env.NODE_ENV === 'production' ? 'q-torial' : 'still-protocol-228301'
const keyFilename = path.join(
  __dirname,
  `../${
    process.env.NODE_ENV === 'production'
      ? 'q-torial-firebase-adminsdk-ejl4w-29ec1987ad.json'
      : 'still-protocol-228301-firebase-adminsdk-i9ol4-8b98dccfe2.json'
  }`
)
const bucketName =
  process.env.NODE_ENV === 'production'
    ? 'q-torial-public'
    : 'still-protocol-228301-public'
const storage = new Storage({
  projectId,
  keyFilename,
})

const file = path.join(__dirname, '../tag/q-torial.js')

async function uploadFile() {
  // Uploads a local file to the bucket
  const bucket = storage.bucket(bucketName)
  const filename = 'js/q-torial.js'
  await bucket.upload(file, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    destination: filename,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    // https://cloud.google.com/storage/docs/metadata
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'public, max-age=3600',
    },
  })
  bucket.file(filename).makePublic()

  console.log(`${filename} uploaded to ${bucketName}.`)
}

uploadFile()
