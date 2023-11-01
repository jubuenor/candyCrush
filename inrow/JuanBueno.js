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
        this.limit = 0;
        
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

        if(this.node_count>=this.limit) return alpha;

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
        if(time>10000) this.limit = time*10;
        else if(time>5000) this.limit = time*5;
        else this.limit = time*2;

        if(this.size<=10) this.limit = this.limit;
        else if(this.size<=15) this.limit = this.limit/(this.size-10);
        else if(this.size<=25) this.limit = this.limit/(this.size-5);
        else this.limit = this.limit/(this.size*this.time);


        this.limit = Math.floor(( this.limit+100)/(this.k-3))+1;
        if(isNaN(this.limit)) this.limit = 100;
        //console.log(this.limit)

        let boardClone = this.board.clone(board);
        this.reset();

        this.moves = board.reduce((a,b)=>a.concat(b)).filter(x=>x!=' ').length; 

        //console.log(this.moves)
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