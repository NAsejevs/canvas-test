import React from 'react';

class App extends React.Component {
	private canvasRef: HTMLCanvasElement | null = null;
	private canvasContext: CanvasRenderingContext2D | null = null;
	private canvasAnimationFrame: number | null = null;
	private lastTime: number = 0;

	componentDidMount() {
		window.addEventListener("resize", () => {
			this.forceUpdate();
		});
	}

	componentWillUnmount() {
		if (this.canvasAnimationFrame) {
			window.cancelAnimationFrame(this.canvasAnimationFrame);
		}
	}

	render() {
		return (
			<div>
				<canvas
					width={window.innerWidth}
					height={window.innerHeight}
					ref={this.setCanvasRef}
				>

				</canvas>
			</div>
		)
	}

	setCanvasRef = (instance: HTMLCanvasElement | null) => {
		this.canvasRef = instance;

		if(this.canvasRef) {
			this.canvasContext = this.canvasRef.getContext("2d");
			this.lastTime = performance.now();
			this.canvasInit(this.canvasContext as CanvasRenderingContext2D, this.canvasRef);
			this.canvasLoop();
		}
	}

	canvasLoop = () => {
		if(!this.canvasContext || !this.canvasRef) {
			return;
		}
		
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.lastTime) / 1000;
		
		this.canvasRender(this.canvasContext, this.canvasRef, deltaTime);
		
		this.lastTime = currentTime;

		this.canvasAnimationFrame = window.requestAnimationFrame(() => {
			this.canvasLoop();
		});
	}

	private particleCount = 10;
	private particles: Array<Particle> = new Array<Particle>();

	canvasInit = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
		for(let i = 0; i < this.particleCount; i++) {
			this.particles[i] = new Particle(ctx, canvas);
			this.particles[i].init(ctx, canvas);
		}
		
		setInterval(() => {
			for(let i = 0; i < this.particleCount; i++) {
				this.particles[i] = new Particle(ctx, canvas);
				this.particles[i].init(ctx, canvas);
			}
		}, 2500);
	}

	canvasRender = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, deltaTime: number) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.font = "30px Arial";
		ctx.fillText("FPS: " + (1 / deltaTime).toFixed(1), 10, 50);


		ctx.save();

		for(let i = 0; i < this.particleCount; i++) {
			this.particles[i].render(ctx, canvas, deltaTime);
		}

		ctx.restore();
	}

}

class Vector2 {
	public x: number = 0;
	public y: number = 0;

	constructor(x: number, y:number) {
		this.x = x;
		this.y = y;
	}
}

class Particle {
	private position = new Vector2(0, 0);
	private velocity = new Vector2(1, -7);
	private maxVelocity = 15;
	private gravity = 20;
	private drag = new Vector2(0.97, 0.96);

	private initialGround = 0;
	private ground = 0;
	private direction = new Vector2(0, 0);

	private symbols = ["♥", "♦", "♠", "♣"];
	private symbol = "♥";

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private glowEffect = 0.0;
	private glowDirection = true;
	
	constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = ctx;
	}

	init(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		this.position = new Vector2(canvas.width / 2, canvas.height / 2);
		this.initialGround = this.position.y;

		this.direction.x = Math.random() < 0.5 ? -1 : 1;
		this.direction.y = this.getRandomArbitrary(-1, 1);

		this.velocity = new Vector2(
			this.direction.x * this.getRandomArbitrary(2, 5),
			-7 * this.getRandomArbitrary(0.5, 2)
		);
		this.symbol = this.symbols[Math.round(this.getRandomArbitrary(0, 3))];

		this.glowEffect = Math.random();
	}
	
	render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, deltaTime: number) {
		this.velocity.y += this.gravity * deltaTime;


		if(this.velocity.x) {
			this.velocity.x *= this.drag.x;
			this.velocity.x = Math.min(Math.max(this.velocity.x, -this.maxVelocity), this.maxVelocity);
		}

		if(this.velocity.y) {
			this.velocity.y *= this.drag.y;
			this.velocity.y = Math.min(Math.max(this.velocity.y, -this.maxVelocity), this.maxVelocity);
		}

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		this.ground = this.initialGround + (((this.position.x - (canvas.width / 2))) * (this.direction.y));

		if(this.position.y > this.ground) {
			this.position.y = this.ground;
			this.velocity.y = -Math.abs(this.velocity.y) * 0.75;
		}

		if(this.glowDirection) {
			this.glowEffect += deltaTime / 2;

			if(this.glowEffect >= 1) {
				this.glowDirection = !this.glowDirection;
			}
		} else {
			this.glowEffect -= deltaTime / 2;

			if(this.glowEffect <= 0.25) {
				this.glowDirection = !this.glowDirection;
			}
		}

		ctx.save();

		var grd = ctx.createRadialGradient(
			this.position.x, 
			this.position.y - 10,
			1, 
			this.position.x, 
			this.position.y - 10,
			35
		);
		grd.addColorStop(0, `rgba(255, 255, 255, ${this.glowEffect * 0.1})`);
		grd.addColorStop(0.5, `rgba(255, 255, 255, 0)`);

		ctx.fillStyle = grd;
		ctx.fillRect(this.position.x - 50, this.position.y - 60, 100, 100);

		ctx.font = `${((this.ground - this.initialGround) / 15) + 30}px Arial`;
		ctx.fillStyle = `rgba(255, 255, 255, ${this.glowEffect})`;
		ctx.textAlign = "center";
		ctx.fillText(this.symbol, this.position.x, this.position.y);

		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(180 * Math.PI / 180);
		ctx.translate(-this.position.x, -this.position.y);
		ctx.font = `${((this.ground - this.initialGround) / 15) + 30}px Arial`;

		const gradient = ctx.createLinearGradient(
			this.position.x, 
			this.position.y - (this.position.y - this.ground), 
			this.position.x, 
			this.position.y - (this.position.y - this.ground) - (((this.ground - this.initialGround) / 15) + 30 / 2)
		);
		gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glowEffect * 0.25})`);
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

		ctx.fillStyle = gradient;
		ctx.textAlign = "center";
		ctx.fillText(this.symbol, this.position.x, this.position.y + (this.position.y - this.ground));

		ctx.restore();
	}

	getRandomArbitrary = (min: number, max: number) => {
		return Math.random() * (max - min) + min;
	}
}

export default App;
