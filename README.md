## Pulse Editor Terminal
Pulse Editor Terminal is a Pulse Editor terminal extension that allows you to connect to a terminal (e.g. shell, PowerShell, Termux) on your local device.

## Get Started
### Connect to your device's terminal
#### Desktop
Desktop shell should be automatically connected when you open Pulse Editor on desktop. 
#### Android: Connection via Termux sshd
1. Install Termux, following guide on [Termux's GitHub repo](https://github.com/termux/termux-app). If you prefer a more linux-like interaction using your preferred distro in Termux, you can try out [Androidnix](https://andronix.app/).
2. Install openssh.
    ```bash
    # Update latest package mirrors,
    # or use 'apt update'.
    pkg update
    # Install openssh
    pkg install openssh
    ```
3. Start openssh server.
    ```bash
    sshd
    ```
4. Find out and note down username and your phone's IP.

    To get username:
    ```bash
    whoami
    ```
    To set user password:
    ```bash
    passwd
    ```
    Or if you prefer using public key authentication, follow [Termux's Wiki on Remote Access](https://wiki.termux.com/wiki/Remote_Access#Using_the_SSH_server)
5. (WIP) Fill username and optionally credential information in Pulse Editor settings. 
6. (Optional -- for development) Connect from remote terminal **on your PC** via ADB.
    > Make sure you have enabled developer options on your Android device, and opened "USB debugging" for USB connection or "Wireless debugging" for wireless connection.

    First, get your phone's IP (you might need to run `pkg install net-tools` to install ifconfig):
    ```bash
    ifconfig
    ```

    There are many ways to pair your Android device via ADB. 
    - For more user friendly UI based connection, try out Android Studio.
    - For CLI connection, use `adb pair HOST[:PORT] [PAIRING CODE]`. 

    Once you have paired your device using ADB, you can now connect to Termux from your PC.
    ```bash
    # Connect to Termux
    ssh -p 8022 username_from_step4@IP_of_your_phone_from_step4
    ```

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
