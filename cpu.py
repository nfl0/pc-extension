import time

class CPU:
    def __init__(self, instructions):
        self.instructions = instructions
        self.gpu = GPU()  # Instantiate GPU

    def execute_instruction(self, instruction):
        if instruction.startswith("print"):
            self.print_message(instruction)
        elif instruction.startswith("sleep"):
            self.sleep(instruction)
        elif instruction.startswith("print_repeat"):
            self.print_repeat(instruction)
        # Add more instructions here as needed

    def print_message(self, instruction):
        message = instruction.split(" ", 1)[1]
        print(message)

    def sleep(self, instruction):
        duration = float(instruction.split(" ", 1)[1])
        time.sleep(duration)

    def print_repeat(self, instruction):
        params = instruction.split(" ")[1:]
        interval = float(params[0])
        duration = float(params[1])
        message = ' '.join(params[2:])
        
        end_time = time.time() + duration
        while time.time() < end_time:
            print(message)
            time.sleep(interval)

    def run(self):
        for instruction in self.instructions:
            self.execute_instruction(instruction)


class GPU:
    def __init__(self):
        pass
    # Placeholder for GPU operations


# Example usage
instructions = [
    "print Hello, world!",
    "sleep 2",
    "print_repeat 1 5 Printing repeatedly every second for 5 seconds.",
    "print Simulation complete."
]

cpu = CPU(instructions)
cpu.run()
