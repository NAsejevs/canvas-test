import React from 'react';
import image from "./Star.svg";

class App extends React.Component {
	private canvasRef: HTMLCanvasElement | null = null;
	private canvasContext: CanvasRenderingContext2D | null = null;
	private canvasAnimationFrame: number | null = null;
	private lastTime: number = 0;
	private particleRef: HTMLImageElement | null = null;

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
				<img style={{display: "none"}} src={image} ref={this.setParticleRef}/>
			</div>
		)
	}

	setParticleRef = (instance: HTMLImageElement | null) => {
		this.particleRef = instance;

		if(this.particleRef) {
			// this.particle.sprite = this.particleRef;
		}
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

		this.canvasAnimationFrame = window.requestAnimationFrame(() => {
			this.canvasLoop();
		});

		const currentTime = performance.now();
		const deltaTime = (currentTime - this.lastTime) / 1000;

		this.canvasRender(this.canvasContext, this.canvasRef, deltaTime);
		
		this.lastTime = currentTime;
	}

	private particles: Array<Particle> = new Array<Particle>();

	canvasInit = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
		for(let i = 0; i < 20; i++) {
			this.particles[i] = new Particle();
			this.particles[i].init(ctx, canvas);
			this.particles[i].direction = Math.random() * 360;
		}

	}

	canvasRender = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, deltaTime: number) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.font = "30px Arial";
		ctx.fillText("FPS: " + (1 / deltaTime).toFixed(1), 10, 50);

		
		ctx.save();

		for(let i = 0; i < 20; i++) {
			this.particles[i].sprite = this.particleRef;
			this.particles[i].render(ctx, canvas, deltaTime);
		}

		ctx.restore();
	}
}

class Particle {
	private position = {x: 0, y: 0};
	private velocity = {x: 3, y: 12};
	private size = {width: 100, height: 100};
	private drag = {x: 1.5, y: 1};
	private bounciness = 0.5;
	private gravity: number = 10;
	private maxVelocity: number = 20;
	private yBounds = 0;
	private canvas: HTMLCanvasElement | null = null;

	public sprite: HTMLImageElement | null = null;
	public direction: number = 0;

	init(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.position.x = canvas.width / 2 - this.size.width / 2;
		this.position.y = canvas.height / 2 - this.size.height / 2;

		this.velocity = {
			x: this.getRandomArbitrary(-4, 4),
			y: this.getRandomArbitrary(4, 12),
		}

		this.yBounds = this.position.y;
	}

	getRandomArbitrary(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, deltaTime: number) {
		this.velocity.y += this.gravity * deltaTime;

		if(this.velocity.x) {
			if(this.velocity.x > 0) {
				this.velocity.x -= this.drag.x * deltaTime;

				if(this.velocity.x > this.maxVelocity) {
					this.velocity.x = this.maxVelocity;
				}
			} else {
				this.velocity.x += this.drag.x * deltaTime;

				if(this.velocity.x < -this.maxVelocity) {
					this.velocity.x = -this.maxVelocity;
				}
			}
		}

		if(this.velocity.y) {
			if(this.velocity.y > 0) {
				this.velocity.y -= this.drag.y * deltaTime;

				if(this.velocity.y > this.maxVelocity) {
					this.velocity.y = this.maxVelocity;
				}
			} else {
				this.velocity.y += this.drag.y * deltaTime;

				if(this.velocity.y < -this.maxVelocity) {
					this.velocity.y = -this.maxVelocity;
				}
			}
		}

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if(this.position.y > this.yBounds) {
			this.position.y = this.yBounds;
			this.velocity.y = -Math.abs(this.velocity.y) * this.bounciness;
		}

		if(this.canvas) {
			this.size = {
				width: this.canvas.height / 2 - this.position.y,
				height: this.canvas.height / 2 - this.position.y,
			}
		}

		if(this.sprite) {
			ctx.translate((this.position.x + this.size.width / 2), (this.position.y + this.size.height / 2));
			ctx.rotate(-45*Math.PI/180);
			ctx.translate(-(this.position.x + this.size.width / 2), -(this.position.y + this.size.height / 2));

			if(this.canvas) {
				ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
				ctx.rotate(this.direction*Math.PI/180);
				ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
			}
			ctx.drawImage(this.sprite, this.position.x, this.position.y, this.size.width, this.size.height);

			if(this.canvas) {
				ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
				ctx.rotate(-this.direction*Math.PI/180);
				ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
			}

			ctx.translate((this.position.x + this.size.width / 2), (this.position.y + this.size.height / 2));
			ctx.rotate(45*Math.PI/180);
			ctx.translate(-(this.position.x + this.size.width / 2), -(this.position.y + this.size.height / 2));
		} else {
			ctx.beginPath();
			ctx.rect(this.position.x, this.position.y, this.size.width, this.size.height);
			ctx.fillStyle = "black";
			ctx.fill();
		}

	}
}

export default App;
