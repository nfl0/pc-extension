class Memory {
    constructor(size = 1024) {
        this.size = size;
        this.segments = {
            code: new Array(Math.floor(size * 0.3)),
            data: new Array(Math.floor(size * 0.4)),
            stack: new Array(Math.floor(size * 0.2)),
            heap: new Array(Math.floor(size * 0.1))
        };
        this.nextAllocationAddress = 0; // Tracks the next available address for allocation
    }

    allocate(segment, size) {
        if (this.nextAllocationAddress + size > this.segments[segment].length) {
            throw new Error("Insufficient memory for allocation");
        }
        const allocationAddress = this.nextAllocationAddress;
        this.nextAllocationAddress += size;
        return allocationAddress;
    }

    read(segment, address) {
        if (address < 0 || address >= this.segments[segment].length) {
            throw new Error("Memory access out of bounds");
        }
        return this.segments[segment][address];
    }

    write(segment, address, value) {
        if (address < 0 || address >= this.segments[segment].length) {
            throw new Error("Memory access out of bounds");
        }
        this.segments[segment][address] = value;
    }
}

class StorageNode {
    constructor(name, isDirectory) {
        this.name = name;
        this.isDirectory = isDirectory;
        this.children = new Map(); // Map to store children (files or directories)
    }
}

class Storage {
    constructor() {
        this.root = new StorageNode("", true); // Root directory
    }

    // Create a file or directory
    create(path, isDirectory) {
        const segments = path.split('/');
        let current = this.root;
        for (const segment of segments) {
            if (!current.children.has(segment)) {
                current.children.set(segment, new StorageNode(segment, isDirectory));
            }
            current = current.children.get(segment);
        }
    }

    // Check if a path exists
    exists(path) {
        const segments = path.split('/');
        let current = this.root;
        for (const segment of segments) {
            if (!current.children.has(segment)) {
                return false;
            }
            current = current.children.get(segment);
        }
        return true;
    }

    // Delete a file or directory
    delete(path) {
        const segments = path.split('/');
        let current = this.root;
        for (const segment of segments) {
            if (!current.children.has(segment)) {
                return; // Path does not exist
            }
            current = current.children.get(segment);
        }
        current.children.clear();
    }
}

class CPU {
    constructor(memory) {
        this.memory = memory;
        this.register = new Array(32).fill(0);
        this.programCounter = 0;
    }

    fetch() {
        const instruction = this.memory.read("code", this.programCounter);
        this.programCounter++;
        return instruction;
    }

    decodeAndExecute(instruction) {
        const parts = instruction.split(",");
        const opcode = parts[0];
        const operands = parts.slice(1);

        switch (opcode) {
            case "MOV":
                const [destination, source] = operands;
                this.register[destination] = this.memory.read("data", source);
                break;
            case "ADD":
                const [destinationAdd, operand1, operand2] = operands;
                this.register[destinationAdd] = this.register[operand1] + this.register[operand2];
                break;
            case "STORE":
                const  [sourceReg, destinationAddress] = operands;
                this.memory.write("data", destinationAddress, this.register[sourceReg]);
                break;
            case "KEYGET":
                console.log("getvaluefromobjectusingakey")
                break;
            case "ALLOC": // New instruction to allocate memory
                const [segment, size] = operands;
                const allocationAddress = this.memory.allocate(segment, size);
                this.register[segment] = allocationAddress; // Store the allocated address in a register
                break;
            case "HALT":
                console.log("Execution halted.");
                break;
            default:
                throw new Error("Unknown instruction: " + instruction);
        }
    }

    run() {
        while (true) {
            const instruction = this.fetch();
            if (instruction === "HALT") {
                break;
            }
            this.decodeAndExecute(instruction);
        }
    }
}

function loadProgramAndVariables(memory, program, variables) {
    program.forEach((instruction, index) => {
        memory.write("code", index, instruction);
    });

    variables.forEach((value, index) => {
        memory.write("data", index, value);
    });
}

const memory = new Memory();

const program = [
    "ALLOC,data,3",
    "MOV,1,0",
    "MOV,2,1",
    "ADD,3,1,2",
    "STORE,3,2",
    "HALT"
];

const variables = [10, 20];

loadProgramAndVariables(memory, program, variables);

const cpu = new CPU(memory);

cpu.run();

console.log("Memory segments after execution:");
console.log(memory.segments);

const storage = new Storage();
storage.create("home/user/documents", true);
console.log(storage.exists("home/user/documents")); // true
console.log(storage.exists("home/user/images")); // false
storage.delete("home/user/documents");
console.log(storage.exists("home/user/documents")); // false
