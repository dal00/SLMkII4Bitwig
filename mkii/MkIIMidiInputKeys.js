// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MkIIMidiInputKeys ()
{
    MidiInput.call (this);
}

MkIIMidiInputKeys.prototype = new MidiInput ();

MkIIMidiInputKeys.prototype.init = function ()
{
    this.port = host.getMidiInPort (1);
};

MkIIMidiInputKeys.prototype.createNoteInput = function ()
{
    var noteInput = this.port.createNoteInput ("Novation SL MkII", "80????", "90????", "E0????" /* Pitchbend */, "B040??" /* Sustainpedal */);
    noteInput.setShouldConsumeEvents (false);
    return noteInput;
};
