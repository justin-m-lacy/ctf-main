import { AppEvents } from './model/app-events';
import EventEmitter from 'eventemitter3';


export type Dispatcher = EventEmitter<AppEvents>;