class CPU {
    constructor(memory) {
        this.memory = memory;
        this.register = new Array(32).fill(0); // 32 general-purpose registers
        this.programCounter = 0;
    }

    fetch() {
        // Fetch instruction from memory at the address stored in program counter
        const instruction = this.memory.read(this.programCounter);
        this.programCounter++; // Increment program counter
        return instruction;
    }

    decodeAndExecute(instruction) {
        // Decode instruction and execute corresponding operation
        const parts = instruction.split(" ");
        const opcode = parts[0];
        const operand1 = parts[1];
        const operand2 = parts[2];

        switch (opcode) {
            case "MOV":
                this.register[operand1] = this.memory.read(operand2);
                break;
            case "ADD":
                this.register[operand1] = this.register[operand2] + this.register[operand3];
                break;
            case "HALT":
                console.log("Execution halted.");
                break;
            default:
                throw new Error("Unknown instruction: " + instruction);
        }
    }

    run() {
        // Execute instructions until halt
        while (true) {
            const instruction = this.fetch();
            if (instruction === "HALT") {
                break; // Halt execution
            }
            this.decodeAndExecute(instruction);
        }
    }
}

class Memory {
    constructor(size = 1024) {
        this.size = size;
        this.segments = {
            code: new Array(Math.floor(size * 0.3)),
            data: new Array(Math.floor(size * 0.4)),
            stack: new Array(Math.floor(size * 0.2)),
            heap: new Array(Math.floor(size * 0.1))
        };
    }

    read(segment, address) {
        // Read data from the specified segment at the given address
        if (address < 0 || address >= this.segments[segment].length) {
            throw new Error("Memory access out of bounds");
        }
        return this.segments[segment][address];
    }

    write(segment, address, value) {
        // Write data to the specified segment at the given address
        if (address < 0 || address >= this.segments[segment].length) {
            throw new Error("Memory access out of bounds");
        }
        this.segments[segment][address] = value;
    }
}

function loadProgramAndVariables(memory, program, variables) {
    // Load program instructions into the code segment
    program.forEach((instruction, index) => {
        memory.write("code", index, instruction);
    });

    // Load variables into the data segment
    variables.forEach((value, index) => {
        memory.write("data", index, value);
    });
}

// Example usage
const memory = new Memory();

const program = [
    "MOV R1, [0]", // Example instruction
    "MOV R2, [1]",
    "ADD R3, R1, R2",
    "HALT"
];

const variables = [10, 20]; // Example variables

loadProgramAndVariables(memory, program, variables);

console.log(memory.segments);

cpu.run(); // Execute program