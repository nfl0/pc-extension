class CPU {
    constructor(instructions, gpu) {
        this.instructions = instructions;
        this.gpu = gpu;
    }

    executeInstruction(instruction) {
        if (instruction.startsWith("print")) {
            this.printMessage(instruction);
        } else if (instruction.startsWith("sleep")) {
            this.sleep(instruction);
        }
        // Add more instructions here as needed
    }

    printMessage(instruction) {
        const message = instruction.split(" ").slice(1).join(" ");
        this.gpu.updateTitle(message);
        console.log(message);
    }

    sleep(instruction) {
        const duration = parseFloat(instruction.split(" ")[1]);
        setTimeout(() => {
            this.gpu.updateTitle(`CPU slept for ${duration} seconds.`);
            console.log(`CPU slept for ${duration} seconds.`);
        }, duration * 1000); // Convert seconds to milliseconds
    }

    run() {
        for (const instruction of this.instructions) {
            this.executeInstruction(instruction);
        }
    }
}

class GPU {
    constructor() {
        // Access the extension's badge, title, and badgeText through chrome.extension API
    }

    updateBadge(text) {
        chrome.action.setBadgeText({ text: text });
    }

    updateTitle(title) {
        chrome.action.setTitle({ title: title });
    }
}

const instructions = [
    "print Hello, world!",
    "sleep 2",
    "print Simulation complete."
];

const gpu = new GPU();
const cpu = new CPU(instructions, gpu);

// Run the CPU instructions initially
cpu.run();

// Schedule CPU instructions to run every 30 seconds using chrome.alarms API
chrome.alarms.create({ periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cpuExecution") {
        cpu.run();
    }
});
