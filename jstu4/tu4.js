(function(global) {
    /**
     * Build new Turing Machine
     * - commands - array of TM.Command instances
     * - q0 - initial state [optional]
     *
     * Throws TM.CompileError of types:
     * - TM.EmptyProgramError when program is empty
     * - TM.AmbiguosCommandError when program contains two or more
     *       commands with the same q and a
     * - TM.NonexistentTargetState when there is not any
     *       transition for a state, mentioned as a target state
     * - TM.NonexistentInitialState when there is not any
     *       transition for a state, passed as initial
     */
    var TM = function(commands, q0) {
        var program = {},
            cmd;
        if(commands.length == 0) {
            throw new TM.EmptyProgramError();
        }

        // if q0 is not set, assume the first state met in program is initial
        if(typeof(q0) === 'undefined' || q0 === null) {
            q0 = commands[0].q();
        }

        for(var i = 0; i < commands.length; i++) {
            var cmd = commands[i];
            if(!program[cmd.q()]) {
                program[cmd.q()] = {};
            }
            if(program[cmd.q()][cmd.a()]) {
                throw new TM.AmbiguosCommandError({
                    'cmd': cmd,
                    'original': program[cmd.q()][cmd.a()]
                });
            }
            program[cmd.q()][cmd.a()] = cmd;
        }

        if(!program[q0]) {
            throw new TM.NonexistentInitialState({ 'q': q0 });
        }

        for(var q in program) {
            for(var a in program[q]) {
                var cmd = program[q][a];
                if(!program[cmd.w()]) {
                    throw new TM.NonexistentTargetState({ 'cmd': cmd });
                }
            }
        }

        /**
         * Return initial state
         */
        this.q0 = function() { return q0 }

        /**
         * Return machine program
         */
        this.commands = function() {
            var commands = [];
            for(var q in program) {
                for(var a in program[q]) {
                    commands.push(program[q][a]);
                }
            }
            return commands;
        }

        /** Start the machine */
        this.run = function(tape) {
            return new TMRun(program, tape, q0);
        }

    }

    TM.version = '2.3';

    var TMRun = function(program, tape, q0) {
        tape = tape.replace(/\s*$/, '');
        var isRunning = true,
            q = q0,
            pos = tape.length,
            nextCommand,
            initialTape;

        /** Check if the machine has stopped */
        this.isRunning = function() { return isRunning }
        /** Get current state */
        this.q = function() { return q }
        /** Get current position on tape */
        this.pos = function() { return pos }
        /** Get a symbol in the specified position on tape */
        this.symbolAt = function(index) { return tape.charAt(index) || ' ' }
        /** Get current symbol */
        this.a = function() { return this.symbolAt(pos) || ' ' }
        /** Get a tape as a string */
        this.tape = function() {
            // user expects that pos inside tape's bounds
            // so, let such a side-effect exist
            while(tape.length <= pos) {
                tape += ' ';
            }
            return tape;
        }
        /** Get the initial tape state */
        this.initialTape = function() { return initialTape }
        /** Get the next command to be executed */
        this.nextCommand = function() { return nextCommand }

        initialTape = this.tape();
        nextCommand = program[q][this.a()];

        /**
         * If machine is running, perform a step and return true
         * Otherwise, return false
         *
         * Throws
         * - TM.NoSuchCommandError
         * - TM.OutOfTapeError
         */
        this.step = function() {
            if(!isRunning) {
                return false;
            }

            if(!nextCommand) {
                isRunning = false;
                throw new TM.NoSuchCommandError({ 'q': this.q(), 'a': this.a() });
            }

            if(nextCommand.isLeft()) {
                if(pos === 0) {
                    isRunning = false;
                    throw new TM.OutOfTapeError(nextCommand);
                }
                pos--;
            } else if(nextCommand.isRight()) {
                pos++;
            } else if(nextCommand.isWrite()) {
                tape = tape.substring(0, pos) + nextCommand.v() + tape.substring(pos + 1);
            }

            if(nextCommand.isStop()) {
                isRunning = false;
            } else {
                q = nextCommand.w();
                nextCommand = program[q][this.a()];
            }

            return true;
        }
    }

    /** Generic runtime error */
    TM.RuntimeError = function(data) { this.data = data }

    /** Head moved at the position -1 */
    TM.OutOfTapeError = function(data) { this.data = data }
    /** There is not a command for state 'q' and symbol 'a' */
    TM.NoSuchCommandError = function(data) { this.data = data }

    TM.OutOfTapeError.prototype = new TM.RuntimeError();
    TM.NoSuchCommandError.prototype = new TM.RuntimeError();

    /** Generic compile error */
    TM.CompileError = function(data) { this.data = data }

    /** Text couldn't be parsed as a command */
    TM.CouldntParseError = function(data) { this.data = data }
    /** Program is empty (so even initial state cannot be defined) */
    TM.EmptyProgramError = function(data) { this.data = data }
    /** There are two or more commands with identical 'q' and 'a' */
    TM.AmbiguosCommandError = function(data) { this.data = data }
    /** State referenced as a target state does not exist */
    TM.NonexistentTargetState = function(data) { this.data = data }
    /** State referenced as the initial state does not exist */
    TM.NonexistentInitialState = function(data) { this.data = data }

    TM.CouldntParseError.prototype = new TM.CompileError();
    TM.EmptyProgramError.prototype = new TM.CompileError();
    TM.AmbiguosCommandError.prototype = new TM.CompileError();
    TM.NonexistentTargetState.prototype = new TM.CompileError();
    TM.NonexistentInitialState.prototype = new TM.CompileError();


    /**
     * A command of the Turing Machine
     * q - current state
     * a - current symbol
     * v - command or write symbol
     * w - new state
     * data - arbitraty data associated with a command [optional],
     *     for example, command source code or offset
     */
    TM.Command = function(q, a, v, w, data) {
        this.q = function() { return q }
        this.a = function() { return a }
        this.v = function() { return v }
        this.w = function() { return w }
        this.data = data; // public mutable attribute
    }

    // different types of TMCommand

    /** Check if the command is a 'move left' command */
    TM.Command.prototype.isLeft = function() {
        return this.v() === '<';
    }
    /** Check if the command is a 'move right' command */
    TM.Command.prototype.isRight = function() {
        return this.v() === '>';
    }
    /** Check if the command is a 'stop' command */
    TM.Command.prototype.isStop = function() {
        return this.v() === '#' ||
              (this.a() === this.v() && this.q() === this.w());
    }
    /** Check if the command is a 'stay' command */
    TM.Command.prototype.isStay = function() {
        return this.v() === '=' ||
              (this.a() === this.v() && this.q() !== this.w());
    }
    /** Check if the command is a 'write symbol' command */
    TM.Command.prototype.isWrite = function() {
        return this.v() !== this.a() &&
               this.v() !== '<' && this.v() !== '>' &&
               this.v() !== '#' && this.v() !== '=';
    }

    TM.Command.prototype.toString = function() {
        return this.q() + ',' + this.a() + ',' + this.v() + ',' + this.w();
    }

    /**
     * Return ready-to-use Turing Machine program
     * - text - program text to parse
     * - q0 - initial state for resulting machine
     * - cmdCallback(cmd) - function to call after parsing each command
     *
     * Throws TM.CompileError of types:
     * - TM.CouldntParseError when text cannot be parsed as a command
     * - TM.EmptyProgramError when program is empty
     * - TM.AmbiguosCommandError when program contains two or more
     *       commands with the same q and a
     * - TM.NonexistentTargetState when there is not any
     *       transition for a state, mentioned as a target state
     * - TM.NonexistentInitialState when there is not any
     *       transition for a state, passed as initial
     */
    TM.compile = function(text, q0, cmdCallback) {
        var pos = 0,
            commands = [],
            arr,
            cmd,
            parseStateName = function(stateName) {
                if(/^\d+$/.test(stateName)) {
                    return parseInt(stateName, 10);
                }
                return stateName;
            };

        // do while text is not empty
        //while(!/^\s*$/.test(text)) {
        while(text) {
            // skip whitespaces
            arr = /^\s+/.exec(text);
            if(arr !== null) {
                pos += arr[0].length;
                text = text.substring(arr[0].length);
                continue;
            }

            // skip a comment if any
            arr = /^(#|\/\/)[^\n]*(\n|$)/.exec(text);
            if(arr !== null) {
                pos += arr[0].length;
                text = text.substring(arr[0].length);
                continue;
            }

            // try to parse a command
            arr = /^([^\s]+),(.),(.),([^\s]+)/.exec(text);
            if(arr === null) {
                throw new TM.CouldntParseError({
                    'offset': pos,
                    'text': text.substring(0, 10).replace(/\n/g, ' ')
                        .replace(/^\s*/, '').replace(/\s*$/g, '')
                });
            }

            cmd = new TM.Command(parseStateName(arr[1]) /* q */,
                                 arr[2] /* a */,
                                 arr[3] /* v */,
                                 parseStateName(arr[4]) /* w */,
                                 {
                                     'src': arr[0],
                                     'offset': pos
                                 } /* data */);

            pos += arr[0].length;
            text = text.substring(arr[0].length);

            commands.push(cmd);

            if(cmdCallback) {
                cmdCallback(cmd);
            }
        }

        if(typeof(q0) === 'undefined' || q0 === null) {
            q0 = null; // let the TM constructor decide
        } else {
            q0 = parseStateName('' + q0);
        }

        return new TM(commands, q0);
    }

    global.TM = TM;
})(this);
