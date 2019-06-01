function uuidv4() {
	return ([1e7].toString()+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: string) =>
	  (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)
	);
}


class Entity {
	handle: string = uuidv4();
	private _components: Map<string, Component> = new Map();

	constructor() {}

	addComponent<T extends Component>(component: T): T {
		component.owner = this.handle;
		this._components.set(component.constructor.name, component);
		return component;
	}

	hasComponent<T extends typeof Component>(type: T): boolean {
		return this._components.has(type.name);
	}

	getComponent<T extends Component>(type: new(...args: any[]) => T): T | null {
		return <T>this._components.get(type.name);
	}

	removeComponent<T extends Component>(component: T): boolean {
		return this._components.delete(component.constructor.name);
	}
}


abstract class Component {
	owner: string;
	constructor(...args: any[]) {}
}


abstract class System {
	protected ecs: ECS;
	
	constructor() {}

	setECS(ecs: ECS): void {
		this.ecs = ecs;
	}

	abstract update(): void;
}


class ECS {
	private _entities: Map<string, Entity> = new Map();
	private _systems: Map<string, System> = new Map();

	constructor() {
	}

	createEntity(): Entity {
		var entity = new Entity();
		this._entities.set(entity.handle, entity);
		return entity;
	}

	getEntity(handle: string): Entity | null {
		return this._entities.get(handle);
	}

	removeEntityWithHandle(handle: string): boolean {
		return this._entities.delete(handle);
	}

	removeEntity(entity: Entity): boolean {
		return this.removeEntityWithHandle(entity.handle);
	}


	addSystem<T extends System>(type: new(...args: any[]) => T, ...args: any[]): T {
		var system: T = new type(...args);
		system.setECS(this);
		this._systems.set(system.constructor.name, system);
		return system;
	}

	removeSystemOfType<T extends typeof System>(type: T): boolean {
		return this._systems.delete(type.name);
	}

	removeSystem<T extends System>(system: T): boolean {
		return this._systems.delete(system.constructor.name);
	}


	update(): void {
		this._systems.forEach((system: System) => {
			system.update();
		});
	}


	// Parameters: [component_type_1, component_type_2, ...], function(Entity) => void
	forEach<T extends typeof Component>(component_types: T[], func: (e: Entity) => void): void {
		this._entities.forEach((entity: Entity) => {
			var valid: boolean = true;
			component_types.forEach((type: T) => {
				if (!entity.hasComponent(type))
					valid = false;
			});
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