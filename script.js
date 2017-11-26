var topoEditor = {
    isLineDrawingMode: false,

    settings: {
        strokeWidth: 1,
        straightLineStrokeWidth: 2,
        straightLineColor: 'rgb(50, 50, 50)',
        canvasBackgroundColor: 'rgb(250, 250, 250)'
    },

    init: function() {
        var self = this;
        this.canvas = new fabric.Canvas('canvas');
        this.canvas.setDimensions({ width: 500, height: 800});
        this.canvas.hoverCursor = 'pointer';
        this.canvas.setBackgroundColor(this.settings.canvasBackgroundColor, this.canvas.renderAll.bind(this.canvas));

        this.canvas.on('object:scaling', function(e) {
            // force object's stroke width to default value
            var o = e.target;
            if (o.getObjects) {
                o.getObjects().forEach(function(path) {
                    path.strokeWidth = self.settings.defaultStrokeWidth / o.scaleX;
                });
            } else {
                o.strokeWidth = self.settings.defaultStrokeWidth / o.scaleX;     
            }
        });
        this.bindUIHandlers();
    },

    bindUIHandlers: function() {
        var self = this;
        document.getElementById('draw-dashed').onclick = function() {

            self.canvas.isDrawingMode = !self.canvas.isDrawingMode;

            self.canvas.freeDrawingBrush.color = '#AAA';
            self.canvas.freeDrawingBrush.width = 1.5;
            self.canvas.freeDrawingBrush.strokeDashArray = [5];
        };

        document.getElementById('save-image').onclick = function() {
            if (!fabric.Canvas.supports('toDataURL')) {
                alert('This browser doesn\'t support serialization of canvas to an image');
            }
            else {
                // maybe use the canvas object directly
                document.getElementById('canvas').toBlob(function(blob) {
                    saveAs(blob, "slika.png");
                });
            }
        };

        document.getElementById('debug').onclick = function() {
            // self.canvas.setDimensions({ width: 1000, height: 1000});
        };

        var symbolElements = document.getElementsByClassName('symbol');
        for(var i = 0; i < symbolElements.length; i++) {
            symbolElements[i].onclick = function(e) {
                fabric.loadSVGFromURL('./symbols/' + this.dataset.symbolType + '.svg', function(objects, options) {   
                    if (objects && objects.length) {
                        if (objects.length > 1) {
                            var group = fabric.util.groupSVGElements(objects, options);
                            self.canvas.add(group)
                        } else {
                            self.canvas.add(objects[0]);
                        }
                    } else {
                        console.warn('couldn\'t load symbol: ' + this.dataset.symbolType);
                    }
                });
            };
        }

        var clipboard;
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 67 && (e.metaKey || e.ctrlKey)) {
                var activeObject = self.canvas.getActiveObject();
                if (activeObject) {
                    activeObject.clone(function(clone) {
                        clipboard = clone;
                    });
                }
            } else if (e.keyCode === 86 && (e.metaKey || e.ctrlKey)) {
                if (clipboard) {
                    clipboard.clone(function(clone) {
                        self.canvas.discardActiveObject();

                        clone.set({
                            left: clone.left + 50,
                            top: clone.top + 50,
                            evented: true
                        });

                        if (clone.type === 'activeSelection') {
                            clone.canvas = self.canvas;
                            clone.forEachObject(function(object) {
                                self.canvas.add(object);
                            });
                            clone.setCoords();
                        } else {
                            self.canvas.add(clone);
                        }

                        clipboard.top += 10;
                        clipboard.left += 10;
                        self.canvas.setActiveObject(clone);
                    });
                }
            } else if (e.keyCode === 46 || e.keyCode === 8) {
                var activeObject = self.canvas.getActiveObject();
                if (activeObject) activeObject.remove();
            }
            // if ESC => unselect selected object
        });

        document.getElementById('draw-straight').onclick = function() {
            self.isLineDrawingMode = !self.isLineDrawingMode;
            if (self.isLineDrawingMode) {
                var mouseDown, line
                self.canvas.on('mouse:down', function(o) {
                    mouseDown = true;
                    var pointer = self.canvas.getPointer(o.e);
                    var points = [pointer.x, pointer.y, pointer.x, pointer.y];

                    line = new fabric.Line(points, {
                        strokeWidth: self.settings.straightLineStrokeWidth,
                        stroke: self.settings.straightLineColor,
                        originX: 'center',
                        originY: 'center'
                    });
                    self.canvas.add(line);
                });
                self.canvas.on('mouse:move', function(o) {
                    self.canvas.renderAll();    // really neccessary?
                    if (!mouseDown) return;
                    var pointer = self.canvas.getPointer(o.e);
                    line.set({ x2: pointer.x, y2: pointer.y });
                    self.canvas.renderAll();
                });
                self.canvas.on('mouse:up', function(o) {
                    var pointer = self.canvas.getPointer(o.e);  // what?!?
                    mouseDown = false;
                });
            } else {
                self.canvas.off('mouse:down', null);
                self.canvas.off('mouse:move', null);
                self.canvas.off('mouse:up', null);
            }
        };
    }
}
topoEditor.init();

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
