var canvas = new fabric.Canvas('canvas');

var defaultStrokeWidth = 1;

canvas.setDimensions({ width: 500, height: 800});
canvas.hoverCursor = 'pointer';

canvas.setBackgroundColor('rgb(250, 250, 250)', canvas.renderAll.bind(canvas));

canvas.on('object:scaling', function(e) {
    // force object's stroke width to default value
    var o = e.target;
    if (o.getObjects) {
        o.getObjects().forEach(function(path) {
            path.strokeWidth = defaultStrokeWidth / o.scaleX;
        });
    } else {
        o.strokeWidth = defaultStrokeWidth / o.scaleX;     
    }
});

var onSymbolClick = function(symbol) {
    fabric.loadSVGFromURL('./symbols/' + symbol + '.svg', function(objects, options) {   
        if (objects && objects.length) {
            if (objects.length > 1) {
                var group = fabric.util.groupSVGElements(objects, options);
                canvas.add(group)
            } else {
                canvas.add(objects[0]);
            }
        } else {
            console.warn('couldn\'t load symbol: ' + symbol);
        }
    });
}


document.getElementById('draw').onclick = function() {
    canvas.isDrawingMode = !canvas.isDrawingMode;

    canvas.freeDrawingBrush.color = '#AAA';
    canvas.freeDrawingBrush.width = 1.5;
    canvas.freeDrawingBrush.strokeDashArray = [5];
};


document.getElementById('save-image').onclick = function() {
    if (!fabric.Canvas.supports('toDataURL')) {
        alert('This browser doesn\'t support serialization of canvas to an image');
    }
    else {
        document.getElementById('canvas').toBlob(function(blob) {
            saveAs(blob, "slika.png");
        });
    }
};

var _clipboard;
document.onkeydown = function(e) {
    var eventObj = window.event ? event : e;
    // copy
    if (eventObj.keyCode == 67 && (eventObj.ctrlKey || eventObj.metaKey)) {
        canvas.getActiveObject().clone(function(cloned) {
            _clipboard = cloned;
        });
    }
    // paste
    else if (eventObj.keyCode == 86 && (eventObj.ctrlKey || eventObj.metaKey)) {
        _clipboard.clone(function(clonedObj) {
            canvas.discardActiveObject();

            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    canvas.add(obj);
                });
                // this should solve the unselectability
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            
            _clipboard.top += 10;
            _clipboard.left += 10;
            canvas.setActiveObject(clonedObj);
        });
    }
};

document.getElementById('debug').onclick = function() {
    canvas.setDimensions({ width: 1000, height: 1000});
};

/*
    // unused code / examples

document.getElementById('overhang-button').onclick = function() {
    var paths = [];

    [
        'M1 1c.6 7.68 2.6 12.82 5.94 15.4 4.55 3.54 12.77 8.32 21.47 8.04 10.98-.35 19.33-6.15 23.72-11.7 1.94-2.48 3.18-6.4 3.7-11.74',
        'M5.76 15.2V1.26M8.82 17.52V1.12M11.4 19.24V1.27M13.98 20.4V1.4M16.85 21.92V1.48M20.16 23.36V1.5M23.6 24.3V1.5M26.7 24.3V1.44M30.36 24.16V1.48M33.8 23.86V1.88M37.27 23.05V1.75M40.7 21.74V1.7M44.4 19.76V1.73M47.53 17.6V1.38M51.47 13.5V1.68'
    ].forEach(function(d) {
        var path = new fabric.Path(d);
        path.set({ stroke: '#AAA', fill: false, strokeWidth: defaultStrokeWidth });
        paths.push(path);
    });

    var overhang = new fabric.PathGroup(paths, { width: 50, height: 50, left: 50, top: 50 });
    canvas.add(overhang);
};
*/
