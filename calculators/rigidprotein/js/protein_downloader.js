//Copyright 2020 Radost Waszkiewicz
//Permission is hereby granted, free of charge, to any person obtaining a copy 
//of this software and associated documentation files (the "Software"), to deal 
//in the Software without restriction, including without limitation the rights 
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
//copies of the Software, and to permit persons to whom the Software is 
//furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//SOFTWARE.

import * as pdbParser from './pdb_parser.js';

// Using PDB api interface gets protein data.
// retruns JSON description of main chain.
// Description is array of amino acids.
// Each acid is of form [location, size]
// Location is given by C-alpha
// Location is of form [x,y,z]
// x,y,z are expressed in Agnstroms.
// Size is expressed in Angstroms

//1a06
//1ubq

let urlleft = "https://files.rcsb.org/download/"
let urlright= ".pdb"
async function getProteinDataFromId(idstr)
{
    let response = await fetch(urlleft+(idstr.toLowerCase())+urlright);
    response = await response.text();
    let responseText = response;
    return { beadspec: pdbParser.pdbToBeads(responseText)};
}

function getProteinFromText(pdbtext)
{
    return { beadspec: pdbParser.pdbToBeads(pdbtext)};
}

window.getProteinDataFromId = getProteinFromId
window.getProteinDataFromText = getProteinFromText
