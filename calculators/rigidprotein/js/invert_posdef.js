//Copyright 2020 Radost Waszkiewicz
//Permission is hereby granted, free of charge, to any person obtaining a copy 
//of this software and associated documentation files (the "Software"), to deal 
//in the Software without rettriction, including without limitation the rights 
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
//copies of the Software, and to permit persons to whom the Software is 
//furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPretS OR 
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//SOFTWARE.

'use strict';

// Code to invert square positive definite matricies in reasonable time.
// First performs cholesky decomposition of the matrix (Cholesky-Banachiewicz).
// Second it uses backsubstitution to obtain inverse of triangular matrix.

function total(array)
{
    return array.reduce((a,b) => a+b,0);
}

// Takes nxn matrix and returns lower triangular part of cholesky decompostion
// For reference see: https://en.wikipedia.org/wiki/Cholesky_decomposition#The_Cholesky%E2%80%93Banachiewicz_and_Cholesky%E2%80%93Crout_algorithms
function choleskyDecomposition(mat)
{
    let n = mat.length;
    if(!(n>0) || mat[0].length != n)
    {
        throw "Square matrix necessary";
    }

    // return matrix -- initialize with zeros
    let ret = Array.from(Array(n), () => Array(n).fill(0));

    for(let i=0;i<n;i++) //go row by row
    {
        let accum;
        for(let j=0;j<=i;j++) // change columns
        {
            if(j<i)
            {
                let accum = 0;
                for(let p=0;p<j;p++)
                {
                    accum = accum + ret[i][p]*ret[j][p];
                }
                ret[i][j] = (1.0 / ret[j][j]) * (mat[i][j] - accum);
            }
            else // on diagonal
            {
                ret[i][j] = Math.sqrt( mat[i][j] -  total(ret[i].slice(0,j).map(x=>x**2)) );
            }
        }
    }
    return ret;
}

// Takes nxn matrix mat to be cholesky decomposed and partial status. Continues 
// work based on previously returned status.
function choleskyDecompositionStep(mat,status)
{
    let n;
    let start;
    let ret;
    let percent;
    if(status == null)
    {
        n = mat.length;
        if(!(n>0) || mat[0].length != n)
        {
            throw "Square matrix necessary";
        }

        // return matrix -- initialize with zeros
        ret = Array.from(Array(n), () => Array(n).fill(0));

        start = 0;
        percent = 0;
    }
    else
    {
        n = status.n;
        start = status.start;
        ret = status.ret;
        percent = status.percent;
    }

    for(let i=start;i<n;i++) //go row by row
    {
        if(i>start)
        {
            // Done enough for now.
            return {n: n, start: start+1, ret: ret, percent: (start+1)*(start+2)*(start+3) / (n*(n+1)*(n+2))};
        }
        let accum;
        for(let j=0;j<=i;j++) // change columns
        {
            if(j<i)
            {
                let accum = 0;
                for(let p=0;p<j;p++)
                {
                    accum = accum + ret[i][p]*ret[j][p];
                }
                ret[i][j] = (1.0 / ret[j][j]) * (mat[i][j] - accum);
            }
            else // on diagonal
            {
                ret[i][j] = Math.sqrt( mat[i][j] -  total(ret[i].slice(0,j).map(x=>x**2)) );
            }
        }
    }
    return ret;
}

// Takes nxn lower triangular matrix and returns its inverse
function invertTriangular(mat)
{
    let n = mat.length;
    if(!(n>0) || mat[0].length != n)
    {
        throw "Square matrix necessary";
    }

    // return matrix -- initialize with zeros
    let ret = Array.from(Array(n), () => Array(n).fill(0));
    for(let k=0;k<n;k++)
    {
        ret[k][k] = 1/mat[k][k];
        for(let i=k+1;i<n;i++)
        {
            let acum = 0;
            for(let p=k;p<i;p++)
            {
                acum = acum + mat[i][p]*ret[p][k];
            }
            ret[i][k] = - acum / mat[i][i];
        }
    }
    return ret;
}

// Takes nxn lower triangular matrix and returns its inverse. Continues 
// work based on previously returned status.
function invertTriangularStep(mat,status)
{
    let n;
    let start;
    let ret;
    let percent;

    if(status == null)
    {
        n = mat.length;
        if(!(n>0) || mat[0].length != n)
        {
            throw "Square matrix necessary";
        }
    
        // return matrix -- initialize with zeros
        ret = Array.from(Array(n), () => Array(n).fill(0));

        start = 0;
        percent = 0;
    }
    else
    {
        n = status.n;
        start = status.start;
        ret = status.ret;
        percent = status.percent;        
    }

    for(let k=start;k<n;k++)
    {
        if(k>start)
        {
            // Done enough for now.
            return {n: n, start: start+1, ret: ret, percent: (n + n - start) * (start+1) / (n * (n+1)) };
        }

        ret[k][k] = 1/mat[k][k];
        for(let i=k+1;i<n;i++)
        {
            let acum = 0;
            for(let p=k;p<i;p++)
            {
                acum = acum + mat[i][p]*ret[p][k];
            }
            ret[i][k] = - acum / mat[i][i];
        }
    }
    return ret;
}

