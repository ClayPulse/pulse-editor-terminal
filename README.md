## Pulse Editor Terminal
Pulse Editor Terminal is a Pulse Editor terminal extension that allows you to connect to a terminal (e.g. shell, PowerShell, Termux) on your local device.

## Get Started
### Connect to your device's terminal
#### Desktop
Desktop shell should be automatically connected when you open Pulse Editor on desktop. 
#### Android: Setup node-pty in Termux
You have to setup terminal server on your Android device manually, and start it every time you'd need to use this terminal extension on Android. 
1. Install Termux, following guide on [Termux's GitHub repo](https://github.com/termux/termux-app). If you prefer a more linux-like interaction using your preferred distro in Termux, you can try out [Androidnix](https://andronix.app/).
2. Install nodejs 22 in Termux.
```
apt update
apt install nodejs-lts
```
1. Clone this [minimal node-pty server repo](https://github.com/ClayPulse/termux-node-pty) used to generate terminal websocket using node-pty.
```bash
git clone https://github.com/ClayPulse/termux-node-pty
cd termux-node-pty
```
2. Install dependencies
```bash
# Install build tools to build native module
apt install -y make python build-essential

# Set android_ndk_path placeholder to avoid build error when installing node-pty
export GYP_DEFINES="android_ndk_path=''"

npm i
```
5. Start node-pty server
```
node node-pty-server.js
```

6. Fill websocket URL produced by proxy server in Pulse Editor settings. It should be `ws://localhost:6060` by default.

### Start development
#### Method 1: Install your extension in Pulse Editor as a dev extension
Run the following to start a dev server locally.
```
npm run dev
```
This will host your extension at http://localhost:3001 (or you can customize the server host in `webpack.config.ts`). Then in Pulse Editor, go to settings and fill in your extension dev server's information to install you new extension. You will need the following
- dev server: e.g. http://localhost:3001
- extension id: your extension's ID specified in `pulse.config.ts` 
- version: your extension's version specified in `pulse.config.ts`

#### Method 2: Preview your extension in browser
If you'd like to quickly get started on developing your extension without installing it inside Pulse Editor. You can run a preview dev server that runs in your browser (just like developing React application).
```
npm run preview
```
> Please note that your extension won't be able to use IMC (Inter-Module-Communication) to communicate with Pulse Editor during preview development mode.
