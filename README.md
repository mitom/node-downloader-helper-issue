reproduction of resume error for node-downloader-helper

1. build docker image - `docker build . -t node-downloader-helper`
2. launch docker image in terminal 1 - `docker run -it --rm -p 3002:80 node-downloader-helper` - leave it running with terminal open
3. open 2nd terminal, run download test - `node client/downloader.js`
4. Wait until download starts (i.e. it starts printing download progress)
5. ctrl+c on terminal 1 to stop the server, i.e. simulate the connection breaking
6. note in terminal 2 that the retries start happening
7. restart terminal 1, same commend as before in step 2

At this point the download will have failed and ignored the retry settings.

The way to reproduce this (i.e. the way this works) is that we have a server which alternates between sending an error/sending a test file. When the download client starts, it gets an error (which is due to https://github.com/hgouveia/node-downloader-helper/issues/113), we then re-try which gets the file. When the server is restarted, the client will re-try which will get an error again, causing the issue.

The test file is just 10MB of random of zeros (`dd if=/dev/zero of=test.file  bs=1m  count=10`)
The nginx component is only there to limit bandwidth otherwise the transfer would be instant and we couldn't observe the issue.
