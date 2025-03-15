let selectedCharacter = '';

let specialItems;
let specialItemsCount = 0;
let maxSpecialItems = 3;

function startGame() {
    let playerNameInput = document.getElementById("playerName");
    let playerName = playerNameInput.value.trim();

    if (playerName.length < 4 || playerName.length > 8 || !/^[A-Za-z_]+$/.test(playerName)) {
        Swal.fire({
            title: "Nombre inválido",
            text: "El nombre debe tener entre 4 y 8 caracteres, solo letras y guion bajo (_).",
            icon: "error",
            background: "#1a1a1a",
            color: "#ffffff",
            confirmButtonColor: "#ff0080",
            customClass: {
                popup: "neon-alert",
                title: "neon-title",
                confirmButton: "neon-confirm-button",
            }
        });
        return;
    }

    let dropZone = document.getElementById("dropZone");
    let selectedCharacterElement = dropZone.querySelector("img");

    if (!selectedCharacterElement) {
        Swal.fire({
            title: "¡Debes seleccionar un personaje!",
            text: "Arrastra un personaje a la zona antes de comenzar.",
            icon: "warning",
            background: "#1a1a1a",
            color: "#ffffff",
            confirmButtonColor: "#ff0080",
            customClass: {
                popup: "neon-alert",
                title: "neon-title",
                confirmButton: "neon-confirm-button",
            }
        });
        return;
    }

    selectedCharacter = selectedCharacterElement.id;

    if (selectedCharacter !== "character1" && selectedCharacter !== "character2") {
        console.error("Personaje no válido:", selectedCharacter);
    }

    console.log("Nombre del jugador:", playerName);
    console.log("Personaje seleccionado:", selectedCharacter);

    document.getElementById("character-selection").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";

    localStorage.setItem("selectedCharacter", selectedCharacter);
    console.log("Guardado en localStorage:", selectedCharacter);
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("playerScore", 0);

    console.log("El juego ha comenzado");
    initGame();
}


function confirmExit() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "No se guardará tu progreso en el juego.",
        icon: "warning",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#ff0080",
        cancelButtonColor: "#3085d6",
        customClass: {
            popup: "neon-alert",
            title: "neon-title",
            confirmButton: "neon-confirm-button",
        },
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            window.open('', '_self', '');
            window.close();
        }
    });
}


function initGame() {
    var config = {
        type: Phaser.AUTO,
        width: 1200,
        height: 720,
        parent: 'gameCanvas',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var player;
    var stars;
    var bombs;
    var platforms;
    var lives = 3;
    var livesText;
    var cursors;
    var score = 0;
    var gameOver = false;
    var scoreText;
    var playerInvincible = false;

    var backgrounds = [];
    var lastDirection = 'right';

    var game = new Phaser.Game(config);

    function preload() {
        this.load.image('ground', 'assets/ground.png');
        this.load.image('platform', 'assets/platform.png');

        //Preload de las 6 capas del fondo
        this.load.image('bg1', 'assets/background/1.png');
        this.load.image('bg2', 'assets/background/2.png');
        this.load.image('bg3', 'assets/background/3.png');
        this.load.image('bg4', 'assets/background/4.png');
        this.load.image('bg5', 'assets/background/5.png');
        this.load.image('bg6', 'assets/background/6.png');

        if (selectedCharacter === "character1") {
            //Persoanje 1:
            this.load.spritesheet('chara1_r', 'assets/chara1_r.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara1_l', 'assets/chara1_l.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara1_r_idle', 'assets/chara1_r_idle.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara1_l_idle', 'assets/chara1_l_idle.png', { frameWidth: 48, frameHeight: 48 })
        } else if (selectedCharacter === "character2") {
            //Personaje 2:
            this.load.spritesheet('chara2_r', 'assets/chara2_r.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara2_l', 'assets/chara2_l.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara2_r_idle', 'assets/chara2_r_idle.png', { frameWidth: 48, frameHeight: 48 })
            this.load.spritesheet('chara2_l_idle', 'assets/chara2_l_idle.png', { frameWidth: 48, frameHeight: 48 })
        } else {
            console.error("Personaje no válido:", selectedCharacter);
        }

        this.load.spritesheet('star1', 'assets/coin.png', { frameWidth: 16, frameHeight: 16 })

        this.load.spritesheet('bomb1', 'assets/bomb_on.png', { frameWidth: 52, frameHeight: 25 })
        this.load.spritesheet('explocion', 'assets/explocion.png', { frameWidth: 52, frameHeight: 56 })

        this.load.image('heart', 'assets/heart.png');
        this.load.image('gameOverImage', 'assets/imagen .png');

        this.load.image('special', 'assets/special.png');

        this.load.audio('collect', 'assets/audio/retro-coin-1-236677.mp3');
        this.load.audio('special', 'assets/audio/yay2-86405.mp3');
        this.load.audio('hit', 'assets/audio/ouch-43811.mp3');
        this.load.audio('collisionSound', 'assets/audio/boing-2-44164.mp3');
        this.load.audio('bombBounce', 'assets/audio/bounce.mp3');
        this.load.audio('starLand', 'assets/audio/land.mp3');
    }

    function create() {
        specialItems = this.physics.add.group();
        lives = 3;
        score = 0;
        this.level = 1;
        collectedStars = 0;
        specialItemsCount = 0;
        this.timerTexts = this.add.group();

        function showDate() {
            let playerName = localStorage.getItem("playerName") || "Jugador";

            let currentDate = new Date();
            let formattedDate = currentDate.toLocaleDateString();
            let formattedTime = currentDate.toLocaleTimeString();

            let dateTimeString = `${formattedDate} ${formattedTime}`;

            const uniformColor = '#000000';

            // Fecha
            this.add.text(60, 20, dateTimeString, {
                fontSize: '18px',
                fill: uniformColor,
                fontFamily: 'Arial',
                fontStyle: 'italic'
            });

            // Nombre del jugador
            this.add.text(60, 50, `Jugador: ${playerName}`, {
                fontSize: '18px',
                fill: uniformColor,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });

            // Puntaje
            scoreText = this.add.text(60, 90, 'Score: 0', {
                fontSize: '18px',
                fill: uniformColor,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });

            // Nivel
            levelText = this.add.text(60, 130, 'Nivel: 1', {
                fontSize: '18px',
                fill: uniformColor,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });


            console.log("Nombre mostrado:", playerName);
        }


        this.collisionSound = this.sound.add('collisionSound');


        this.collectSound = this.sound.add('collect', { volume: 0.5 });
        this.specialSound = this.sound.add('special', { volume: 0.5 });
        this.hitSound = this.sound.add('hit', { volume: 0.5 });

        livesText = this.add.text(16, 48, 'Vidas: ' + lives, { fontSize: '32px', fill: '#000' });

        let speedFactors = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
        for (let i = 1; i < 6; i++) {
            let bg = this.add.image(window.innerWidth / 2, window.innerHeight / 2, `bg${i}`)
                .setDisplaySize(window.innerWidth, window.innerHeight)
                .setScrollFactor(0);

            bg.speedFactor = speedFactors[i];
            backgrounds.push(bg);
        }


        platforms = this.physics.add.staticGroup();
        // Plataforma central en la parte inferior (más alejada del suelo)
        platforms.create(600, 670, 'platform').setScale(3).refreshBody();  // Plataforma grande al centro

        platforms.create(400, 500, 'ground').setScale(0.8).refreshBody();  // Plataforma izquierda intermedia
        platforms.create(600, 500, 'ground').setScale(0.8).refreshBody();  // Plataforma central intermedia
        platforms.create(800, 500, 'ground').setScale(0.8).refreshBody();  // Plataforma derecha intermedia

        platforms.create(300, 350, 'ground').setScale(0.8).refreshBody();  // Plataforma izquierda alta
        platforms.create(600, 350, 'ground').setScale(0.8).refreshBody();  // Plataforma central alta
        platforms.create(900, 350, 'ground').setScale(0.8).refreshBody();  // Plataforma derecha alta

        platforms.create(600, 250, 'ground').setScale(0.5).refreshBody();  // Plataforma pequeña central superior

        platforms.create(200, 200, 'ground').setScale(0.5).refreshBody();  // Plataforma pequeña izquierda
        platforms.create(1000, 200, 'ground').setScale(0.5).refreshBody(); // Plataforma pequeña derecha

        platforms.create(600, 950, 'ground').setScale(1.0).refreshBody();  // Plataforma base central
        platforms.create(1200, 950, 'ground').setScale(1.0).refreshBody(); // Plataforma base derecha

        platforms.create(400, 750, 'ground').setScale(0.7).refreshBody();  // Plataforma izquierda intermedia
        platforms.create(800, 750, 'ground').setScale(0.7).refreshBody();  // Plataforma derecha intermedia

        this.anims.create({
            key: 'star_anim',
            frames: this.anims.generateFrameNumbers('star1', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'bomb_anim',
            frames: this.anims.generateFrameNumbers('bomb1', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNumbers('explocion', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        if (selectedCharacter === "character1") {
            //Character 1
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('chara1_l', [5, 4, 3, 2, 1, 0]),
                frameRate: 5,
                repeat: -1,
            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('chara1_r', { start: 0, end: 5 }), //Animacionde Right Walk
                frameRate: 5,
                repeat: -1
            });

            this.anims.create({
                key: 'idle_right',
                frames: this.anims.generateFrameNumbers('chara1_r_idle', { start: 0, end: 5 }), // Ajusta los frames según tu spritesheet
                frameRate: 5, // Velocidad de la animación
                repeat: -1 // Bucle infinito
            });

            this.anims.create({
                key: 'idle_left',
                frames: this.anims.generateFrameNumbers('chara1_l_idle', [5, 4, 3, 2, 1, 0]), // Ajusta los frames según tu spritesheet
                frameRate: 5, // Velocidad de la animación
                repeat: -1 // Bucle infinito
            });
        } else if (selectedCharacter === "character2") {
            //Character 2
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('chara2_l', [5, 4, 3, 2, 1, 0]),
                frameRate: 5,
                repeat: -1,

            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('chara2_r', { start: 0, end: 5 }), //Animacionde Right Walk
                frameRate: 5,
                repeat: -1
            });

            this.anims.create({
                key: 'idle_right',
                frames: this.anims.generateFrameNumbers('chara2_r_idle', { start: 0, end: 5 }), // Ajusta los frames según tu spritesheet
                frameRate: 5, // Velocidad de la animación
                repeat: -1 // Bucle infinito
            });

            this.anims.create({
                key: 'idle_left',
                frames: this.anims.generateFrameNumbers('chara2_l_idle', [5, 4, 3, 2, 1, 0]), // Ajusta los frames según tu spritesheet
                frameRate: 5, // Velocidad de la animación
                repeat: -1 // Bucle infinito
            });
        }
        // Iniciar con la animación de reposo hacia la derecha
        if (selectedCharacter === "character1") {
            // Crea el sprite con el spritesheet de character1
            player = this.physics.add.sprite(600, 360, 'chara1_r_idle');
            // Reproduce la animación de reposo de character1
            player.anims.play('idle_right', true);
        } else if (selectedCharacter === "character2") {
            // Crea el sprite con el spritesheet de character2
            player = this.physics.add.sprite(600, 360, 'chara2_r_idle');
            // Reproduce la animación de reposo de character2
            player.anims.play('idle_right', true);
        }

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        cursors = this.input.keyboard.createCursorKeys();

        stars = this.physics.add.group({
            key: 'star1',
            repeat: Math.floor(1200 / 70) - 1,
            setXY: { x: 1200 * 0.05, y: 0, stepX: 1200 * 0.05 } // Ajusta la separación según el ancho de 1200
        });


        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            child.play('star_anim');
        });

        bombs = this.physics.add.group();

        hearts = [];
        const screenWidth = 1200;
        const screenHeight = 760;
        const iconPadding = 70;
        const heartY = 50;

        for (let i = 0; i < 3; i++) {
            let heart = this.add.image(screenWidth - iconPadding - (i * 40), heartY, 'heart').setScrollFactor(0);
            heart.setScale(0.09);
            hearts.push(heart);
        }



        showDate.call(this)


        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(specialItems, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);
        this.physics.add.overlap(player, specialItems, collectSpecialItem, null, this);
        this.physics.add.collider(player, bombs, hitBomb, null, this);
    }

    function updateLevels() {
        let bombCount = this.bombs ? this.bombs.getChildren().length : 0; // Verifica si hay bombas
        console.log("Número de bombas:", bombCount);
        console.log("Puntuación actual:", score);
        console.log("Estrellas recolectadas:", collectedStars);

        if (bombCount >= 6 || collectedStars >= 34) {
            this.level = 3; // Pasa a nivel 3 si hay 6 bombas o 17 estrellas
        } else if (score >= 170) {
            this.level = 2; // Pasa a nivel 2 si la puntuación es 170 o más
        } else {
            this.level = 1; // Se mantiene en nivel 1
        }

        levelText.setText(`Nivel: ${this.level}`); // Actualiza el nivel en pantalla
        console.log("Nivel actualizado:", this.level);
    }

    function update() {
        if (gameOver) return;
        if (gameOver || gameWon) return;  // Evita que el juego continúe después de ganar o perder


        checkVictory.call(this);  // Verifica si el jugador ha ganado

        if (gameWon) {
            showVictoryMenu.call(this);  // Muestra la pantalla de victoria
        }

        let moveSpeed = 160;
        let minX = -100;
        let maxX = 100;

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
            backgrounds.forEach(bg => {
                if (bg.x < window.innerWidth / 2 + maxX) {
                    bg.x += bg.speedFactor * moveSpeed * 0.002;
                }
            });
            lastDirection = 'left';
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
            backgrounds.forEach(bg => {
                if (bg.x > window.innerWidth / 2 + minX) {
                    bg.x -= bg.speedFactor * moveSpeed * 0.002;
                }
            });
            lastDirection = 'right';
        } else {
            player.setVelocityX(0);
            if (lastDirection === 'left') {
                player.anims.play('idle_left', true);
            } else {
                player.anims.play('idle_right', true);
            }
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }

        specialItems.children.iterate(function (child) {
            child.angle += 1;
        });

        specialItems.children.iterate(function (child) {
            if (child.x < 0 || child.x > window.innerWidth) {
                child.setVelocityX(child.body.velocity.x * -1);
            }
        });
    }

    function generateSpecialItems() {
        if (specialItemsCount < maxSpecialItems) {
            let x = Phaser.Math.Between(100, 1200 - 100);
            let y = Phaser.Math.Between(50, 720 - 100);
    
            let specialItem = specialItems.create(x, y, 'special');
            specialItem.setScale(0.5);
            specialItem.setVelocityX(Phaser.Math.Between(-100, 100));
            specialItem.setVelocityY(Phaser.Math.Between(-50, 50));
            specialItem.setBounce(0.2);
            specialItem.setCollideWorldBounds(true);
            specialItemsCount++;
    
            let duration = 5000;
            let startTime = specialItem.scene.time.now;  // Tiempo actual
    
            // Crear el texto del temporizador y asignarlo al ítem
            specialItem.timerText = specialItem.scene.add.text(x, y - 20, '5', {
                fontSize: '20px',
                fill: '#FF0000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
    
            specialItem.updateTimer = specialItem.scene.time.addEvent({
                delay: 100,
                callback: () => {
                    let elapsed = specialItem.scene.time.now - startTime;
                    let remaining = Math.max(0, (duration - elapsed) / 1000).toFixed(1);
                    specialItem.timerText.setText(remaining);
                    specialItem.timerText.setPosition(specialItem.x, specialItem.y - 20);
                },
                loop: true
            });
    
            // Desactivar el ítem después de 5 segundos, sin generar otro al instante
            specialItem.timer = setTimeout(() => {
                // Detener la actualización del temporizador
                specialItem.updateTimer.remove();
    
                // Eliminar el ítem y el texto
                specialItem.disableBody(true, true);
                specialItem.timerText.destroy();
                specialItemsCount--;
            }, 5000);
        }
    }
    
    function collectSpecialItem(player, specialItem) {
        if (specialItem.timer) {
            clearTimeout(specialItem.timer);
        }
    
        if (specialItem.timerText) {
            specialItem.timerText.destroy();
        }
    
        specialItem.disableBody(true, true);
    
        score += 30;
        scoreText.setText('Score: ' + score);
    
        if (this.specialSound) {
            this.specialSound.play();
        }
    
        if (specialItems.countActive(true) === 0) {
            generateSpecialItems();
        }
    }
    

    function collectStar(player, star) {
        collectedStars++;
        updateLevels();
        star.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);

        if (this.collectSound) {
            this.collectSound.play();
        }

        if (stars.countActive(true) === 0) {
            if (lives > 0) {
                generateSpecialItems();
                stars.children.iterate(child => {
                    child.enableBody(true, child.x, 0, true, true);
                });

                for (let i = 0; i < 3; i++) {
                    var x = Phaser.Math.Between(100, window.innerWidth - 100);
                    var bomb = bombs.create(x, 16, 'bomb1');
                    bomb.play('bomb_anim'); // <-- Mantener esta línea
                    bomb.setBounce(1);
                    bomb.setCollideWorldBounds(true);
                    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                    bomb.allowGravity = false;
                }
            } else {
                gameOver = true;
                livesText.setText('GAME OVER');
                this.physics.pause();
                player.setTint(0xff0000);
                player.anims.play('turn');
            }
        }

        updateLevels.call(this);
    }

    function hitBomb(player, bomb) {
        if (playerInvincible) return;

        bomb.disableBody(true, true);

        let explosion = bombs.create(bomb.x, bomb.y, 'explocion');
        explosion.play('explosion_anim');
        explosion.setOrigin(0.5);

        explosion.once('animationcomplete', () => {
            explosion.disableBody(true, true);
            let newBomb = bombs.create(bomb.x, 16, 'bomb1');
            newBomb.play('bomb_anim');
            newBomb.setBounce(1);
            newBomb.setCollideWorldBounds(true);
            newBomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            newBomb.allowGravity = false;
        });

        if (lives > 1) {
            playerInvincible = true;

            lives--;
            livesText.setText('Vidas: ' + lives);

            if (this.hitSound) {
                this.hitSound.play();
            }

            hearts[lives].setScale(0);
            player.setTint(0xff0000);
            player.anims.play('turn');

            this.time.delayedCall(1000, () => {
                player.clearTint();
                playerInvincible = false;
            });
        } else {
            lives--;
            livesText.setText('GAME OVER');
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            showGameOverMenu.call(this);
            saveGameData();
        }
    }

    function showGameOverMenu() {
        const { width, height } = this.sys.game.config;

        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.8)');

        let gameOverImage = this.add.image(width / 2, height / 2 - 200, 'gameOverImage').setOrigin(0.5).setScale(0.5);
        gameOverImage.setTexture('gameOverImage');

        let gameOverText = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '80px',
            color: '#ff4081',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff4081',
                blur: 20,
                fill: true
            }
        }).setOrigin(0.5);

        let returnToMenuButton = this.add.text(width / 2, height / 2 + 50, 'Regresar al Inicio', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '40px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff0000',
                blur: 15,
                fill: true
            }
        }).setOrigin(0.5).setInteractive();

        returnToMenuButton.on('pointerdown', function () {
            window.location.href = 'menu.html';
        }, this);

        returnToMenuButton.on('pointerover', function () {
            returnToMenuButton.setColor('#ffffff');
            returnToMenuButton.setScale(1.1);
        });
        returnToMenuButton.on('pointerout', function () {
            returnToMenuButton.setColor('#ff0000');
            returnToMenuButton.setScale(1);
        });
    }

    function saveGameData() {
        let playerName = localStorage.getItem("playerName") || "Jugador";
        let playerScore = score;
        let currentDate = new Date().toLocaleString();

        let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

        // Buscar registro existente con el mismo nombre
        const existingEntryIndex = gameHistory.findIndex(entry =>
            entry.name.toLowerCase() === playerName.toLowerCase()
        );

        if (existingEntryIndex !== -1) {
            // Si existe, comparar puntuaciones
            if (playerScore > gameHistory[existingEntryIndex].score) {
                // Actualizar si el nuevo score es mayor
                gameHistory[existingEntryIndex].score = playerScore;
                gameHistory[existingEntryIndex].date = currentDate;
            }
        } else {
            // Agregar nuevo registro si no existe
            gameHistory.push({
                name: playerName,
                score: playerScore,
                date: currentDate
            });
        }

        // Ordenar por puntuación descendente
        gameHistory.sort((a, b) => b.score - a.score);

        // Mantener solo el mejor registro por jugador
        const uniqueEntries = [];
        const seenNames = new Set();
        for (const entry of gameHistory) {
            const lowerName = entry.name.toLowerCase();
            if (!seenNames.has(lowerName)) {
                seenNames.add(lowerName);
                uniqueEntries.push(entry);
            }
        }

        localStorage.setItem("gameHistory", JSON.stringify(uniqueEntries));
        localStorage.setItem("playerScore", playerScore);

        console.log("📜 Historial actualizado:", uniqueEntries);
    }

    let gameWon = false;

    function checkVictory() {
        if (this.level === 4 || collectedStars >= 51) {
            gameWon = true;
        }
    }

    function showVictoryMenu() {
        const { width, height } = this.sys.game.config;
        const playerName = localStorage.getItem("playerName") || "Jugador"; 

        this.physics.pause();
        this.input.keyboard.enabled = false;

        this.cameras.main.setBackgroundColor('rgba(0, 255, 0, 0.8)');

        this.add.text(width / 2, height / 2 - 50, `¡VICTORIA!, ${playerName}!`, {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '80px',
            color: '#4CAF50',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 0, color: '#4CAF50', blur: 20, fill: true }
        }).setOrigin(0.5);
        let extraMessage = this.add.text(width / 2, height / 2 + 10, '¡Nos vemos en la siguiente partida! 🎮', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '40px',
            color: '#ffffff',
            fontStyle: 'italic',
            stroke: '#000',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffffff',
                blur: 15,
                fill: true
            }
        }).setOrigin(0.5);

        // Botón para regresar al menú
        let returnToMenuButton = this.add.text(width / 2, height / 2 + 80, 'Regresar al Inicio', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '40px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 15, fill: true }
        }).setOrigin(0.5).setInteractive();

        // Evento para regresar al menú
        returnToMenuButton.on('pointerdown', () => {
            window.location.href = 'menu.html';
        });

        // Efecto al pasar el mouse sobre el botón
        returnToMenuButton.on('pointerover', function () {
            returnToMenuButton.setColor('#ffffff');
            returnToMenuButton.setScale(1.1);
        });

        returnToMenuButton.on('pointerout', function () {
            returnToMenuButton.setColor('#ff0000');
            returnToMenuButton.setScale(1);
        });

        saveGameData();
    }



}