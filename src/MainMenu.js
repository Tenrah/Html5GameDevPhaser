
BasicGame.MainMenu = function (game) {

	//this.music = null;
	//this.playButton = null;
        this.game = game;
};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		//this.add.sprite(0, 0, 'titlepage');

		//this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');
                //this.stage.setBackgroundColor('#ffffff'); // white background for Menu
                this.add.sprite(0,0, 'logoScreen');
                
                this.startGameText = this.game.add.text(30, 490, 'Click to start playing', 
                    {fontSize: '20px', fill: '#fff'});
                this.helpText = this.game.add.text(550, 500, 
                    'Controls: \'Esc to pause\' \n Movement: Arrow keys (WASD) \n Rotation: Mouse \n Fire: Mouse Left Button \n Change firemode: Shift', 
                    {fontSize: '12px', fill: '#fff'});
                this.todoText = this.game.add.text(30, 520, 
                    'TODO: \n !Strafing not implemented yet! \n !Turret or Boss spawning not implemented yet! \n !Known BUG: need to reload page to play again!', 
                    {fontSize: '12px', fill: '#fff'});
           
	},

	update: function () {

		//	Do some nice funky main menu effect here
                if(this.input.activePointer.isDown) {
                    this.startGame();
                }
	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
