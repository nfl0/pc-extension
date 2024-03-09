// CPU class
class CPU {
    constructor() {
        this.alarmId = null;
    }
    startClock() {
        this.alarmId = chrome.alarms.create("clock", {
            when: Date.now() + 30000, // 30 seconds
            periodInMinutes: 0.5 // repeat every 30 seconds
        });
        chrome.alarms.onAlarm.addListener(() => {
            console.log("CPU clock ticked");
          });
    }
    stopClock() {
        chrome.alarms.clear("clock");
    }
}

// GPU class
class GPU {
    constructor() {
        this.badge = { text: '' };
        this.title = { text: '' };
        this.badgeBackgroundColor = { color: '' };
    }
    setBadge(text) {
        this.badge.text = text;
        chrome.action.setBadgeText({ text });
    }
    setTitle(text) {
        this.title.text = text;
        chrome.action.setTitle({ title: text });
    }
    setBadgeBackgroundColor(color) {
        this.badgeBackgroundColor.color = color;
        chrome.action.setBadgeBackgroundColor({ color });
    }
}

// Memory class
class Memory {
    constructor(size = 1024) {
        this.size = size;
        this.segments = {
            code: new Array(size * 0.3),
            data: new Array(size * 0.4),
            stack: new Array(size * 0.2),
            heap: new Array(size * 0.1)
        };
    }

    read(segment, address) {
        if (this.segments.hasOwnProperty(segment)) {
            return this.segments[segment][address];
        } else {
            console.error(`Segment '${segment}' not found.`);
            return null;
        }
    }

    write(segment, address, data) {
        if (this.segments.hasOwnProperty(segment)) {
            this.segments[segment][address] = data;
        } else {
            console.error(`Segment '${segment}' not found.`);
        }
    }
}

// Storage class
class Storage {
    constructor() {
        this.localStorage = chrome.storage.local;
        this.fileSystem = {
            etc: {
                hosts: null,
                passwd: null
            },
            home: {
                user: {
                    documents: null,
                    downloads: null
                }
            },
            var: {
                log: null,
                cache: null
            },
            tmp: null
        };
        this.initializeFileSystem();
    }

    initializeFileSystem() {
        this.localStorage.set({ fileSystem: this.fileSystem });
    }

    set(key, value) {
        this.localStorage.set({ [key]: value });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.localStorage.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key]);
                }
            });
        });
    }

    remove(key) {
        this.localStorage.remove(key);
    }
}

// Networking class
class Networking {
    constructor() {
        this.port = chrome.runtime.connect({ name: "messaging" });
    }
    sendMessage(message) {
        this.port.postMessage(message);
    }
    receiveMessage(callback) {
        this.port.onMessage.addListener(callback);
    }
}

// Computer class
class Computer {
    constructor() {
        this.cpu = new CPU();
        this.gpu = new GPU();
        this.storage = new Storage();
        //this.networking = new Networking();
    }
    start() {
        this.cpu.startClock();
        this.gpu.setBadge("Idle");
        this.gpu.setTitle("Idle");
        //this.networking.sendMessage("Initialized");
    }
    stop() {
        this.cpu.stopClock();
        this.gpu.setBadge("");
        this.gpu.setTitle("");
        //this.networking.sendMessage("Terminated");
    }
    async readScript() {
        try {
            const scriptContent = await this.storage.get('script');
            await this.interpretScript(scriptContent); // Interpret the script after reading
        } catch (error) {
            console.error('Error reading script:', error);
            return null;
        }
    }    
    async interpretScript(script) {
        if (!script) {
            console.error('Script is null or empty.');
            return;
        }
        try {
            const parsedLines = script.trim().split('\n').filter(line => !!line.trim());
            await this.executeCommands(parsedLines);
        } catch (error) {
            console.error('Error interpreting script:', error);
        }
    }
    async executeCommands(commandsArray) {
        for (const cmdLine of commandsArray) {
            const tokens = cmdLine.split(/ +/);
            const keyword = tokens[0].toLowerCase();
            const args = tokens.slice(1);
            switch (keyword) {
                case 'echo':
                    await this.echoCommandHandler(args);
                    break;
                case 'sleep':
                    await this.sleepCommandHandler(args);
                    break;
                case 'updatebrowseraction':
                    await this.updateBrowserActionCommandHandler(args);
                    break;
                default:
                    this.logWarning(`Unknown Command: ${cmdLine}`);
            }
        }
    }    
    async echoCommandHandler(args) {
        console.log(args.join(' '));
    }
    async sleepCommandHandler(args) {
        const millisecondsToWait = parseInt(args[0], 10);
        await this.waitForMilliseconds(millisecondsToWait);
    }
    async updateBrowserActionCommandHandler(args) {
        const updatedInfo = {};
        ['badge', 'title', 'backgroundcolor'].forEach((prop, index) => {
            updatedInfo[prop] = args[index] ?? '';
        });
        await this.gpu.setBadge(updatedInfo.badge);
        await this.gpu.setTitle(updatedInfo.title);
        await this.gpu.setBadgeBackgroundColor(updatedInfo.backgroundcolor);
    }
    async waitForMilliseconds(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    logWarning(message) {
        console.warn(message);
    }
}

// Initialize computer
//let computer = new Computer();
//computer.start();
//(async () => {
//    const fileSystem = await computer.storage.get('fileSystem');
//    console.log(fileSystem);
//})();
//computer.storage.set("script", "echo hello world\nsleep 1000\nupdateBrowserAction hello HelloWorld #008000");
//computer.readScript();
