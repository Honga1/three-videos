# Three Videos

This is a test website for trying to synchronize Wav2Lip with an interactive documentary

## Running

It can be run locally with `npm start`

## Hosting

It is hosted on Digital-Ocean in a droplet. Set up for this went

1. Create standard dokku image
2. Add ssh keys with

Locally

```bash
cat ~/.ssh/id_rsa.pub | ssh root@138.197.223.251 dokku ssh-keys:add ADMIN
```

3. Create dokku image

On host

```bash
dokku apps:create three-videos
dokku domains:add three-videos three-videos.jaeperris.com
```

4. Run

```bash
npm run deploy
```

INCOMPLETE - See lets encrpyt setup and network setup for digital ocean.
