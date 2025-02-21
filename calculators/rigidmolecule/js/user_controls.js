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


// =================================== Pretty prints ===========================

// Pretty print array 1xn JSON style
function vectorPrint(vec)
{
    let ret = "";
    let l = vec.length;

    let ints = true;
    for(let i=0;i<l;i++)
    {
        ints = ints && Number.isInteger(vec[i]);
    }

    ret = ret + "[";
    for(let i=0;i<l;i++)
    {
        if(ints)
        {
            ret = ret + vec[i].toString();
        }
        else
        {
            ret = ret + vec[i].toFixed(3);
        }
        if(i+1 < l)
        {
            ret = ret + ",";
        }
    }
    ret = ret + "]";
    return ret;
}

// Pretty print array mxn JSON style
function arrayPrint(arr)
{
    let ret = "<pre>";
    ret = ret + "[\n";
    let l = arr.length;
    let m = arr[0].length;
    for(let i=0;i<l;i++)
    {
        ret = ret + "[";
        for(let j=0;j<m;j++)
        {
            //ret = ret + arr[i][j].toPrecision(4).padStart(8,' ');
            ret = ret + arr[i][j].toString();
            if(j+1<m)
            {
                ret = ret + ",";
            }
        }
        ret = ret + "]";
        if(i+1<l)
        {
            ret = ret + ",\n";
        }
    }
    ret = ret + "\n]</pre>";
    return ret;
}

// =================================== Parse Description =======================
// Takes specification of the molecule and verifies if it's a valid molecule 
// description. Returns false to indicate parsing errors.


function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);
        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return false;
}

function tryParseMolecule(moleculedesc)
{
    let moleculespec = tryParseJSON(moleculedesc);
    if(moleculespec)
    {
        if(Array.isArray(moleculespec))
        {
            if(moleculespec.length > 0)
            {
                for(let i=0;i<moleculespec.length;i++)
                {
                    if(moleculespec[i].length != 2)
                    {
                        alert(''+JSON.stringify(moleculespec[i])+'\nError: Bead description needs to contain position and size.'); return false;
                    }
                    if(moleculespec[i][0].length != 3)
                    {
                        alert(''+JSON.stringify(moleculespec[i][0])+'\nError: Bead position needs to have 3 dimensions.'); return false;
                    }
                    if(! (moleculespec[i][1] > 0) )
                    {
                        alert(''+JSON.stringify(moleculespec[i][1])+'\nError: Beads need to have positive radii.'); return false;
                    }
                }
            }
            else{
                alert('Error: Molecule needs to have at least one bead.'); return false;
            }
        }
        else{
            alert('Error: Molecule description needs to be array of bead descriptions.'); return false;
        }
    }
    else{
        alert('Error: Molecule specification is not a valid JSON.'); return false;
    }
    return moleculespec;    
}


// =================================== Display Molecule ========================
// Handles call from the web form. Parses molecule description, takes care of 
// forming bead sizes vector, and displaying it. Prepares data for 'model_viewer.js'.

function display_molecule(str)
{
    let moleculedesc = document.getElementById("moleculedesc").value;       
    let moleculespec = tryParseMolecule(moleculedesc);

    if( moleculespec == false)
    {
        return;
    }

    if(moleculespec.length > 200)
    {
        if(!confirm("You're about to display molecule of size "+moleculespec.length+" (size > 200). Proceed?")) return;
    }
    window.displayBeads(moleculespec);    
}

// =================================== Display Molecule ========================
// Handles call from the web form. Parses molecule description, takes care of 
// forming bead sizes vector. Prepares data for 'rigid_molecule.js'.

let mobilityMatrixAtZero = null;
let mobilityMatrixAtCentre = null;
let hydrodynamicRadius = 0;
let mobiltiyCentre = null;
let frictionCentre = null;

function compute_diffusion(str)
{

    mobilityMatrixAtZero = null;
    mobilityMatrixAtCentre = null;
    hydrodynamicRadius = 0;
    mobiltiyCentre = null;
    frictionCentre = null;

    let moleculedesc = document.getElementById("moleculedesc").value;       
    let moleculespec = tryParseMolecule(moleculedesc);

    if( moleculespec == false)
    {
        return;
    }


    try
    {
        computeMoleculeParameters(moleculespec,computationFinishedCallback,progressUpdateCallback);
    }
    catch(error)
    {
        alert("Error: "+error);
    }
}

function progressUpdateCallback(percent)
{
        let width = Math.min(Math.floor(100*percent),100);
        let elem = document.getElementById("computationprogress");
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
}

function computationFinishedCallback(computationResults)
{
        console.log(computationResults);

        document.getElementById("grandmobilitymatrix").innerHTML = arrayPrint(computationResults.grandMobilityMatrix);
        document.getElementById("choleskygrandmobilitymatrix").innerHTML = arrayPrint(computationResults.choleskyGrandMobility);
        document.getElementById("mobilitymatrixatzero").innerHTML = arrayPrint(computationResults.mobilityMatrixAtZero);
        document.getElementById("mobilitycentre").innerHTML = vectorPrint(computationResults.mobilityCentre);
        document.getElementById("mobilitymatrixatcentre").innerHTML = arrayPrint(computationResults.mobilityMatrixAtCentre);
        document.getElementById("hydrodynamicradius").innerHTML = computationResults.hydrodynamicRadius.toPrecision(5);
        document.getElementById("rigidprojectionmatrix").innerHTML = arrayPrint(computationResults.rigidProjectionMatrix);
}


