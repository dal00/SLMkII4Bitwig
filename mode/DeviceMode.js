// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
    AbstractMode.call (this, model);
}
DeviceMode.prototype = new AbstractMode ();

DeviceMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();

    if (!this.model.hasSelectedDevice ())
    {
        d.clearRow (2).done (2).setRow (0, '                       Please select a device...                       ');
        return;
    }

    var cursorDevice = this.model.getCursorDevice ();
    for (var i = 0; i < 8; i++)
    {
        var param = cursorDevice.getFXParam (i);
        var isEmpty = param.name.length == 0;
        d.setCell (0, i, param.name, Display.FORMAT_RAW)
         .setCell (2, i, param.valueStr, Display.FORMAT_RAW);
    }
    d.done (0).done (2);
};

DeviceMode.prototype.setLEDs = function ()
{
    var hasDevice = this.model.hasSelectedDevice ();
    var cursorDevice = this.model.getCursorDevice ();
    for (var i = 0; i < 8; i++)
    {
        var value = hasDevice ? cursorDevice.getFXParam (i).value : 0;
        value = Math.min (Math.round ((value * 11) / 127), 11);
        this.surface.output.sendCC (0x70 + i, value);
    }
};
