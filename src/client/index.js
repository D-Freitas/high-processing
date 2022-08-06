import axios from 'axios'
import { Transform, Writable } from 'stream'

const url = 'http://localhost:3000'

async function consume () {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  return response.data
}

const stream = await consume()
let i = 1;
stream.pipe(
  Writable({
    write(chunk, e, cb) {
      process.stdout.write(`
        received > ${chunk.toString()}
        ${i}
      `)
      i++
      cb()
    }
  })
)
