// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function TrackTogglesMode (model)
{
    AbstractMode.call (this, model);
}
TrackTogglesMode.prototype = new AbstractMode ();

TrackTogglesMode.prototype.updateDisplay = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    var d = this.surface.getDisplay ();
    
    if (t == null)
    {
        d.setRow (0, "                        Please select a track...                       ")
         .clearRow (2).done (2);
    }
    else
    {
        var selectedDevice = this.model.getSelectedDevice ();
        
        d.setCell (0, 0, "  Mute", Display.FORMAT_RAW)
         .setCell (2, 0, t.mute ? "   On" : "   Off", Display.FORMAT_RAW)
         .setCell (0, 1, "  Solo", Display.FORMAT_RAW)
         .setCell (2, 1, t.solo ? "   On" : "   Off", Display.FORMAT_RAW)
         .setCell (0, 2, "Rec Arm", Display.FORMAT_RAW)
         .setCell (2, 2, t.recarm ? "   On" : "   Off", Display.FORMAT_RAW)
         .setCell (0, 3, " Write", Display.FORMAT_RAW)
         .setCell (2, 3, t.autowrite ? "   On" : "   Off", Display.FORMAT_RAW)
         .setCell (0, 4, " Browse", Display.FORMAT_RAW)
         .setCell (2, 4, "", Display.FORMAT_RAW)
         .setCell (0, 5, selectedDevice.name.length > 8 ? selectedDevice.name.substr (0, 8) : selectedDevice.name, Display.FORMAT_RAW)
         .setCell (2, 5, selectedDevice.enabled ? 'Enabled' : 'Disabled', Display.FORMAT_RAW)
         .setCell (0, 6, "<<Device", Display.FORMAT_RAW)
         .setCell (2, 6, "", Display.FORMAT_RAW)
         .setCell (0, 7, "Device>>", Display.FORMAT_RAW)
         .setCell (2, 7, "", Display.FORMAT_RAW)
         .done (0).done (2);
    }
};
