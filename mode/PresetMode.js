// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PresetMode (model)
{
    AbstractMode.call (this, model);
}
PresetMode.prototype = new AbstractMode ();

PresetMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();

    if (!this.model.hasSelectedDevice ())
    {
        d.clearRow (2).done (2).setRow (0, '                       Please select a device...                       ');
        return;
    }

    d.clearRow (0).setCell (0, 0, "Device:")
     .setBlock (2, 0, this.model.getSelectedDevice ().name);
    
    var cd = this.model.getCursorDevice ();
    var view = cd.categoryProvider.getView (2);
    for (var i = 0; i < 2; i++)
    {
        var value = view[i] != null ? view[i] : "";
        if (i == 0)
            d.setBlock (0, 1, ' ' + Display.RIGHT_ARROW + value);
        else
            d.setBlock (2, 1, '  ' + value);
    }
    
    var view = cd.creatorProvider.getView (2);
    for (var i = 0; i < 2; i++)
    {
        var value = (view[i] != null) ? view[i] : "";
        if (i == 0)
            d.setBlock (0, 2, ' ' + Display.RIGHT_ARROW + value);
        else
            d.setBlock (2, 2, '  ' + value);
    }

    d.clearColumn (3).setBlock (0, 3, ' ' + Display.RIGHT_ARROW + cd.getCurrentPreset ()).allDone ();
};
