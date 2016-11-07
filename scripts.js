function Counter(color,x,y,index,playIndex){
    this.color = color,
    this.index = index,
    this.x = x,
    this.y = y,
    this.playOrder = playIndex   
}
function Cell(x,y,index,content){
    this.index = index,
    this.x = x,
    this.y = y,
    this.content = content
}
function Player(color){
    this.color = color,
    this.index = 0,
    this.lines = 0,
    this.maxLength = 0
}

//setup inital game state
var game = {
    playIndex: 0,
    yellowIndex: 0,
    currentPlayer: 0,
    players:[],
    cells: [],
    totalX: 7,
    totalY: 7,
    //setup function to iterate turns and switch player. 
    nextPlayer: function(currentPlayer){
        if (this.currentPlayer == 0){
            this.currentPlayer = 1;
        } else {
            this.currentPlayer = 0;
        }
        this.playIndex ++;
    },
    //setup function to build game
    buildGrid: function() {
        var grid = "<div class='row'>";
        for (var i=0;i <= game.cells.length-1; i++){         
            if (game.cells[i].x == game.totalX){
                grid += "<div onclick='game.dropCounter("+game.cells[i].index+")' class='cell' id=cell_" + game.cells[i].index +"></div></div><div class='row'>"
            } else {
                grid += "<div onclick='game.dropCounter("+game.cells[i].index+")' class='cell' id=cell_" + game.cells[i].index +"></div>"
            };
        };
        grid = grid.slice(0,grid.lastIndexOf("<div class='row'>")); //remove last unneeded row
        document.getElementById("container").innerHTML = grid; //render grid to container
        
        
        
    },
    buildPlayers: function() {
        game.players.push(new Player("yellow"));
        game.players.push(new Player("red"));
    },
    //update score
    score: function() { 
        document.getElementById("player_one_turn").innerHTML =+ game.players[0].index; 
        document.getElementById("player_one_longest").innerHTML =+ game.players[0].maxLength; 
        
        document.getElementById("player_two_turn").innerHTML =+ game.players[1].index; 
        document.getElementById("player_two_longest").innerHTML =+ game.players[1].maxLength;
    },
    //setup function to drop counter
    dropCounter: function(index){
        if (game.cells[index-1].content == null) {
            
            var animationArray = []

            //drop counter untill out of bounds or hit existing counter
            while (game.cells[index-1] != undefined && game.cells[index-1].content == null){
                document.getElementById("cell_"+index).className = document.getElementById("cell_"+index).className.replace("yellow_animate","");
                document.getElementById("cell_"+index).className = document.getElementById("cell_"+index).className.replace("red_animate",""); 
                index = index + game.totalX;
                animationArray.push(index); 
            }
            index = index - game.totalX; //revert back up last empty space. 
            animationArray.splice(-2,2); //remove last animation frame. 
            //animationArray.reverse();
            for(var i=0;i<animationArray.length;i++){
                if(game.players[game.currentPlayer].color == "yellow"){
                    document.getElementById("cell_"+animationArray[i]).className += " yellow_animate";
                } else {
                    document.getElementById("cell_"+animationArray[i]).className += " red_animate";
                }
            }
            //create new counter
            game.playIndex ++;
            game.cells[index-1].content = new Counter(game.currentPlayer,game.cells[index-1].x,game.cells[index-1].y,index,game.playIndex);

            //add class to ui
            document.getElementById("cell_"+index).className += " " + game.players[game.currentPlayer].color;
            game.players[game.currentPlayer].index += 1;

            //end turn
            this.winTest(game.cells[index-1].content);
            this.score();
            this.nextPlayer();
        }
    },
    winTest : function(obj){
        
        var transitions = [[game.totalX,"vert"],[1,"horr"],[game.totalX+1,"diag1"],[game.totalX-1,"diag2"]]
   
   
        for(var i=0; i<transitions.length; i++){
            var orgObj = obj;
            //check verticle
            var currentLine = [];
            var currentObj = obj //set current obj
            currentLine.push(currentObj) //add current position to line
            //check + direction
            while (this.checkAdjacent(currentObj,transitions[i][0]-1,obj.color,transitions[i][1]) != false){
                currentLine.push(this.checkAdjacent(currentObj,transitions[i][0]-1,obj.color,transitions[i][1])); 
                currentObj = this.checkAdjacent(currentObj,transitions[i][0]-1,obj.color,transitions[i][1]);  
            }
            //reset to orignal counter & check - direction
            currentObj = orgObj
            while (this.checkAdjacent(currentObj,-transitions[i][0]-1,obj.color,transitions[i][1]) != false){
                currentLine.push(this.checkAdjacent(currentObj,-transitions[i][0]-1,obj.color,transitions[i][1])); 
                currentObj = this.checkAdjacent(currentObj,-transitions[i][0]-1,obj.color,transitions[i][1]);  
            }
            
            //update maxLength
            if(currentLine.length > game.players[game.currentPlayer].maxLength){
                game.players[game.currentPlayer].maxLength = currentLine.length;
            }
            
            //test for win
            if (currentLine.length >= 4){
                for(var i = 0; i < currentLine.length; i++){
                    document.getElementById("cell_"+currentLine[i].index).className += " "+game.players[game.currentPlayer].color + "_win";
                }
                alert(game.players[game.currentPlayer].color + " Wins!")
            }    
            
        }
    },
    checkAdjacent : function(currentObj,transition,color,dir){
        var i = currentObj.index+transition;
        var newObj = game.cells[i];
        if (dir == "vert"){    
            if(newObj !== undefined){ //test if beyond game area
                if (newObj.content != null){ //test if has counter
                    if (newObj.content.color == color){ //test counter colour
                        return game.cells[i].content;    
                    }
                }
            }
        } else if (dir == "horr"){
            if(newObj !== undefined){ //test if beyond game area
                if (newObj.content != null){ //test if has counter
                    if (newObj.content.y === currentObj.y) { // test horrizontal
                        if (game.cells[i].content.color == color){ //test counter colour
                            return game.cells[i].content;    
                        }
                    }
                }
            }
        } else if (dir == "diag1" || dir == "diag2" ){
            if(newObj !== undefined){ //test if beyond game area
                if (newObj.content != null){ //test if has counter
                    if (newObj.content.y != currentObj.y) { /// test diag in not wrapping
                        if (game.cells[i].content.color == color){ //test counter colour
                            return game.cells[i].content;    
                        }
                    }
                }
            }
        }
        return false;
    } 
}

//create cell objetcs.
var currentRow = 1;
for (var i=1;i<=(game.totalX*game.totalY);i++) {
    var currentCol = i%game.totalX;
    if (currentCol == "0") {
        currentCol = game.totalX;
        game.cells.push(new Cell(currentCol,currentRow,i,null));
        currentRow ++;
    } else {
        game.cells.push(new Cell(currentCol,currentRow,i,null));
    }
}
game.buildPlayers();
game.buildGrid();
