## Installing Node.js <img height="32" width="32" src="https://cdn.simpleicons.org/nodedotjs"  alt="nodedotjs"/>
https://nodejs.org/
<br>or
```bash
sudo apt update
```
```bash
sudo apt install nodejs
```
```bash
sudo apt install npm
```
## Installing dependencies
```bash
npm install
```
## Install Redis <img height="32" width="32" src="https://cdn.simpleicons.org/redis"  alt="redis"/>
```bash
sudo apt update
```
```bash
sudo apt install redis-server
```
## Rename the environment file
`env.local` => `.env.local`
## Changing the link to the site
Rename `NEXTAUTH_URL`
```bash
nano .env.local
```
## Launch Next.js <img height="32" width="32" src="https://cdn.simpleicons.org/nextdotjs/lightblue"  alt="nextdotjs"/>
- dev:
```bash
npm run dev
```
- production:
```bash
npm run build
```
```bash
npm run start
```