import {Singleton} from "./decorators/Singleton";

/**
 * Main class
 * @decorators Singleton
 */
@Singleton
export class ModularORM {

    private static instance : ModularORM;

    public constructor() {}

    /**
     * Get instance method
     * @principe Singleton
     * @return ModularORM
     */
    public static get getInstance() : ModularORM {
        if (!this.instance) this.instance = new ModularORM();
        return this.instance;
    }

}