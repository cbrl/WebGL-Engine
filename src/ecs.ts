function uuidv4() {
	return ([1e7].toString()+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: string) =>
	  (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)
	);
}


class Entity {
	handle: string = uuidv4();
	components: Map<string, Component> = new Map();

	constructor() {}

	addComponent<T extends Component>(c: new(...args: any[]) => T, ...args: any[]): T {
		var component: T = new c(...args);
		component.owner = this.handle;

		this.components.set(component.constructor.name, component);
		return component;
	}

	hasComponent(type: Component): boolean {
		return this.components.has(type.constructor.name);
	}

	getComponent<T extends Component>(type: new(...args: any[]) => T): T | null {
		return <T>this.components.get(type.name);
	}

	removeComponent<T extends Component>(component: T): boolean {
		return this.components.delete(component.constructor.name);
	}
}


abstract class Component {
	owner: string;
	constructor() {}
}


abstract class System {
	private ecs: ECS;
	
	constructor() {}

	setECS(ecs: ECS): void {
		this.ecs = ecs;
	}

	abstract update(): void;
}


class ECS {
	entities: Map<string, Entity> = new Map();
	systems: Map<string, System> = new Map();

	constructor() {
	}

	createEntity(): Entity {
		var entity = new Entity();
		this.entities.set(entity.handle, entity);
		return entity;
	}

	getEntity(handle: string): Entity | null {
		return this.entities.get(handle);
	}

	removeEntityWithHandle(handle: string): boolean {
		return this.entities.delete(handle);
	}

	removeEntity(entity: Entity): boolean {
		return this.removeEntityWithHandle(entity.handle);
	}


	addSystem<T extends System>(type: new(...args: any[]) => T, ...args: any[]): T {
		var system: T = new type(...args);
		system.setECS(this);
		this.systems.set(system.constructor.name, system);
		return system;
	}

	removeSystemOfType<T extends typeof System>(type: T): boolean {
		return this.systems.delete(type.name);
	}

	removeSystem<T extends System>(system: T): boolean {
		return this.systems.delete(system.constructor.name);
	}


	update(): void {
		this.systems.forEach((system: System) => {
			system.update();
		});
	}


	// Parameters: [component_type_1, component_type_2, ...], function(Entity) => void
	forEach<T extends Component>(component_types: T[], func: (e: Entity) => void): void {
		this.entities.forEach((entity: Entity) => {
			var valid: boolean = true;
			for (let i: number = 0; i < component_types.length; ++i) {
				if (!entity.hasComponent(component_types[i]))
					valid = false;
			}
			if (valid) {
				func(entity);
			}
		});
	}
}


export {
	ECS,
	Entity,
	Component,
	System
}