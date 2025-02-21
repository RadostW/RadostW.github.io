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

// Get an instance of standard normal varariable -- N(0,1)
// Starts with 2 uniform r.v. and transforms to Gaussian distribution.
// See: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
function getNormal() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// Represents points in 3D space. Nothing surprising here.
class point
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    norm()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
    sqnorm()
    {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }
    normalize()
    {
        let n = this.norm();
        this.x = this.x / n;
        this.y = this.y / n;
        this.z = this.z / n;
    }
    add(rhs)
    {
        let ret = new point;
        ret.x = this.x + rhs.x;
        ret.y = this.y + rhs.y;
        ret.z = this.z + rhs.z;
        return ret;
    }
    scale(rhs)
    {
        let ret = new point;
        ret.x = this.x * rhs;
        ret.y = this.y * rhs;
        ret.z = this.z * rhs;
        return ret;
    }
}

// Get instance of random vector with unit length uniformly distributed on 
// the sphere. Uses multinormal distribution trick.
function getSpherical()
{
    let p = new point;
    while(p.sqnorm() < 0.001)
    {
        p.x = getNormal();
        p.y = getNormal();
        p.z = getNormal();
    }
    p.normalize()
    return p;
}

// Squared distance between 3D points 'a' and 'b'
function squaredDistance(a, b)
{
    return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)+(a.z-b.z)*(a.z-b.z);
}

// Euclidean distance between 3D points 'a' and 'b'
function distance(a, b)
{
  return Math.sqrt(squaredDistance(a,b));
}

// Gets a chain of nonoverlapping beads with touching neighbours given specification:
// 'n' -- number of beads
// 'sizes_beg' -- index of first bead size inside 'sizes' vector (very convenient for recursion).
// 'sizes' -- vector of length 'n' with sizes of beads
// Randomizes beads one-by-one with spherically uniform increments. If last bead
// intersects any of the previous ones IT STARTS ALL OVER AGAIN to keep correct 
// distributions of angles.
function getChainIterative(n,sizes_beg,sizes)
{
    let ret = new Array;
    let end = new point;
    let candidate;
    // Elongate ret chain until you make it long enough.
    while(ret.length < n)
    {
        // Try and try again to append points at the end.
        while(true)
        {
            let step = getSpherical();
            if(ret.length == 0)
            {
                // Initial point.
                candidate = new point;
            }
            else
            {
                // Noninitial point. Add increment in diretion step at the end of the chain.
                candidate = end.add( step.scale( sizes[ sizes_beg + ret.length ] + sizes[ sizes_beg + ret.length - 1]) );
            }
            let noncrossing = true;
            // For each (but the last) bead in computed chain chech if candidate
            // does not intersect them.
            for(let i = 0; i+1 < ret.length ; i++)
            {
                if(distance(ret[i],candidate) < sizes[sizes_beg + i]+sizes[sizes_beg + ret.length])
                {
                    // Failed here no need to check anymore.
                    noncrossing=false;
                    break;
                }
            }
            if(noncrossing)
            {
                // Good candidate. Pop out of the randomizing loop.
                break;
            }
            else // Important! Throw away everything.
            {
                // An intersection found. Damn, start over.
                ret = new Array;
                end = new point;  
            }
        }
        // Add candidate at the end of the chain and update enpoint coordinates.
        ret.push(candidate);
        end = candidate;
    }
    return ret;
}

// Gets a chain of nonoverlapping beads with touching neighbours given specification:
// 'n' -- number of beads
// 'sizes_beg' -- index of first bead size inside 'sizes' vector (very convenient for recursion).
// 'sizes' -- vector of length 'n' with sizes of beads
// Randomizes recursively. Randomizes left half and right half separately according
// to the same distribution (note sizes_beg is different in left half and right half)
// and then attempts to put them together. If they intersect it throws both away
// and STARTS FROM SCRATCH to keep distributions of left and right half independent
// (which would not be the case if you re-randomized just some portion of the chain).
function getChain(n,sizes_beg,sizes)
{
    // Chain is very small. Fall back to iterative variant.
    if(n<5)
    {
        return getChainIterative(n,sizes_beg,sizes);
    }
    // Longer chain. Subdivide into two subchains.
    else
    {
        let ret = new Array;
        while(ret.length < n)
        {
            let candidate
            // Compute lengths of left and right subchains.
            let ml = Math.floor(n/2);
            let mr = n - ml;

            // Get left subchain
            ret = getChain(ml,sizes_beg,sizes);
            let end_l = ret[ret.length -1];
            let step = getSpherical();

            let stepsize = ( sizes[sizes_beg + ml - 1]  + sizes[sizes_beg + ml]);
            // Location of left end of right subchain
            let beg_r = end_l.add( step.scale( stepsize ) );

            // Get right subchain
            // We'll attempt to add beads from this chain to right chain one-by-one.
            let app = getChain(mr,ml+sizes_beg,sizes);

            // For each bead in right subchain
            for(let i = 0; i < app.length ; i++)
            {
                let noncrossing = true;
                // Possible new bead location: right chain location + end of left chain.
                candidate = app[i].add( beg_r );
                for(let j = 0 ; j + 1 < ret.length ; j++)
                {
                    let dist = distance(ret[j],candidate);
                    let min_dist = (sizes[sizes_beg + j] + sizes[sizes_beg + ml + i]);
                    if(dist < min_dist)
                    {
                        noncrossing=false;
                        break;
                    }
                }
                if(noncrossing)
                {
                    // Good so far. Extend left chain by one bead.
                    ret.push(candidate);
                }
                else
                {
                    // Chains intersected. Start over.
                    ret = new Array;
                    beg_r = new point;  
                }
            }
        }
        return ret;    
    }
}

// =================================Interacting with chain descrpitions=========

// Attemps to find stupid input values in the chain description. The validation 
// procedure is not perfect, but everything here is client side so no big deal if
// something stupid goes into the scripts later <shrug>.
function validate(str)
{
    if(str == "")
    {
        return false;
    }
    let letters = /^$|^[0-9\-\[\],.]+$/;
    if (letters.test(str)) 
    {
        return true;
    } 
    else 
    {
        alert('Allowed characters are numbers, comma (","), dot ("."), and brackets ("[","]").');
        return false;
    }
}

// Takes (hopefully reasonable string) and tries to return vector of sizes of beads.
// Expands repeat symbols such as [1,5] which stands for five ones in a row.
function chainParse(str)
{
    let test = validate(str);
    let ret = new Array;
    if(test == false)
    {
        return false;
    }
    else
    {
        let blocks = str.split('-');
        for(let i=0;i<blocks.length;i++)
        {
            if(blocks[i].length == 0)
            {
                continue; //empty string (possibly str="1-2-" and we're at the last block)
            }            
            // Repeat symbol. Shoud have two numbers inside those braces
            else if(blocks[i][0]=='[')
            {
                let tmp = blocks[i].substring(1,blocks[i].length - 1);
                let subblocks = tmp.split(',');
                for(let j=0; j < parseInt(subblocks[1]);j++)
                {
                    ret.push(parseFloat(subblocks[0]));
                }
            }
            // Some normalish block. Hopefully just a number.
            else
            {
                let f = parseFloat(blocks[i]);
                // Beads of size 0 make algo sad. Please don't.
                if(f==0)
                {
                    continue;
                }
                ret.push(f);    
            }
        }
    }
    return ret;
}
