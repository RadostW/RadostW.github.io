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

// =================================== Ensemble compute ========================
let ensemble = new Array;
let ensembleTartetSize = 1;
let ensembleHydrodynamicSizesDesign = new Array;
let ensembleStepSizesDesign = new Array;
let ensembleInverseDistances = null;
let ensembleMobility = null;
let ensembleInverseMobility = null;
let ensembleDiffusionEstimate = 0;
let ensembleHydrodynamicRadiusEstimate = 0;
let ensembleMobilityCentre = null;

// Handles call from the web form.
// Resets display fields and storage variables.
function ensemble_compute(str)
{
    ensemble = new Array;
    ensembleTargetSize = 1;
    ensembleHydrodynamicSizesDesign = new Array;
    ensembleStepSizesDesign = new Array;
    ensembleInverseDistances = null;
    ensembleMobility = null;
    ensembleInverseMobility = null;
    ensembleDiffusionEstimate = 0;
    ensembleHydrodynamicRadiusEstimate = 0;
    ensembleMobilityCentre = null;

    let chaindesc = document.getElementById("chaindesc").value;        
    let chainspec = chainTryParse(chaindesc);    
    
    if(chainspec == false)
    {
        alert("Invalid chain description, unable to proceed.");
        return;
    }

    let stepsizes = new Array;
    let beadsizes = new Array;
    let cl = chainspec.length;
    for(let i=0;i<cl;i++)
    {
        // Hydro size        
        let tmpb = new Array(chainspec[i][2]);
        tmpb.fill(chainspec[i][0]);
        beadsizes = beadsizes.concat(tmpb);

        // Step size
        let tmps = new Array(chainspec[i][2]);
        tmps.fill(chainspec[i][1]);
        stepsizes = stepsizes.concat(tmps);
    }    

    if(stepsizes.length > 200)
    {
        if(!confirm("You're about to calculate for chain of length "+stepsizes.length+" (length > 200). Proceed?")) return;
    }
 
    ensembleStepSizesDesign = stepsizes;
    ensembleBeadSizesDesign = beadsizes;

    let sizedesc = document.getElementById("ensemblesize").value;
    if(!Number.isInteger(parseInt(sizedesc)) || parseInt(sizedesc)< 1)
    {
        alert("Enseble size specification is not a valid number.");
        return false;
    }
    let ensemblesize = parseInt(sizedesc);
    ensembleTargetSize = ensemblesize;

    document.getElementById("chaininvmobility").innerHTML = "";
    document.getElementById("chaindiffusion").innerHTML = "";
    document.getElementById("chainradius").innerHTML = "";

    ensembleConstructionHelper();

}


// Incrementally builds the ensemble given specification by 'ensembleSizesDesign'
// and 'ensembleTargetSize'. Calls itself to allow for window refreshing during
// computation (and this neat progress bar).
// When construction is complete calls functions computing hydrodynamic properties.
// When hydrodynamic properties are computed appropiate fields are updated.
function setProgressBar(progress)
{
    let width = Math.min(Math.floor(100*Math.max(progress,0)),100);
    let elem = document.getElementById("ensembleprogress");
    elem.style.width = width + "%";
    elem.innerHTML = width + "%";
}

function ensembleConstructionHelper()
{
    if (ensemble.length < ensembleTargetSize) 
    {
        setTimeout(ensembleConstructionHelper); // Schedule more baking later.
        
        // Do a little baking now.
        let chain = getChain(ensembleStepSizesDesign.length,0,ensembleStepSizesDesign);
        ensemble.push(chain);
        setProgressBar(1.0*ensemble.length/ensembleTargetSize);
    }
    else // Ensemble baking complete
    {
        setProgressBar(1.0);

        ensembleInverseMobilityHelper();
        document.getElementById("chaininvmobility").innerHTML = arrayPrint(ensembleInverseMobility);
        ensembleDiffusionHelper();
        document.getElementById("chaindiffusion").innerHTML = ensembleDiffusionEstimate.toPrecision(4);
        document.getElementById("chainradius").innerHTML = ensembleHydrodynamicRadiusEstimate.toPrecision(5);
        ensembleMobilityCentreHelper();
        document.getElementById("chainmobilitycentre").innerHTML = "<pre>"+vectorPrint(ensembleMobilityCentre)+"</pre>";
    }    
}

// Finds ensemble average of inverse distances between i^th and j^th bead and stores
// that in 'ensembleInverseDistances[i][j]'. For why we need this see:
// "Diffusion coefficients of elastic macromolecules Bogdan Cichocki, 
// Marcin Rubin, Anna Niedzwiecka, and Piotr Szymczak; J. Fluid Mech. (2019)."
//
// Then computes trace of 3x3 mobility matrix coupling between i^th and j^th bead and
// puts it in 'ensembleMobility[i][j]'. Uses Rotne-Prager approximation which simplifies
// things considerably. For mathematical expressions compare with: "Rotne-Prager-Yamakawa 
// approximation for different-sized particles in application to macromolecular bead
// models Pawel Zuk, Eligiusz Wajnryb, Krzysztof Mizerski, and Piotr Szymczak; J. 
// Fluid Mech. (2014)."
// When this is done it inverts grand mobility matrix and saves it in 'ensebmleInverseMobility'.
function ensembleInverseMobilityHelper()
{
    let l = ensembleStepSizesDesign.length;
    let m = ensemble.length;
    ensembleTraceMobility = Array.from(Array(l), () => new Array(l));
    for(let i=0;i<l;i++)for(let j=0;j<l;j++) ensembleTraceMobility[i][j] = 0;    
    for(let i=0;i<l;i++)
    {
        for(let j=0;j<l;j++)
        {
            if(i==j)
            {
                // Self mobility
                ensembleTraceMobility[i][j] = (3.0/(6.0*Math.PI*ensembleBeadSizesDesign[i]));
            }
            else
            {
                let ai = ensembleBeadSizesDesign[i];
                let aj = ensembleBeadSizesDesign[j];
                let accum = 0;
                // enseble average
                for(let k=0;k<m;k++)
                {
                    let Rij = distance( ensemble[k][i] , ensemble[k][j] );
                    if(Rij > ai + aj) // far appart
                    {
                        accum = accum + (3.0/(6.0*Math.PI*Rij));
                    }
                    else // overlapping
                    {
                        let TTidentityScale = (1.0 / (6.0 * Math.PI * ai * aj)) * ((16.0*(Rij**3)*(ai+aj)-((ai-aj)**2 + 3*(Rij**2))**2)/(32.0 * (Rij**3)));
                        let TTrHatScale = (1.0 / (6.0 * Math.PI * ai * aj)) * ( 3 * ((ai-aj)**2 - Rij**2)**2 / (32 * (Rij**3)) );

                        accum = accum + TTrHatScale + 3*TTidentityScale;
                    }
                }
                accum = accum / m;
                ensembleTraceMobility[i][j] = accum;
            }
        }
    }
    ensembleInverseMobility = window.matrixInverse(ensembleTraceMobility);
}

// Computes long time diffusion estimate and hydrodynamic radius estimate based on
// it. Saves them in 'ensembleDiffusionEstimate' and 'ensembleHydrodynamicRadiusEstimate'
// respectively.
function ensembleDiffusionHelper()
{
    let l = ensembleStepSizesDesign.length; //number of beads
    let accum = 0.0;
    for(let i=0;i<l;i++)
    {
        for(let j=0;j<l;j++)
        {
            accum = accum + ensembleInverseMobility[i][j];
        }
    }
    ensembleDiffusionEstimate = (1.0)/accum;
    ensembleHydrodynamicRadiusEstimate = (3.0/(6.0*Math.PI))*accum;
}

// We use definition of hydrodynamic centre consistent with Cichocki et al (2019)
// it is a weighted average of locations of all the beads. Weights are normalized 
// in such a way that the average is 1.
function ensembleMobilityCentreHelper()
{
    let l = ensembleStepSizesDesign.length; //number of beads
    let accum = 0.0;
    ensembleMobilityCentre = new Array(l);
    for(let i=0;i<l;i++)
    {
        accum = 0;
        for(let j=0;j<l;j++)
        {
            accum = accum + ensembleInverseMobility[i][j];
        }
        ensembleMobilityCentre[i] = l * accum * ensembleDiffusionEstimate;
    }
}
