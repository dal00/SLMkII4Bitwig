// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function FunctionMode (model)
{
    AbstractMode.call (this, model);
}
FunctionMode.prototype = new AbstractMode ();

FunctionMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    
    d.setCell (0, 0, "  Undo", Display.FORMAT_RAW)
     .setCell (0, 1, "  Redo", Display.FORMAT_RAW)
     .setCell (0, 2, " Delete", Display.FORMAT_RAW)
     .setCell (0, 3, " Double", Display.FORMAT_RAW)
     .setCell (0, 4, "  New", Display.FORMAT_RAW)
     .setCell (0, 5, " Browser", Display.FORMAT_RAW)
     .setCell (0, 6, "Metronom", Display.FORMAT_RAW)
     .setCell (0, 7, "TapTempo", Display.FORMAT_RAW)
     .clearRow (2).done (0).done (2);
};
