import { ClientGame } from '@/client-game';
import { Application } from 'pixi.js';
//import { extensions, Application, InteractionManager } from 'pixi.js';
//import { EventSystem } from '@pixi/events';


// Suppose to reduce jitter. Did not work.
//PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;

//extensions.remove(InteractionManager);

const app = new Application<HTMLCanvasElement>({

    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window,
    backgroundColor: 0xaaccff,
    //preserveDrawingBuffer: true,
    //clearBeforeRender: true


});


//const { renderer } = app;

document.body.appendChild(app.view);

/*
// Render stage so that it becomes the root target for UI events
renderer.render(app.stage);
// Dispatch a synthetic event on the canvas to test it.
renderer.view.dispatchEvent(new PointerEvent('click', {
    pointerType: 'mouse',
    clientX: 1,
    clientY: 1,
    isPrimary: true,
}));

*/

const game = new ClientGame(app);

game.init();

