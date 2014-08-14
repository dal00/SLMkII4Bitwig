// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

Display.RIGHT_ARROW = '>';

Display.SPACES =
[
    '',
    ' ',
    '  ',
    '   ',
    '    ',
    '     ',
    '      ',
    '       ',
    '        ',
    '         '
];


// 2 rows (0-1) with 4 blocks (0-3). Each block consists of 
// 18 characters or 2 cells (0-8).
function Display (output)
{
    AbstractDisplay.call (this, output, 4 /* No of rows */, 4 /* No of blocks */, 8 /* No of cells */);
}
Display.prototype = new AbstractDisplay ();

Display.prototype.clearCell = function (row, cell)
{
    this.cells[row * this.noOfCells + cell] = '         ';
    return this;
};

Display.prototype.setBlock = function (row, block, value)
{
    var cell = 2 * block;
    if (value.length > 9)
    {
        this.cells[row * 8 + cell]     = value.substr (0, 9);
        this.cells[row * 8 + cell + 1] = this.pad (value.substring (9), 8, ' ');
    }
    else
    {
        this.cells[row * 8 + cell] = this.pad (value, 9, ' ');
        this.clearCell (row, cell + 1);
    }
    return this;
};

Display.prototype.setCell = function (row, cell, value, format)
{
    this.cells[row * this.noOfCells + cell] = this.pad (this.formatStr (value, format), 9, ' ');
    return this;
};

Display.prototype.writeLine = function (row, text)
{
    var array = [];
    for (var i = 0; i < text.length; i++)
        array[i] = text.charCodeAt(i);
    this.output.sendSysex (SLMkII.SYSEX_HEADER + "02 01 00" + uint7ToHex (row + 1) + "04" + toHexStr (array) + " 00 F7");
}

Display.prototype.formatStr = function (value, format)
{
    return value ? value.toString () : "";
};

Display.prototype.pad = function (str, length, character)
{
    if (typeof (str) == 'undefined' || str == null)
        str = '';
    var diff = length - str.length;
    if (diff < 0)
        return str.substr (0, length);
    if (diff > 0)
        return str + Display.SPACES[diff];
    return str;
};
