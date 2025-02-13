import {System} from "../namespaces/System";

export function EventHandler(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    System.EVENT_HANDLERS.set(target.constructor, propertyName)
}