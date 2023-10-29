class Agent{
    constructor(){

    }
    
    init(color, board, time=20000,k){
        this.color = color;
        this.time = time;
        this.size = board.length;
        this.board = new Board();
        this.k = k;
        this.moves = 0;
        this.node_count = 0;
        this.transposition_table = Array(this.size*this.size+1).fill({key:0, value:0});
        this.min_score=-(this.size*this.size)/2 + 3
        this.max_score=(this.size*this.size+1)/2 - 3 
    }

    getIndex(key){
        return (this.node_count+key)%(this.transposition_table.length);
    }

    setTranspositionTable(pos,score){
        if(pos >= this.transposition_table.length) return;
        let i = this.getIndex(pos);
        this.transposition_table[i] = {key:pos, value:score}; 
    }

    getTranspositionTable(pos){
        if(pos >= this.transposition_table.length) return 0; 
        let i = this.getIndex(pos);
        if(this.transposition_table[i].key == pos)
            return this.transposition_table[i].value;
        else
            return 0;
    }

    negamax(board, pos, alpha, beta){
        
        if(alpha>=beta) return alpha;
        let boardClone = this.board.clone(board);
        this.board.move(boardClone,pos,this.color);
        if(this.board.winner(boardClone, this.k) == this.color)
            return (this.size*this.size+1 - this.moves)/2;


        this.node_count++;

        if(this.node_count>=10000) return alpha;

        let nextMoves = this.getPossibleNonLosingMoves(board);

        if(nextMoves.length == 0)
            return -(this.size*this.size+1 - this.moves)/2;

        if(this.moves >= this.size*this.size-2) return 0;

        let min = -(this.size*this.size - 2 - this.moves)/2;

        if(alpha<min){
            alpha=min;
            if (alpha>=beta) return alpha;
        }
        
        let max = (this.size*this.size - 1 - this.moves)/2;
       
        let val= this.getTranspositionTable(pos);
        if(val!=0) max = val + this.min_score-1;

        if (beta>max){
            beta=max;
            if (alpha>=beta) return beta; 
        }

        nextMoves.sort((a,b) => Math.abs(this.size/2 - a) - Math.abs(this.size/2 - b));

        for(let i = 0; i<nextMoves.length; i++){
            let x=nextMoves[i];
            if(this.board.check(board,x)){
                let boardClone = this.board.clone(board);
                this.board.move(boardClone,x,this.color);
                let score = -this.negamax(boardClone, x , -beta, -alpha);
                if (score>=beta) return score;
                if (score>alpha) alpha=score;
            }
        }
        this.setTranspositionTable(pos, alpha - this.min_score + 1);
        return alpha; 
}

    getBestMove(scores){
        let max = -this.size*this.size/2;
        let min = this.size*this.size/2;
        let indexMax = 0;
        let indexMin = 0;
        for(let i = 0; i<scores.length; i++){
            if(scores[i]>max){
                max = scores[i];
                indexMax = i;
            }
            if(scores[i]<min){
                min = scores[i];
                indexMin = i;
            }
        }
        if(max<0)
            return indexMin;
        else
            return indexMax;
    }

    // Must return an integer representing the column to put a piece
    //                           column
    //                             | 

    reset(){
        this.transposition_table = Array(this.size*this.size).fill({key:0, value:0});
        this.node_count=0;
    }

    solve(board,x){
        let boardClone = this.board.clone(board);
        this.board.move(boardClone,x,this.color);
        if(this.board.winner(boardClone, this.k) == this.color)
            return (this.size*this.size+1 - this.moves)/2;

        let min = -this.size*this.size/2;
        let max = this.size*this.size/2;
        while(min<max){
            let med = min + Math.floor((max-min)/2);
            if(med<=0&&min/2<med)med = min/2;
            else if(med>=0&&max/2>med)med = max/2;
            let r = this.negamax(board,x,med,med+1);
            if (r<=med) max=r;
            else min=r;
        }
        return min
    }

    getPossibleNonLosingMoves(board){
        let possibleMoves = this.board.valid_moves(board);
        let nonLosingMoves = [];
        possibleMoves.map(x=>{
            let boardClone = this.board.clone(board);
            this.board.move(boardClone,x,this.color);
            if(this.board.winner(boardClone, this.k) != this.color)
                nonLosingMoves.push(x);
        })
        return nonLosingMoves;
    }

    compute( board, time ){ 

        let boardClone = this.board.clone(board);
        this.reset();

        this.moves = board.reduce((a,b)=>a.concat(b)).filter(x=>x!=' ').length; 

        console.log(this.moves)
        let possibleMoves = this.board.valid_moves(boardClone);
        
        possibleMoves.sort((a,b) => Math.abs(this.size/2 - a) - Math.abs(this.size/2 - b));
        let scores=[];
        //console.log(scores)

        for(let x = 0; x<possibleMoves.length; x++){ 
            let score = this.solve(boardClone,possibleMoves[x]);
            scores.push(score);
        }

        //console.log(this.color,possibleMoves,scores, possibleMoves[this.getBestMove(scores)]); 

        return possibleMoves[this.getBestMove(scores)];  
    }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board{
    constructor(){}

    // Initializes a board of the given size. A board is a matrix of size*size of characters ' ', 'B', or 'W'
    init(size){
        var board = []
        for(var i=0; i<size; i++){
            board[i] = []
            for(var j=0; j<size; j++)
                board[i][j] = ' '
        }
        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a piece can be set at column j 
    check(board, j){
        return (board[0][j]==' ')
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board){
        var moves = []
        var size = board.length
        for( var j=0; j<size; j++)
            if(this.check(board, j)) moves.push(j)
        return moves
    }

    // Computes the new board when a piece of 'color' is set at column 'j'
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, j, color){
        var size = board.length
        var i=size-1;
        while(i>=0 && board[i][j]!=' ') i--;
        if(i<0) return false;
        board[i][j] = color
        return true
    }

    // Determines the winner of the game if available 'W': white, 'B': black, ' ': none
    winner(board, k){
        //console.log(k)
        var size = board.length
        for( var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                var p = board[i][j]
                if(p!=' '){
                    if(j+k<=size && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j+h]==p) c++
                        if(c==k) return p
                    }
                    if(j+1>=k && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j-h]==p) c++
                        if(c==k) return p

                    }
                    if(j+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i][j+h]==p) c++
                        if(c==k) return p

                    }
                    if(i+k<=size){
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j]==p) c++
                            else break;
                        if(c==k) return p
                    }
                }
            }
        }      
        return ' '
    }

    // Draw the board on the canvas
    print(board){
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++)
                grid.push({"command":"translate", "y":i, "x":j, "commands":[{"command":"-"}, {"command":board[i][j]}]})
        }

	    var commands = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(commands)
    }
}

/*
 * Player's Code (Must inherit from Agent) 
 * This is an example of a rangom player agent
 */
class RandomPlayer extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        var moves = this.board.valid_moves(board)
        var index = Math.floor(moves.length * Math.random())
        //for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        //for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        console.log(this.color + ',' + moves[index])
        return moves[index]
    }
}

/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient{
	constructor(){ 
        super()
        this.board = new Board()
    }

    setPlayers(players){ this.players = players }

	// Initializes the game 
	init(){ 
        var white = Konekti.vc('W').value // Name of competitor with white pieces
        var black = Konekti.vc('B').value // Name of competitor with black pieces
        var time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        var k = parseInt(Konekti.vc('k').value) // k-pieces in row
        
        this.k = k
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = {'W':time, 'B':time}
        Konekti.vc('W_time').innerHTML = ''+time
        Konekti.vc('B_time').innerHTML = ''+time
        this.player = 'W'
        this.winner = ''

        this.players[white].init('W', b1, time)
        this.players[black].init('B', b2, time, k)
    }

    // Listen to play button 
	play(){ 
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'W'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
            else{
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='W'?'B':'W')+'_time').innerHTML = x.ptime[x.player=='W'?'B':'W']
                
                if(remaining <= 0) x.winner = (x.player=='W'?x.black:x.white) + ' since ' + (x.player=='W'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            var w = x.player=='W'
            var id = w?x.white:x.black
            var nid = w?x.black:x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var flag = board.move(x.rb, action, x.player)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                var winner = board.winner(x.rb, x.k)
                console.log(winner)
                if(winner!= ' ') x.winner = winner
                else{
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'B':'W'
                    }
                }    
            }

            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }

            ]},
        { 
            "command":"-", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0,1,1,0],
                    "y":[0,1,1,0,0]
                }
            ]
        },
        {
            "command":"B",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
            ]
        },  
        {
            "command":"W",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                },
            ]
        }
    ] 
}
