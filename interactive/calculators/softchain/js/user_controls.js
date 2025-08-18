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

// If json is no good return false
// by Matt H. -> https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
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
};


// =================================== Parse Chain =============================
// Takes JSON string describing chain shape. Expands abbreviated notations
function chainTryParse(chaindesc)
{
    let ret;
    ret = tryParseJSON(chaindesc);
    if(ret !== false)
    {
        if(Array.isArray(ret))
        {
            let l=ret.length;
            for(let i=0;i<l;i++)
            {
                if(!Array.isArray(ret[i]))
                {
                    ret[i] = [ret[i],ret[i],1];
                }
                else
                {
                    if(ret[i].length != 3 || !Number.isInteger(ret[i][2]))
                    {
                        return false;
                    }
                }
            }
            return ret;
        }
        return false;        
    }
   
    return false; // failed
        
}


// =================================== Pretty prints =============================

// Pretty print chain data
function chainPrint(chainspec)
{
    let ret = "[";
    let l = chainspec.length;
    for(let i=0;i<l;i++)
    {
        ret = ret + "[" + chainspec[i][0].toFixed(3) + ", " +
         chainspec[i][1].toFixed(3) + ", " + chainspec[i][2].toFixed(0) + "]";
        if(i+1<l) ret = ret + ", ";
    }
    ret = ret + "]";
    return ret;
}

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
            ret = ret + arr[i][j].toPrecision(2).padStart(5,' ');
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


// =================================== Display Chain ===========================
// Handles call from the web form. Parses chain description, takes care of forming
// bead sizes vector, and displaying it. Prepares data for 'model_viewer.js'.
function display_chain(str)
{
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
        if(!confirm("You're about to display chain of length "+stepsizes.length+" (length > 200). Proceed?")) return;
    }

    let chain = getChain(stepsizes.length,0,stepsizes);
    let com = new point;
    for(let i=0; i<chain.length; i++)
    {
        com = com.add(chain[i]);
    }
    com = com.scale(1.0/chain.length);
    for(let i=0; i<chain.length; i++)
    {
        chain[i] = chain[i].add( com.scale(-1.0));
    }    

    let beadspec = new Array;
    for(let i=0; i<chain.length ; i++)
    {
        beadspec.push([[chain[i].x,chain[i].y,chain[i].z],beadsizes[i]])
    }

    window.displayBeads(beadspec);
}

// =================================== Parse Description =======================
// Takes specification of the chain and passes it to 'chainParse' (implemented in
// 'random_chain.js'). Displays sizes vector in relevant user facing box.
function parse_description(str)
{
    let chaindesc = document.getElementById("chaindesc").value;        
    let chainparsed = chainTryParse(chaindesc);
    if(chainparsed)
    {
        document.getElementById("chainlongtext").innerHTML = chainPrint(chainparsed);
    }
    else
    {
        document.getElementById("chainlongtext").innerHTML = "Invalid chain description";
    }
}
