'use strict';
/* globals _, engine */
window.initGame = function () {
    var command =
        '5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n 0 3 w\n LLFFFLFLFL';
    // jordans solution bounds obj, ghosts array
    var bounds = [],
        ghosts = [];
    // jordan solution ghost
    var Ghost = function (vals) {
        this.x = vals.x;
        this.y = vals.y;
        this.o = vals.o;
        this.command = vals.command;
        this.report = function () {
            return 'I died going ' + this.o.toUpperCase() + ' from coordinates: ' + this.x + ', ' + this.y;
        };
    };
    // jordan solution bounds check
    var boundsCheck = function (robo) {
        if (robo.command[0] === 'f') {
            switch (robo.o) {
            case 'n':
                if (robo.y === 0) {
                    return false;
                }
                return true;
                break;
            case 'e':
                if (robo.x === bounds[0]) {
                    return false;
                }
                return true;
                break;
            case 's':
                if (robo.y === bounds[1]) {
                    return false;
                }
                return true;
                break;
            case 'w':
                if (robo.x === 0) {
                    return false;
                }
                return true;
            }
        } else {
            return true;
        }
    };
    // jordans solution
    var performCommand = function (robo, command) {
        switch (command) {
        case 'f':
            robo.forward();
            break;
        case 'l':
            robo.rl();
            break;
        case 'r':
            robo.rr();
            break;
        }

    };

    // jordans solution - util func for summary
    var iter = function (item, frag) {
        var li = document.createElement('li');
        li.textContent = item.report();
        frag.appendChild(li);
    };
    // jordans solution main robot constructor
    var Robo = function (commandValues) {
        var self = this;
        this.x = commandValues.x;
        this.y = commandValues.y;
        this.o = commandValues.o.toLowerCase();
        this.command = commandValues.command.toLowerCase();
        this.report = function () {
            return 'Position: ' + self.x + ', ' + self.y + ' | ' + 'Orientation: ' + self.o.toUpperCase();
        };
        this.ticked = function () {
            self.command = _.tail(self.command);
        };
        this.forward = function () {
            switch (self.o) {
            case 'n':
                self.y -= 1;
                break;
            case 'e':
                self.x += 1;
                break;
            case 's':
                self.y += 1;
                break;
            case 'w':
                self.x -= 1;
                break;
            }
            self.ticked();
        };
        this.rr = function () {
            switch (self.o) {
            case 'n':
                self.o = 'e';
                break;
            case 'e':
                self.o = 's';
                break;
            case 's':
                self.o = 'w';
                break;
            case 'w':
                self.o = 'n';
                break;
            }
            self.ticked();
        };
        this.rl = function () {
            switch (self.o) {
            case 'n':
                self.o = 'w';
                break;
            case 'e':
                self.o = 'n';
                break;
            case 's':
                self.o = 'e';
                break;
            case 'w':
                self.o = 's';
                break;
            }
            self.ticked();
        };
    };

    // this function parses the input string so that we have useful names/parameters
    // to define the playfield and the robots for subsequent steps

    var parseInput = function (input) {

        //
        // task #1
        //
        // replace the 'parsed' var below to be the string 'command' parsed into an object we can pass to genworld();
        // genworld expects an input object in the form { 'bounds': [3, 8], 'robos': [{x: 2, y: 1, o: 'W', command: 'rlrlff'}]}
        // where bounds represents the top right corner of the plane and each robos object represents the
        // x,y coordinates of a robot and o is a string representing their orientation. a sample object is provided below
        //

        // jordans solution parser
        var parsed = _.chain(input)
            .split('\n')
            .toArray()
            .map(function (item, index, collection) {
                if (index === 0) {
                    var splitBounds = item.split(' ');
                    bounds = [parseInt(splitBounds[0], 10), parseInt(splitBounds[1], 10)];
                    return {
                        bounds: bounds
                    };
                } else if (index % 2 === 0) {
                    var prev = collection[index - 1].trim()
                        .split(' ');
                    return {
                        x: parseInt(prev[0], 10),
                        y: parseInt(prev[1], 10),
                        o: prev[2],
                        command: item.trim()
                    };
                }
            })
            .filter(undefined)
            .reduce(function (aggregate, item) {
                if (item.bounds) {
                    aggregate.bounds = item.bounds;
                    return aggregate;
                }
                aggregate.robos.push(new Robo(item));
                return aggregate;
            }, {
                robos: []
            })
            .value();
        return parsed;
    };

    // this function replaces teh robos after they complete one instruction
    // from their commandset

    var tickRobos = function (robos) {
        //
        // task #2
        //
        // in this function, write business logic to move robots around the playfield
        // the 'robos' input is an array of objects; each object has 4 parameters.
        // This function needs to edit each robot in the array so that its x/y coordinates
        // and orientation parameters match the robot state after 1 command has been completed.
        // Also, you need to remove the command the robot just completed from the command list.
        // example input:
        //
        // robos[0] = {x: 2, y: 2, o: 'N', command: 'frlrlrl'}
        //                   |- becomes -|
        // robos[0] = {x: 2, y: 1, o: 'N', command: 'rlrlrl'}
        //
        // if a robot leaves the bounds of the playfield, it should be removed from the robos
        // array. It should leave a 'scent' in it's place. If another robot–for the duration
        // of its commandset–encounters this 'scent', it should refuse any commands that would
        // cause it to leave the playfield.

        // !== write robot logic here ==!

        // jordan solution robo state mutation
        var state = _.chain(robos)
            .reduce(function (aggregate, robo) {
                var command = _.head(robo.command);
                if (boundsCheck(robo)) {
                    // won't cause lost robo
                    performCommand(robo, command);
                } else if (_.filter(ghosts, {
                        x: robo.x,
                        y: robo.y
                    })
                    .length > 0) {
                    // sniffer mode

                    // remove top command from stack
                    robo.ticked();
                } else {
                    // this robo is definitely dead
                    aggregate.ghosts.push(new Ghost(robo));
                    return aggregate;
                }
                aggregate.robos.push(robo);
                return aggregate;
            }, {
                robos: [],
                ghosts: []
            })
            .value();
        ghosts = ghosts.concat(state.ghosts);
        // return the mutated robos object from the input
        return state.robos;
    };
    // mission summary function
    var missionSummary = function (robos) {
        // task #3
        // summarize the mission and inject the results into the DOM elements referenced in readme.md

        // jordans solution dom manip
        var roboList = document.createDocumentFragment();
        robos.forEach(function (item) {
            iter(item, roboList);
        });

        var ghostList = document.createDocumentFragment();
        ghosts.forEach(function (item) {
            iter(item, ghostList);
        });
        document.getElementById('robots')
            .appendChild(roboList);
        document.getElementById('lostRobots')
            .appendChild(ghostList);
    };

    // leave this alone please
    window.rover = {
        parse: parseInput,
        tick: tickRobos,
        summary: missionSummary,
        command: command
    };
};
