import {DownloaderHelper} from 'node-downloader-helper'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = "http://localhost:3002/"
const dir = __dirname + "/dls"
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

 function bytesToMb(val) {
    return Math.round((val / 1024 ** 2) * 10) / 10
  }

async function example() {
    const params = {
        progressThrottle: 10000,
        resumeOnIncomplete: true,
        removeOnFail: false,
        retry: {
            maxRetries: 50,
            delay: 2000,
        },
    }
    let startTime = new Date().getTime()
    const dl = new DownloaderHelper(url, dir, params)
    dl.on('download', downloadInfo =>
        console.log('Download Begins: ', {
            name: downloadInfo.fileName,
            total: downloadInfo.totalSize,
        }),
    )
        .on('end', downloadInfo => console.log('Download Completed: ', downloadInfo))
        .on('error', err => console.error('Something happened', err))
        .on('retry', (attempt, opts, err) => {
            console.log({
                RetryAttempt: `${attempt}/${opts.maxRetries}`,
                StartsOn: `${opts.delay / 1000} secs`,
                Reason: err ? err.message : 'unknown',
            })
        })
        .on('resume', isResumed => {
            if (!isResumed) {
                console.warn(
                    "This URL doesn't support resume, it will start from the beginning",
                )
            }
        })
        .on('stateChanged', state => console.log('State: ', state))
        .on('progress', stats => {
            const progress = stats.progress.toFixed(1)
            const speed = bytesToMb(stats.speed)
            const downloaded = bytesToMb(stats.downloaded)
            const total = bytesToMb(stats.total)

            // print every one second (`progress.throttled` can be used instead)
            const currentTime = new Date().getTime()
            const elaspsedTime = currentTime - startTime
            if (elaspsedTime > 1000) {
                startTime = currentTime
                console.log(`${speed}/s - ${progress}% [${downloaded}/${total}]`)
            }
        })
        // We want to know when the download has started, so we resolve the promise
        // when the first progress event fires
        return new Promise((resolve, reject) => {
            dl.once('progress', () => { console.log("first progress"), resolve({promise: dlPromise})})
            // catch if we failed to start the download
            const dlPromise = dl.start().catch(err => reject(err))
        })
}

let attempt = 1
let dl
for (attempt; attempt <= 3; attempt++) {
    try {
        dl = await example()
        console.log("download started")
        break
    } catch (err) {
        console.log("failed to start download, retrying attempt", attempt, err)
        await sleep(2000)
    }
}
console.log("download is running")
await dl.promise
console.log("download finished")
