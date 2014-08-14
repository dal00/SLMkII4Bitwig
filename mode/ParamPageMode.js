// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ParamPageMode (model, mode, name)
{
    AbstractMode.call (this, model);
    this.id = mode;
    this.name = name;
    this.params = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
}
ParamPageMode.prototype = new AbstractMode ();

ParamPageMode.prototype.attachTo = function (surface)
{
    AbstractMode.prototype.attachTo.call (this, surface);
    
    for (var i = 0; i < 8; i++)
    {
        var p = this.getParameter (i);
        var n = this.getNameParameter (i);

        // Parameter name [Dumb hack for inconsistent API naming]
        if (this.id == MODE_BANK_MACRO)
        {
            n.addLabelObserver (8, '', doObjectIndex (this, i, function (index, name)
            {
                this.params[index].name = name;
            }));
        }
        else
        {
            n.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
            {
                this.params[index].name = name;
            }));
        }

        if (this.id == MODE_BANK_MODULATE)
        {
            p.addIsMappingObserver (doObjectIndex (this, i, function (index, isMapping)
            {
                this.params[index].value = isMapping;
                this.params[index].valueStr = isMapping ? 'On' : 'Off';
            }));
        }
        else
        {
            p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, function (index, value)
            {
                this.params[index].value = value;
            }));
            // Parameter value text
            p.addValueDisplayObserver (8, '',  doObjectIndex (this, i, function (index, value)
            {
                this.params[index].valueStr = value;
            }));
        }
    }
};

ParamPageMode.prototype.getParameter = function (index)
{
    switch (this.id)
    {
        case MODE_BANK_COMMON:
            return this.model.getCursorDevice ().getCommonParameter (index);
        case MODE_BANK_ENVELOPE:
            return this.model.getCursorDevice ().getEnvelopeParameter (index);
        case MODE_BANK_USER:
            return this.model.getUserControlBank ().getControl (index);
        case MODE_BANK_MACRO:
            return this.model.getCursorDevice ().getMacro (index).getAmount ();
        case MODE_BANK_MODULATE:
            return this.model.getCursorDevice ().getModulationSource (index);
    }
};

ParamPageMode.prototype.getNameParameter = function (index)
{
    switch (this.id)
    {
        case MODE_BANK_COMMON:
            return this.model.getCursorDevice ().getCommonParameter (index);
        case MODE_BANK_ENVELOPE:
            return this.model.getCursorDevice ().getEnvelopeParameter (index);
        case MODE_BANK_USER:
            return this.model.getUserControlBank ().getControl (index);
        case MODE_BANK_MACRO:
            return this.model.getCursorDevice ().getMacro (index);
        case MODE_BANK_MODULATE:
            return this.model.getCursorDevice ().getModulationSource (index);
    }
};

ParamPageMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    if (this.hasParams ())
    {
        for (var i = 0; i < 8; i++)
        {
            if (this.params[i].name.length == 0)
                d.clearCell (0, i).clearCell (2, i);
            else
            {
                d.setCell (0, i, this.params[i].name, Display.FORMAT_RAW)
                 .setCell (2, i, this.params[i].valueStr, Display.FORMAT_RAW)
            }
        }
    }
    else
    {
        d.clearRow (0).clearRow (2)
         .setCell (2, 3, 'No ' + this.name).setCell (2, 4, 'Assigned');
    }
    d.done (0).done (2);
};

ParamPageMode.prototype.hasParams = function ()
{
    for (var i = 0; i < 8; i++)
    {
        if (this.params[i].name.length != 0)
            return true;
    }
    return false;
};

ParamPageMode.prototype.setLEDs = function ()
{
    var hasParams = this.hasParams ();
    for (var i = 0; i < 8; i++)
    {
        var value = hasParams ? this.params[i].value : 0;
        if (this.id == MODE_BANK_MODULATE)
            value = value ? 11 : 0;
        else
            value = Math.min (Math.round ((value * 11) / 127), 11);
        this.surface.output.sendCC (0x70 + i, value);
    }
};
