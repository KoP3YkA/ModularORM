import {TransformFactory} from "./TransformFactory";

export const Transform = (func: (value: any) => any) => TransformFactory.createTransform(func)