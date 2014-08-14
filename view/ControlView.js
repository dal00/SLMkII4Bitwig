// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ControlView (model)
{
    AbstractView.call (this, model);
    
    this.trackBank = this.model.getTrackBank ();

    this.stopPressed = false;
    this.isRewinding = false;
    this.isForwarding = false;
    this.isTempoInc = false;
    this.isTempoDec = false;
    
    this.lastDeviceMode = MODE_BANK_DEVICE;
}
ControlView.prototype = new AbstractView ();
ControlView.prototype.constructor = ControlView;

//--------------------------------------
// Transport
//--------------------------------------

ControlView.prototype.onRewind = function (event)
{
    if (event.isDown ())
        this.isRewinding = true;
    else if (event.isUp ())
        this.isRewinding = false;
    this.doChangePosition ();
};

ControlView.prototype.onForward = function (event)
{
    if (event.isDown ())
        this.isForwarding = true;
    else if (event.isUp ())
        this.isForwarding = false;
    this.doChangePosition ();
};

ControlView.prototype.doChangePosition = function ()
{
    if (!this.isRewinding && !this.isForwarding)
        return;
    this.model.getTransport ().changePosition (this.isForwarding, false);
    scheduleTask (doObject (this, function ()
    {
        this.doChangePosition ();
    }), null, 100);
};

ControlView.prototype.onPlay = function (event)
{
    if (!event.isDown ())
        return;
    if (!this.restartFlag)
    {
        this.model.getTransport ().play ();
        this.doubleClickTest ();
    }
    else
    {
        this.model.getTransport ().stopAndRewind ();
        this.restartFlag = false;
    }
};

ControlView.prototype.onStop = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().stop ();
};

ControlView.prototype.onRecord = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLauncherOverdub ();
    else
        this.model.getTransport ().record ();
};

ControlView.prototype.onLoop = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().toggleLoop ();
};


//--------------------------------------
// Buttons
//--------------------------------------

ControlView.prototype.onButtonRow1 = function (index, event)
{
    if (!event.isDown ())
        return;

    var cm = this.surface.getCurrentMode ();
    if (cm != MODE_FUNCTIONS && cm != MODE_FIXED)
    {
        this.surface.setPendingMode (MODE_FUNCTIONS);
        cm = MODE_FUNCTIONS;
    }
        
    if (cm == MODE_FIXED)
    {
        this.model.getTrackBank ().setNewClipLength (index);
        return;
    }

    switch (index)
    {
        // Undo
        case 0:
            this.model.getApplication ().undo ();
            break;

        // Redo
        case 1:
            this.model.getApplication ().redo ();
            break;
            
        // Delete
        case 2:
            this.model.getApplication ().deleteSelection ();
            break;
            
        // Double
        case 3:
            this.model.getApplication ().duplicate ();
            break;
            
        // New
        case 4:
            var t = this.trackBank.getSelectedTrack ();
            if (t != null)
            {
                var slotIndex = this.getSelectedSlot (t);
                if (slotIndex == -1)
                    slotIndex = 0;
                    
                for (var i = 0; i < 8; i++)
                {
                    var sIndex = (slotIndex + i) % 8;
                    var s = t.slots[sIndex];
                    if (!s.hasContent)
                    {
                        var slots = this.trackBank.getClipLauncherSlots (t.index);
                        slots.createEmptyClip (sIndex, Math.pow (2, this.trackBank.getNewClipLength ()));
                        if (slotIndex != sIndex)
                            slots.select (sIndex);
                        slots.launch (sIndex);
                        this.model.getTransport ().setLauncherOverdub (true);
                        return;
                    }
                }
            }
            displayNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
            break;
            
        // Toggle the browser
        case 5:
            this.model.getApplication ().toggleBrowserVisibility ();
            break;
            
        // Metronome
        case 6:
            this.model.getTransport ().toggleClick ();
            break;
            
        // Tap Tempo
        case 7:
            this.model.getTransport ().tapTempo ();
            break;
    }
};

ControlView.prototype.onButtonRow2 = function (index, event)
{
    if (!event.isDown ())
        return;

    var cm = this.surface.getCurrentMode ();
    if (cm != MODE_TRACK_TOGGLES && cm != MODE_FRAME && cm != MODE_PRESET)
    {
        this.surface.setPendingMode (MODE_TRACK_TOGGLES);
        cm = MODE_TRACK_TOGGLES;
    }
        
    if (cm == MODE_FRAME)
    {
        this.surface.getMode (cm).executeCommand (index);
        return;
    }
    else if (cm == MODE_PRESET)
    {
        var cd = this.model.getCursorDevice ();
        switch (index)
        {
            case 2: cd.switchToPreviousPresetCategory (); break;
            case 3: cd.switchToNextPresetCategory ();     break;
            case 4: cd.switchToPreviousPresetCreator ();  break;
            case 5: cd.switchToNextPresetCreator ();      break;
            case 6: cd.switchToPreviousPreset ();         break;
            case 7: cd.switchToNextPreset ();             break;
        }
        return;
    }
    
        
    switch (index)
    {
        // Mute
        case 0:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.toggleMute (track.index);
            break;

        // Solo
        case 1:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.toggleSolo (track.index);
            break;
            
        // Arm
        case 2:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.toggleArm (track.index);
            break;
            
        // Write
        case 3:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.model.getTransport ().toggleWriteArrangerAutomation ();
            break;
            
        // Browse
        case 4:
            this.surface.setPendingMode (MODE_PRESET);
            break;
            
        // Dis-/Enable device
        case 5:
            this.model.getCursorDevice ().toggleEnabledState ();
            break;
            
        // Previous device
        case 6:
            this.model.getCursorDevice ().selectPrevious ();
            break;
            
        // Next device
        case 7:
            this.model.getCursorDevice ().selectNext ();
            break;
    }
};

ControlView.prototype.onButtonRow3 = function (index, event)
{
    this.trackBank.select (index);
};

ControlView.prototype.onButtonRow4 = function (index, event)
{
    switch (index)
    {
        // Decrease tempo
        case 0:
            if (event.isDown ())
                this.isTempoDec = true;
            else if (event.isUp ())
                this.isTempoDec = false;
            this.doChangeTempo ();
            break;

        // Increase tempo
        case 1:
            if (event.isDown ())
                this.isTempoInc = true;
            else if (event.isUp ())
                this.isTempoInc = false;
            this.doChangeTempo ();
            break;
            
        case 2:
            // Not used
            break;
            
        case 3:
            // Not used
            break;
            
        case 4:
            // Not used
            break;
            
        // Toggle launcher overdub
        case 5:
            if (event.isDown ())
                this.model.getTransport ().toggleLauncherOverdub ();
            break;
            
        case 6:
            // Not used
            break;
            
        case 7:
            // Not used
            break;
    }
};

ControlView.prototype.doChangeTempo = function ()
{
    if (!this.isTempoInc && !this.isTempoDec)
        return;
    this.model.getTransport ().changeTempo (this.isTempoInc);
    scheduleTask (doObject (this, function ()
    {
        this.doChangeTempo ();
    }), null, 200);
};


//--------------------------------------
// Knobs & Sliders
//--------------------------------------

ControlView.prototype.onKnobRow1 = function (index, value)
{
    if (!this.model.hasSelectedDevice ())
        return;
    if (value > 64) // Convert negative relative value
        value = 127 - (value - 64);
    var cd = this.model.getCursorDevice ();
    
    var cm = this.surface.getCurrentMode ();
    if (cm < MODE_BANK_DEVICE || cm > MODE_BANK_MACRO)
    {
        this.surface.setPendingMode (MODE_BANK_DEVICE);
        cm = MODE_BANK_DEVICE;
    }
    
    var mode = this.surface.getMode (cm);
    switch (cm)
    {
        case MODE_BANK_DEVICE:
            var param = cd.getFXParam (index);
            param.value = this.surface.changeValue (value, param.value);
            cd.setParameter (index, param.value);
            break;
            
        case MODE_BANK_MODULATE:
            if ((value <= 64 && !mode.params[index].value) ||
                (value > 64 && mode.params[index].value))
                mode.getParameter (index).toggleIsMapping ();
            break;
    
        default:
            mode.params[index].value = this.surface.changeValue (value, mode.params[index].value);
            mode.getParameter (index).set (mode.params[index].value, Config.maxParameterValue);
            break;
    }
};

ControlView.prototype.onKnobRow2 = function (index, value)
{
    var cm = this.surface.getCurrentMode ();
    if (cm != MODE_TRACK && cm != MODE_MASTER)
    {
        this.surface.setPendingMode (MODE_TRACK);
        cm = MODE_TRACK;
    }

    if (cm == MODE_MASTER)
    {
        if (index == 0)
            this.model.getMasterTrack ().setVolume (value);
        else if (index == 1)
            this.model.getMasterTrack ().setPan (value);
        return;
    }
        
    switch (index)
    {
        // Volume
        case 0:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.setVolume (track.index, value);
            break;

        // Pan
        case 1:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.setPan (track.index, value);
            break;
            
        // Send 1 - 6
        default:
            var track = this.trackBank.getSelectedTrack ();
            if (track != null)
                this.trackBank.setSend (track.index, index - 2, value);
            break;
    }
};

ControlView.prototype.onSlider = function (index, value)
{
    if (this.surface.getCurrentMode () != MODE_VOLUME)
        this.surface.setPendingMode (MODE_VOLUME);
    this.trackBank.setVolume (index, value);
};


//--------------------------------------
// Row selections
//--------------------------------------

ControlView.prototype.onButtonRow1Select = function ()
{
    if (this.surface.getCurrentMode () == MODE_FUNCTIONS)
        this.surface.setPendingMode (MODE_FIXED);
    else
        this.surface.setPendingMode (MODE_FUNCTIONS);
};

ControlView.prototype.onKnobRow1Select = function ()
{
    var cm = this.surface.getCurrentMode ();
    if (cm >= MODE_BANK_DEVICE && cm <= MODE_BANK_MACRO)
    {
        this.lastDeviceMode++;
        if (this.lastDeviceMode > MODE_BANK_MACRO)
            this.lastDeviceMode = MODE_BANK_DEVICE;
    }
    this.surface.setPendingMode (this.lastDeviceMode);
};

ControlView.prototype.onButtonRow2Select = function ()
{
    if (this.surface.getCurrentMode () == MODE_TRACK_TOGGLES)
        this.surface.setPendingMode (MODE_FRAME);
    else
        this.surface.setPendingMode (MODE_TRACK_TOGGLES);
};

ControlView.prototype.onKnobRow2Select = function ()
{
    if (this.surface.getCurrentMode () == MODE_TRACK)
        this.surface.setPendingMode (MODE_MASTER);
    else
        this.surface.setPendingMode (MODE_TRACK);
};

ControlView.prototype.onDrumPadRowSelect = function ()
{
    // Not used
};

ControlView.prototype.onSliderRowSelect = function ()
{
    this.surface.setPendingMode (MODE_VOLUME);
};

ControlView.prototype.onButtonRow3Select = function ()
{
    this.surface.setPendingMode (MODE_SELECT);
};

ControlView.prototype.onButtonRow4Select = function ()
{
    // Not used
};

ControlView.prototype.onButtonP1 = function (isUp, event)
{
    if (!event.isDown ())
        return;

    var device = this.model.getCursorDevice ();
    if (isUp)
    {
        if (device.hasNextParameterPage ())
            device.nextParameterPage ();
    }
    else
    {
        if (device.hasPreviousParameterPage ())
            device.previousParameterPage ();
    }
    this.surface.setPendingMode (MODE_BANK_DEVICE);
};

ControlView.prototype.onButtonP2 = function (isUp, event)
{
    if (!event.isDown ())
        return;

    if (isUp)
    {
        if (!this.trackBank.canScrollTracksDown ())
            return;
        this.trackBank.scrollTracksPageDown ();
    }
    else
    {
        if (!this.trackBank.canScrollTracksUp ())
            return;
        this.trackBank.scrollTracksPageUp ();
    }
    this.surface.setPendingMode (this.surface.getPreviousMode ());
    this.trackBank.select (0);
};

ControlView.prototype.onGridNote = function (note, velocity)
{
    this.surface.sendMidiEvent (0x90, note, velocity);
};

//--------------------------------------
// Protected API
//--------------------------------------

ControlView.prototype.updateButtons = function ()
{
    var track = this.trackBank.getSelectedTrack ();
    var cm = this.surface.getCurrentMode ();
    var hasTrack = track != null && cm != MODE_FRAME && cm != MODE_PRESET;

    // Button row 2: Track toggles
    this.surface.setButton (MKII_BUTTON_ROW2_1, hasTrack && track.mute ? MKII_BUTTON_STATE_ON : MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_2, hasTrack && track.solo ? MKII_BUTTON_STATE_ON : MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_3, hasTrack && track.recarm ? MKII_BUTTON_STATE_ON : MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_4, hasTrack && track.autowrite ? MKII_BUTTON_STATE_ON : MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_5, MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_6, MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_7, MKII_BUTTON_STATE_OFF);
    this.surface.setButton (MKII_BUTTON_ROW2_8, MKII_BUTTON_STATE_OFF);

    // Button row 3: Selected track indication
    for (var i = 0; i < 8; i++)
        this.surface.setButton (MKII_BUTTON_ROW3_1 + i, this.trackBank.getTrack (i).selected ? MKII_BUTTON_STATE_ON : MKII_BUTTON_STATE_OFF);
        
    // LED indications for device parameters
    this.surface.getMode (this.lastDeviceMode).setLEDs ();
};
