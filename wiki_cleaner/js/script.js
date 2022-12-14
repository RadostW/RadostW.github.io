//Copyright 2022 Radost Waszkiewicz
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


function escape_to_html(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g,'&NewLine;');
}


// Yank <ref> tags out of text. Replace them with relevant links where needed.
function clean_up(str)
{
    let ref_regex = /(< ?ref(?:| name=.*?)(?:>.*?< ?\/ref>|\/>))/g;
    let ref_name_regex = /< ?ref *?(?:name=(\".*?\")|name=([^ ]*?)[ \/\>])/
    let short_ref = /< ?ref.*\/>/

    let raw_wiki_text = document.getElementById("raw_wiki").value;
    
    let chunks = raw_wiki_text.split(ref_regex);
    
    let clean_text = new Array();
    let references = ["<references>"];
    
    for(let i = 0; i < chunks.length; i++)
    {
        if(ref_regex.test(chunks[i]))
        {
        
        // handle reference        
        if( chunks[i].match(ref_name_regex) )
        {
            // handle already named refererence
            let name = chunks[i].match(ref_name_regex)[1];
            clean_text.push(`<ref name=${name} />`);
            if(short_ref.test(chunks[i]))
            {
                // no need to add to references section
            }
            else
            {
                references.push(chunks[i]);
            }
        }
        else
        {
            // handle reference with no name yet
            let name = `_PLACEHOLDER_NAME_${i}_`;
            clean_text.push(`<ref name=${name} />`);
            references.push(chunks[i].replace(/< ?ref/,`<ref name=${name}`));
        }
        
        }
        else
        {
        // handle not reference
        clean_text.push(chunks[i]);
        }
    }
    
    references.push("<references />");
    
    document.getElementById("text_clean").innerHTML = escape_to_html(clean_text.join(''));
    document.getElementById("refs_clean").innerHTML = escape_to_html(references.join('\n'));
}
