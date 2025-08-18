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

'use strict';

// Returns vector 'a' scaled by scalar 's'.
// or
// returns matrix 'a' scaled by scalar 's'
// depending on the shape
function scale(a,s)
{
    if(Array.isArray(a[0]))
    {
        let n = a.length;
        let ret = Array.from(Array(n), () => new Array(n));
        for(let i=0;i<n;i++)
        {
            for(let j=0;j<n;j++)
            {
                ret[i][j] = a[i][j]*s;
            }
        }
        return ret;
    }
    else
    {
        let ret = Array(a.length);
        for(let i=0;i<a.length;i++) ret[i] = a[i]*s;
        return ret;
    }
}

// Returns sum of vectors 'a' and 'b'
// or
// returns sum of matricies 'a' and 'b'
// depending on the shape
function add(a,b)
{
    if(Array.isArray(a[0]))
    {
        if(a.length != b.length)
        {
            throw "Invalid matrix shapes."
        }
        let n = a.length;
        let ret = Array.from(Array(n), () => new Array(n));
        for(let i=0;i<n;i++)
        {
            for(let j=0;j<n;j++)
            {
                ret[i][j] = a[i][j]+b[i][j];
            }
        }
        return ret;
    }
    else
    {
        if(a.length != b.length)
        {
            throw "Invalid vector lengths.";
        }
        let ret = Array(a.length);
        for(let i=0; i<a.length; i++) ret[i] = a[i]+b[i];
        return ret;
    }
}

// Returns norm of vector 'a'
function norm(a)
{
    if(a.length != 3)
    {
        throw "Invalid vector length.";
    }
    return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
}

// Returns vector 'a' divided by its length
function normalize(a)
{
    return scale(a, 1/norm(a));
}

// Squared distance between 3D points 'a' and 'b'
function squaredDistance(a, b)
{
    if(a.length != 3 || b.length != 3)
    {
        throw "Invalid vector length."
    }
    return (a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])+(a[2]-b[2])*(a[2]-b[2]);
}

// Euclidean distance between 3D points 'a' and 'b'
function distance(a, b)
{
  return Math.sqrt(squaredDistance(a,b));
}

// Returns tensor product of two vectos a,b
function tensorProduct(a, b)
{
    let al = a.length
    let bl = b.length
    let ret = Array.from(Array(al), () => new Array(bl));
    for(let i=0;i<al;i++)
    {
        for(let j=0;j<bl;j++)
        {
            ret[i][j] = a[i]*b[j];
        }
    }
    return ret;
}

// Returns nxn identity matrix
function identity(n)
{
    let ret = Array.from(Array(n), () => new Array(n));
    for(let i=0;i<n;i++)
    {
        for(let j=0;j<n;j++)
        {
            if(i==j)
            {
                ret[i][j]=1;
            }
            else
            {
                ret[i][j]=0;
            }
        }
    }
    return ret;
}

// Returns ret_ik = a_ij b_jk
function multiplyMat(a,b)
{
    let k = a.length;
    let l = a[0].length;
    let m = b.length;
    let n = b[0].length;

    if(l != m)
    {
        throw "Incompatible matrix sizes";
    }

    let ret = Array.from(Array(k), () => new Array(n));

    for(let i=0;i<k;i++)
    {
        for(let j=0;j<n;j++)
        {
            ret[i][j] = 0;
            for(let q=0;q<l;q++)
            {
                ret[i][j] = ret[i][j] + a[i][q]*b[q][j];
            }
        }
    }

    return ret;
}

// Returns transpose of a
function transpose(a)
{
    let n = a.length;
    let m = a[0].length;
    let ret = Array.from(Array(m), () => new Array(n));
    for(let i=0;i<m;i++)
    {
        for(let j=0;j<n;j++)
        {
            ret[i][j] = a[j][i];
        }
    }
    return ret;
}

// Returns 'transpose' of a_ijkl given by a_jilk
function transTranspose(a)
{
    let n = a.length;
    let ret = Array.from(Array(n), () => new Array(n));
    for(let i=0;i<n;i++)
    {
        for(let j=0;j<n;j++)
        {
            ret[i][j] = transpose(a[j][i]);
        }
    }
    return ret;
}

// Returns block specified matrix given nxm matrix of wxh matricies
// Doesnt support blocks of irregular sizes
function unblockMat(a)
{
    let n = a.length;
    let m = a[0].length;
    let w = a[0][0].length;
    let h = a[0][0][0].length;

    let ret = Array.from(Array(n*w), () => new Array(m*h));
    for(let i=0;i<n;i++)
    {
        for(let j=0;j<m;j++)
        {
            for(let p=0;p<w;p++)
            {
                for(let q=0;q<h;q++)
                {
                    ret[w*i+p][h*j+q] = a[i][j][p][q];
                } 
            }
        }
    }
    return ret;
}


// Retruns an \epsilon_ijk v_k; 3x3 matrix
function epsilonVec(vec)
{
    let ret = Array.from(Array(3), () => new Array(3));
    ret[0][0] = 0;
    ret[1][1] = 0;
    ret[2][2] = 0;
    
    ret[0][1] = vec[2];
    ret[1][2] = vec[0];
    ret[2][0] = vec[1];

    ret[1][0] = -vec[2];
    ret[2][1] = -vec[0];
    ret[0][2] = -vec[1];
    
    return ret;
}

// Returns \esilon_ijk M_jk; a vector
function epsilonMat(a)
{
    if(a.length != 3 || a[0].length !=3)
    {
        throw "Not implemented";
    }
    let ret = Array(3);
    ret[0] = -a[1][2] + a[2][1];
    ret[1] =  a[0][2] - a[2][0];
    ret[2] = -a[0][1] + a[1][0]
    return ret;
    
}

// Returns  \epsilon_ijk v_k a_im
function epsilonVecMat(v,a)
{
    if(v.length !=3 || a.length !=3 || a[0].length !=3)
    {
        throw "Not implemented";
    }
    
    return multiplyMat( transpose(epsilonVec(v)) , a );
}

// Returns  a_ij \epsilon_mjk v_k
function epsilonMatVec(a,v)
{
    if(v.length !=3 || a.length !=3 || a[0].length !=3)
    {
        throw "Not implemented";
    }
    
    return multiplyMat( a , transpose(epsilonVec(v)) );
}

// Returns determinant of matrix 'a'
function matrixDet(a)
{
    if(a.length != 3 || a[0].length != 3)
    {
        throw "Not implemented";
    }
    let ret = a[0][0]*a[1][1]*a[2][2]+
              a[0][1]*a[1][2]*a[2][0]+
              a[0][2]*a[1][0]*a[2][1]-

              a[0][2]*a[1][1]*a[2][0]-
              a[0][1]*a[1][0]*a[2][2]-
              a[0][0]*a[1][2]*a[2][1];
    return ret;
}

// Returns trace of matrix 'a'
function matrixTrace(a)
{
    if(a.length != a[0].length)
    {
        throw "Not implemented"
    }
    let ret = 0;
    for(let i=0;i<a.length;i++)
    {
        ret = ret + a[i][i];
    }
    return ret;
}

// Returns a square array of vectors with ret[i][j] equal to vector from i^th particle
// to j^th particle. 
function displacementMat(locations)
{
    let l = locations.length;
    let ret = Array.from(Array(l), () => new Array(l));
    for(let i=0;i<l;i++)
    {
        for(let j=0;j<l;j++)
        {
            ret[i][j] = add( locations[i] , scale(locations[j], -1.0) );
        }
    }
    return ret;
}


// =================================== Interfaces with the user ================


// Constructs grand (multi particle) mobility matrix given description of beads
// locations and sizes.
let grandMobilityMatrix = null;
function grandMobilityMatrixHelper(desc)
{
    // Number of beads
    let n = desc.length;

    // Radii of beads
    let a = Array(n);
    for(let i=0; i<n ; i++)
    {
        a[i] = desc[i][1]; // Bead description: [[x,y,z],r]
    } 

    let locations = Array(n);
    for(let i=0; i<n; i++)
    {
        locations[i] = desc[i][0]; // Bead description [[x,y,z],r]
    }

    let displacements = displacementMat(locations);
    let distances = Array.from(Array(n), () => new Array(n));
    for(let i=0; i<n; i++)
    {
        for(let j=0; j<n; j++)
        {
            distances[i][j] = norm(displacements[i][j]);
        }
    }

    // \hat{R_ij} matrix of normalized displacements.
    let rHatMat = Array.from(Array(n), () => new Array(n));
    for(let i=0; i<n; i++)
    {
        for(let j=0; j<n; j++)
        {
            if(i != j)
            {
                rHatMat[i][j] = normalize(displacements[i][j]);
            }
            else
            {
                rHatMat[i][j] = [0.0,0.0,0.0];
            }
        }
    }

    // Translation-translation mobility matrix
    let muTT = Array.from(Array(n), () => new Array(n));
    // Rotation-rotatnion mobility matrix
    let muRR = Array.from(Array(n), () => new Array(n));
    // Translation-rotation mobility matrix
    let muRT = Array.from(Array(n), () => new Array(n));
    for(let i=0; i<n; i++)
    {
        for(let j=0; j<n; j++)
        {
            let aSmall = Math.min(a[i],a[j]);
            let aBig = Math.max(a[i],a[j]);

            // Scalar coefficients before matricies in R-P approximation
            let TTidentityScale;
            let TTrHatScale;

            let RRidentityScale;
            let RRrHatScale;

            let RTScale;
            
            if(i == j)
            {
                // Translation-translation
                TTidentityScale = (1.0 / (6 * Math.PI * aSmall));
                TTrHatScale = 0.0;

                // Rotation-rotation
                RRidentityScale = (1.0 / (8 * Math.PI * (aSmall**3)));
                RRrHatScale = 0.0;
                
                // Rotation-translation
                RTScale = 0.0;
            }
            else if(distances[i][j] > a[i]+a[j]) // Far apart
            {
                // Translation-translation
                TTidentityScale = (1.0 / (8.0 * Math.PI * distances[i][j]))*(1.0 + (a[i]**2 + a[j]**2) / (3*(distances[i][j]**2)));
                TTrHatScale = (1.0 / (8.0 * Math.PI * distances[i][j]))*(1.0 - (a[i]**2 + a[j]**2) / (distances[i][j]**2));

                // Rotation-rotation
                RRidentityScale = (-1.0 / (16.0 * Math.PI * (distances[i][j]**3)));
                RRrHatScale = (1.0 / (16.0 * Math.PI * (distances[i][j]**3)))*3;
                
                // Rotation-translation
                RTScale = (1.0 / (8 * Math.PI * (distances[i][j]**2) ));
            }
            else if(distances[i][j] > aBig - aSmall && distances[i][j] <= a[i]+a[j])
            {
                // Translation-translation
                TTidentityScale = (1.0 / (6.0 * Math.PI * a[i] * a[j])) * ((16.0*(distances[i][j]**3)*(a[i]+a[j])-((a[i]-a[j])**2 + 3*(distances[i][j]**2))**2)/(32.0 * (distances[i][j]**3)));
                TTrHatScale = (1.0 / (6.0 * Math.PI * a[i] * a[j])) * ( 3 * ((a[i]-a[j])**2 - distances[i][j]**2)**2 / (32 * (distances[i][j]**3)) );

                // Rotation-rotation
                let mathcalA = ( 5.0* (distances[i][j]**6) 
                                - 27.0 * (distances[i][j]**4) * (a[i]**2 + a[j]**2) 
                                + 32.0 * (distances[i][j]**3) * (a[i]**3 + a[j]**3)
                                - 9.0 * (distances[i][j]**2) * ((a[i]**2 - a[j]**2)**2)
                                - ((a[i]-a[j])**4)*(a[i]**2 + 4*a[j]*a[i] + a[j]**2) ) / ( 64.0 * (distances[i][j]**3) );       
                let mathcalB =  ( 3.0*(((a[i]-a[j])**2 - distances[i][j]**2)**2) * (a[i]**2 + 4.0*a[i]*a[j] + a[j]**2 - distances[i][j]**2) ) / (64.0* (distances[i][j]**3)) 
                RRidentityScale = (1.0 / (8.0 * Math.PI * (a[i]**3) * (a[j]**3))) * mathcalA;
                RRrHatScale = (1.0 / (8.0 * Math.PI * (a[i]**3) * (a[j]**3))) * mathcalB;
                
                // Rotation-translation
                RTScale = (1.0 / (16.0 * Math.PI * (a[j]**3) * a[i])) * ( ( ((a[j] - a[i] + distances[i][j])**2)*(a[i]**2+2.0*a[i]*(a[j]+distances[i][j])-3.0*((a[j]-distances[i][j])**2))  ) / (8.0 * (distances[i][j]**2)));
            }
            else
            {
                throw "Mobility matrix case not implemented. One bead entirely inside another.";
            }

            // R-P approximation is of form scalar * matrix + scalar * matrix
            muTT[i][j] = add( scale( identity(3) , TTidentityScale ) , scale( tensorProduct(rHatMat[i][j],rHatMat[i][j]) ,  TTrHatScale  ) );
            muRR[i][j] = add( scale( identity(3) , RRidentityScale ) , scale( tensorProduct(rHatMat[i][j],rHatMat[i][j]) ,  RRrHatScale  ) );
            muRT[i][j] = scale( epsilonVec(rHatMat[i][j]) , RTScale );
        }
    }   

    let grandBlockMobility = unblockMat([[muTT , muRT ], [transTranspose(muRT), muRR]]);

    console.log(grandBlockMobility);

    grandMobilityMatrix = unblockMat(grandBlockMobility);

    console.log(grandMobilityMatrix);

    return grandMobilityMatrix;
}

// Return mobility centre based on the diffusion matrix computed 
// with respect to [0,0,0].
function diffusionCentreHelper(mobilityMatrix)
{
    let ret = Array(3);

    // Rewrite mobility matrix in block form [[a,b],[b^T,c]]
    let a = Array(3);
    let b = Array(3);
    let c = Array(3);

    a[0] = mobilityMatrix[0].slice(0,3);
    a[1] = mobilityMatrix[1].slice(0,3);
    a[2] = mobilityMatrix[2].slice(0,3);

    b[0] = mobilityMatrix[0].slice(3,6);
    b[1] = mobilityMatrix[1].slice(3,6);
    b[2] = mobilityMatrix[2].slice(3,6);

    c[0] = mobilityMatrix[3].slice(3,6);
    c[1] = mobilityMatrix[4].slice(3,6);
    c[2] = mobilityMatrix[5].slice(3,6);

    // x_c = 1/2 (trC 1 - C)^-1 . (\epsilon : (b - b^T))
    let tmp1 = scale( window.matrixInverse( add( scale(identity(3) , matrixTrace(c) ) , scale(c , -1.0) )  ) , 0.5);
    let tmp2 =  epsilonMat( add( b , scale(transpose(b), -1.0) ) );
    ret = scale(  transpose( multiplyMat( tmp1 , transpose([tmp2]) ) )[0], -1.0);

    return ret;

}

// Return mobility matrix translated to the mobility centre
function mobilityMatrixAtCentreHelper(mobilityMatrix,centreLocation)
{
    let ret = Array.from(Array(3), () => new Array(3));

    // Rewrite mobility matrix in block form [[a,b],[b^T,c]]
    let a1 = Array(3);
    let b1 = Array(3);
    let c1 = Array(3);

    a1[0] = mobilityMatrix[0].slice(0,3);
    a1[1] = mobilityMatrix[1].slice(0,3);
    a1[2] = mobilityMatrix[2].slice(0,3);

    b1[0] = mobilityMatrix[0].slice(3,6);
    b1[1] = mobilityMatrix[1].slice(3,6);
    b1[2] = mobilityMatrix[2].slice(3,6);

    c1[0] = mobilityMatrix[3].slice(3,6);
    c1[1] = mobilityMatrix[4].slice(3,6);
    c1[2] = mobilityMatrix[5].slice(3,6);

    let a2;
    let b2;
    let c2;

    a2 = add(add(add( a1 , scale( epsilonVecMat( centreLocation , epsilonMatVec( c1 , centreLocation ) ) , -1) ) , 
                scale( epsilonVecMat( centreLocation, b1 ) , -1)), 
                epsilonMatVec( transpose(b1) , centreLocation)          
               );
    b2 = add( b1, epsilonMatVec( c1, centreLocation) );
    c2 = c1;

    return unblockMat( [[a2,b2],[transpose(b2),c2]] );
}

// Return hydrodynamic radius based on translational diffusivity
function hydrodynamicRadiusHelper(mobility)
{
    return (3 / (6 * Math.PI))/(mobility[0][0] + mobility[1][1] + mobility[2][2]);
}


function rigidProjectionMatrix(beaddesc)
{

    let n = beaddesc.length;
    let locations = Array(n);
    for(let i=0; i<n; i++)
    {
        locations[i] = beaddesc[i][0]; // Bead description [[x,y,z],r]
    }

    let tnBlocks = Array.from(Array(2*n), () => new Array(2));    

    for(let i=0; i<n; i++)
    {
        tnBlocks[i][0] = identity(3);

        let tmp = Array.from(Array(3), () => new Array(3));

        tmp[0][0] = 0;
        tmp[0][1] = locations[i][2];
        tmp[0][2] = -locations[i][1];
        tmp[1][0] = -locations[i][2];
        tmp[1][1] = 0;
        tmp[1][2] = locations[i][0];
        tmp[2][0] = locations[i][1];
        tmp[2][1] = -locations[i][0];
        tmp[2][2] = 0;

        tnBlocks[i][1] = tmp;

        tnBlocks[n+i][0] = scale( identity(3) , 0.0 ); // 3x3 of zeros
        tnBlocks[n+i][1] = identity(3);
    }

    let tn = unblockMat(tnBlocks);
    return tn;
}

// Function below is called many times and accumulates progress using SetTimeout
// mechanism. When all parameters are done calls finishedCallback(status).
// During computation calls progressCallback(percentvalue)
let status = null;
function computeMoleculeParameters(moleculespec,finishedCallback,updateProgress)
{
    if( status == null) // First call
    {
        status = {
                   grandMobilityMatrix : null,
                   choleskyGrandMobility : null,
                   inverseCholeksyGrand : null,
                   mobilityMatrixAtZero : null, 
                   mobilityCentre : null,
                   mobilityMatrixAtCentre : null, 
                   hydrodynamicRadius : null,
                   rigidProjectionMatrix : null
                  };
        status.grandMobilityMatrix = grandMobilityMatrixHelper(moleculespec);
        setTimeout(computeMoleculeParameters,0,moleculespec,finishedCallback,updateProgress);
    }
    else // Later call
    {
        if(!Array.isArray(status.choleskyGrandMobility)) // mobilityMatrixAtZero not done
        {
            status.choleskyGrandMobility = choleskyDecompositionStep(status.grandMobilityMatrix,status.choleskyGrandMobility);
            //status.choleskyGrandMobility = choleskyDecomposition(status.grandMobilityMatrix);
            if(status.choleskyGrandMobility.percent)
            {
                updateProgress(0.5*status.choleskyGrandMobility.percent);
            }
            setTimeout(computeMoleculeParameters,0,moleculespec,finishedCallback,updateProgress);
        }
        else if(!Array.isArray(status.inverseCholeskyGrand)) // inverse of cholesky component not done
        {
            status.inverseCholeskyGrand = invertTriangularStep(status.choleskyGrandMobility,status.inverseCholeskyGrand);
            if(status.inverseCholeskyGrand.percent)
            {
                updateProgress(0.5*status.inverseCholeskyGrand.percent + 0.5);
            }
            setTimeout(computeMoleculeParameters,0,moleculespec,finishedCallback,updateProgress);
        }
        else // Slow fragments of computation are done
        {

            let rpm = rigidProjectionMatrix(moleculespec);
            let tmp = multiplyMat( transpose(rpm) , transpose(status.inverseCholeskyGrand) );
            status.rigidProjectionMatrix = rpm;
            let conglomerateFrictionMatrix = multiplyMat( tmp , transpose(tmp) );
            status.mobilityMatrixAtZero = window.matrixInverse( conglomerateFrictionMatrix );

            status.mobilityCentre = diffusionCentreHelper( status.mobilityMatrixAtZero );
            status.mobilityMatrixAtCentre = mobilityMatrixAtCentreHelper( status.mobilityMatrixAtZero , status.mobilityCentre );

            status.hydrodynamicRadius = hydrodynamicRadiusHelper( status.mobilityMatrixAtCentre );

            updateProgress(1.0);
            finishedCallback(status);
            status = null; // Cleanup        
        }
    }
}
