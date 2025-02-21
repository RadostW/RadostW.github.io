function getProteinDataFromText(text)
{
    let atomData = text.match(/(ATOM .*)/g);
    atomData = atomData.map(x => x.split(/[\s]+/));
    atomData = atomData.map(x => [x[2],x[4],parseInt(x[5]),parseFloat(x[10]),parseFloat(x[11]),parseFloat(x[12])])
    let residueCount = Math.max(...atomData.map( x => x[2]));
    let residueTable = Array.from(Array(residueCount), () => new Array());
    for(let i=0;i<atomData.length;i++)
    {
        residueTable[ atomData[i][2] - 1].push( atomData[i] );
    }
    let residueCentres = Array(residueCount);
    let residueSizes = Array(residueCount);
    let metaaccumx = 0;
    let metaaccumy = 0;
    let metaaccumz = 0;
    let moleculeCentre;
    for(let i=0;i<residueCount;i++)
    {
        if(!(residueTable[i].length > 0))
        {
            continue;
        }
        let accumm = 0; //mass
        let accumx = 0;
        let accumy = 0;
        let accumz = 0;
        for(let j=0;j<residueTable[i].length;j++)
        {
            let m = atomMasses.get(residueTable[i][j][0]);
            if(m == undefined)
            {
                alert("Unknown atom name"+residueTable[i][j][0]);
                throw "Unknown atom name"+residueTable[i][j][0];
            }
            let x = residueTable[i][j][3]; 
            let y = residueTable[i][j][4];
            let z = residueTable[i][j][5];
            accumm += m;
            accumx += m*x;
            accumy += m*y;
            accumz += m*z;
        }
        residueCentres[i] = [accumx / accumm, accumy / accumm, accumz / accumm];
        metaaccumx += accumx / accumm;
        metaaccumy += accumy / accumm;
        metaaccumz += accumz / accumm;
    }
    moleculeCentre = [metaaccumx / residueCount, metaaccumy / residueCount, metaaccumz / residueCount];

    for(let i=0;i<residueCount;i++)
    {
        if(!(residueTable[i].length > 0))
        {
            continue;
        }
        let name = ((residueTable[i][0][1]).toLowerCase());
        let size = residueRadii.get(name);
        if(size == undefined)
        {
            alert("Unknown residue name "+name);
            throw "Unknown residue name "+name;
        }
        residueSizes[i] = size;        
    }

    let tmp = Array(residueCount);
    for(let i=0;i<residueCount;i++)
    {

        if(!(residueTable[i].length > 0))
        {
            continue;
        }

        tmp[i] = [
            [residueCentres[i][0]-moleculeCentre[0],residueCentres[i][1]-moleculeCentre[1],residueCentres[i][2]-moleculeCentre[2]],
            residueSizes[i]];
    }

    let moleculespec = new Array();
    for(let i=0;i<tmp.length;i++)
    {
        if(Array.isArray(tmp[i]))
        {
            moleculespec.push(tmp[i]);
        }
    }
    
    let proteinspec = {
      beadspec: moleculespec
    };

    return proteinspec;
}
