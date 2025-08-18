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

// =================================== File selector ===========================

function filechanged(elem)
{
    if(elem.files.length == 0)
    {
        elem.parentElement.innerHTML="Upload a file\
        <input type=\"file\" id=\"fileinput\" name=\"fileinput\" onchange=\"filechanged(this)\">";
    }
    else
    {
        elem.parentElement.innerHTML=""+elem.files[0].name+"\
        <input type=\"file\" id=\"fileinput\" name=\"fileinput\" onchange=\"filechanged(this)\">";
    }
}


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
            //ret = ret + arr[i][j].toPrecision(2).padStart(6,' ');
            ret = ret + arr[i][j];
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

// =================================== Display Molecule ========================
// Handles call from the web form. Passes data to rigid_protein.js.
// Prepares data for 'model_viewer.js'.

let loadedprotein = null;

async function display_molecule(str)
{
    let proteinspec = false;

    if( document.getElementById("pdbid").value.length > 0)
    {
        proteinspec = await getProteinDataFromId( document.getElementById("pdbid").value );
        console.log(proteinspec);
        console.log('Download of ' + document.getElementById("pdbid").value + ' successful!');
    }
    else if( document.getElementById("moleculedesc").value.length > 0 )
    {
        proteinspec = getProteinDataFromText( document.getElementById("moleculedesc").value );
    }
    else
    {
        alert("Please provide molecule description");
    }

    if( proteinspec == false)
    {
        return;
    }

    if(proteinspec.beadspec.length > 200)
    {
        if(!confirm("You're about to display molecule of size "+proteinspec.beadspec.length+" (size > 100). Proceed?")) return;
    }

    // scrollable list manipulations go here

    window.displayBeads(proteinspec.beadspec);
    loadedprotein = proteinspec;
}

// =================================== Compute diffusion =======================
// Handles call from the webform. Prepares data for rigid_molecule.js.

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

    if(loadedprotein == null)
    {
        alert('Load protein first');
        return;
    }

    let moleculespec = loadedprotein.beadspec;
    
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
        //document.getElementById("choleskygrandmobilitymatrix").innerHTML = arrayPrint(computationResults.choleskyGrandMobility);
        document.getElementById("mobilitymatrixatzero").innerHTML = arrayPrint(computationResults.mobilityMatrixAtZero);
        document.getElementById("mobilitycentre").innerHTML = vectorPrint(computationResults.mobilityCentre);
        document.getElementById("mobilitymatrixatcentre").innerHTML = arrayPrint(computationResults.mobilityMatrixAtCentre);
        document.getElementById("hydrodynamicradius").innerHTML = computationResults.hydrodynamicRadius.toPrecision(5);
        document.getElementById("rigidprojectionmatrix").innerHTML = arrayPrint(computationResults.rigidProjectionMatrix);
}
