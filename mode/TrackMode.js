// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function TrackMode (model)
{
    AbstractMode.call (this, model);
}
TrackMode.prototype = new AbstractMode ();

TrackMode.prototype.updateDisplay = function ()
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
        d.setCell (0, 0, "Volume", Display.FORMAT_RAW)
         .setCell (2, 0, t.volumeStr, Display.FORMAT_RAW)
         .setCell (0, 1, "Pan", Display.FORMAT_RAW)
         .setCell (2, 1, t.panStr, Display.FORMAT_RAW);

        for (var i = 0; i < 6; i++)
        {
            // Note: The Sends name is not send (always "Send")
            //d.setCell (0, 2 + i, t.sends[i].name, Display.FORMAT_RAW)
            d.setCell (0, 2 + i, 'Send ' + (i + 1), Display.FORMAT_RAW)
             .setCell (2, 2 + i, t.sends[i].volumeStr, Display.FORMAT_RAW);
        }
        d.done (0).done (2);
    }
};
