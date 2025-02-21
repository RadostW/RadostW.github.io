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

let residueRadii = new Map([
  ["ala", 2.28],
  ["gly", 2.56],
  ["met", 4.65],
  ["phe", 4.62],
  ["ser", 3.12],
  ["arg", 5.34],
  ["asn", 3.83],
  ["asp", 3.72],
  ["cys", 3.35],
  ["glu", 3.99],
  ["gln", 4.44],
  ["his", 4.45],
  ["ile", 3.50],
  ["leu", 3.49],
  ["lys", 4.01],
  ["pro", 3.50],
  ["thr", 3.24],
  ["tyr", 4.97],
  ["trp", 5.04],
  ["val", 3.25]
]);

function residueSize(residueName)
{
    let l = residueName.replace(/\s/g, "").toLowerCase();
    if(residueRadii.has(l))
    {
        return residueRadii.get(l);
    }
    else
    {
        if(confirm("Unknown residue name "+residueName+". Continue with median size guess?"))
        {
            return 3.77;
        }
        else
        {
            throw "Unknown residue name: "+residueName;
        }
    }
}

export function pdbToBeads(pdbstring)
{
    let pdbLines = pdbstring.replace(/\r/g, "").split('\n');
    let atomLines = pdbLines.filter(line => line.substring(0,4) === 'ATOM');
    let caLines = atomLines.filter(line => line.substring(12,16) === ' CA ');
    let residueData;    
    try
    {
        residueData = caLines.map( line =>
        [[parseFloat(line.substring(30,38)),parseFloat(line.substring(38,46)),parseFloat(line.substring(47,54))],residueSize(line.substring(17,20))]
        );
    }
    catch (error)
    {
        alert('Error parsing residues. Check console for details.');
        console.log('Error parsing resiudes');
        console.log(error);
    }
    let centreX = residueData.map(x => x[0][0]).reduce((a, b) => a + b, 0) / residueData.length;
    let centreY = residueData.map(x => x[0][1]).reduce((a, b) => a + b, 0) / residueData.length;
    let centreZ = residueData.map(x => x[0][2]).reduce((a, b) => a + b, 0) / residueData.length;

    residueData = residueData.map(x => [[x[0][0]-centreX,x[0][1]-centreY,x[0][2]-centreZ],x[1]]);

    return residueData;   
}
