import {TransformFactory} from "../dto/TransformFactory";

export const ToNumber = () => TransformFactory.createTransform((value) => +value);

export const ToString = () => TransformFactory.createTransform((value) => String(value));

export const ToDate = () => TransformFactory.createTransform((value) => new Date(value));