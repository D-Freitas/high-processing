import http from 'node:http'
import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { promises, createReadStream, createWriteStream } from 'node:fs'
import { pipeline, Readable, Transform } from 'node:stream'

import eventStream from 'event-stream'
import JSONStream from 'JSONStream'
import StreamConcat from 'stream-concat'

if (cluster.isMaster) {
  for (let i = 0; i <= cpus().length; i++) {
    cluster.fork()
  }
}

if (!cluster.isMaster) {
  const pipelineAsync = promisify(pipeline)
  const { readdir } = promises
  const { pathname } = new URL(import.meta.url)
  const currentWorkDirectory = dirname(pathname)
  const filesDir = `${currentWorkDirectory}/files`

  const files = await readdir(filesDir)
  const streams = files.map(item => createReadStream(join(filesDir, item)))
  const mergedFiles = new StreamConcat(streams)

  const addActiveProp = eventStream.mapSync(data => {
    data.active = data.status ? 'yes' : 'no'
    return JSON.stringify(data)
  })

  const handleStream = new Transform({
    transform: (chunk, encoding, callback) => {
      const data = JSON.parse(chunk)
      const isOnline = data.active === 'yes'
      const output = `id: ${data.id} | username: ${data.username} | online: ${isOnline}\n`
      console.log(output)
      return callback(null, output)
    }
  })

  async function handle (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET')
    if (request.method === 'GET') {
      const stream = [mergedFiles, JSONStream.parse('users.*'), addActiveProp, handleStream, response]
      await pipelineAsync(...stream)
    }
    response.end()
  }

  const server = http.createServer(handle)
  server.listen(4000)
  server.on('listening', () => {
    console.log(`listening on port 4000 on process: ${process.pid}`)
  })
}
