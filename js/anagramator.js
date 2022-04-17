function rand_element(items) {
    // "~~" for a closest "int"
    return items[~~(items.length * Math.random())];
}

String.prototype.shuffle = function () {
    // Fisher-Yates
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

String.prototype.ordered = function () {
    return this.split('').sort().join('');
}

window.onload=function(){

    document.my_constants["user_guess"] = "";
    
    set_target_word();    
    display_given_letters(document.my_constants["target_word_shuffled"]);

    document.body.onkeydown = function(e){
        if(e.key === "Backspace")
        {
            remove_letter();
        }
        if(e.key === "Enter")
        {
            make_guess();
        }
        if( /^[a-zęóąłżźćś]$/.test(e.key.toLowerCase()) )
        {
    	    add_letter(e.key.toLowerCase());
        }
    };

    document.getElementById('s0').onclick = function()      
    {
        add_letter(document.getElementById('s0').innerHTML);
    }
    document.getElementById('s1').onclick = function()      
    {
        add_letter(document.getElementById('s1').innerHTML);
    }
    document.getElementById('s2').onclick = function()      
    {
        add_letter(document.getElementById('s2').innerHTML);
    }
    document.getElementById('s3').onclick = function()      
    {
        add_letter(document.getElementById('s3').innerHTML);
    }
    document.getElementById('s4').onclick = function()      
    {
        add_letter(document.getElementById('s4').innerHTML);
    }
    document.getElementById('s5').onclick = function()      
    {
        add_letter(document.getElementById('s5').innerHTML);
    }
    document.getElementById('s6').onclick = function()      
    {
        add_letter(document.getElementById('s6').innerHTML);
    }
    
    document.getElementById('d0').onclick = remove_letter;
    document.getElementById('d1').onclick = remove_letter;
    document.getElementById('d2').onclick = remove_letter;
    document.getElementById('d3').onclick = remove_letter;
    document.getElementById('d4').onclick = remove_letter;
    document.getElementById('d5').onclick = remove_letter;
    document.getElementById('d6').onclick = remove_letter;
    
}

function set_target_word()
{
    var target_word;
    while(true)
    {
        target_word = rand_element(document.my_constants["common_words"]);
        if(document.my_constants["all_words"].includes(target_word)) // check if common AND legal
        {
            break;
        }
    }
    document.my_constants["target_word"] = target_word;
    document.my_constants["target_word_shuffled"] = target_word.shuffle();
}

function display_given_letters(letters)
{
    //var guess_display = document.getElementById('given_letters_display');
    //guess_display.innerHTML = letters;
    document.getElementById('s0').innerHTML = letters[0];
    document.getElementById('s1').innerHTML = letters[1];
    document.getElementById('s2').innerHTML = letters[2];
    document.getElementById('s3').innerHTML = letters[3];
    document.getElementById('s4').innerHTML = letters[4];
    document.getElementById('s5').innerHTML = letters[5];
    document.getElementById('s6').innerHTML = letters[6];
    
}

function add_letter(l)
{
    var user_guess = document.my_constants["user_guess"];
    
    if(user_guess.length >= 7) return;
    
    user_guess = user_guess + l;
    document.my_constants["user_guess"] = user_guess;
    display_guess(user_guess);
}

function remove_letter()
{
    var user_guess = document.my_constants["user_guess"];
    user_guess = user_guess.slice(0,-1);
    document.my_constants["user_guess"] = user_guess;
    display_guess(user_guess);
}

function display_guess(word)
{
    //var guess_display = document.getElementById('guess_display');
    //guess_display.innerHTML = word;
    blank = ["", "", "", "", "", "", ""];
    letters = word.split('').concat(blank);
    document.getElementById('d0').innerHTML = letters[0];
    document.getElementById('d1').innerHTML = letters[1];
    document.getElementById('d2').innerHTML = letters[2];
    document.getElementById('d3').innerHTML = letters[3];
    document.getElementById('d4').innerHTML = letters[4];
    document.getElementById('d5').innerHTML = letters[5];
    document.getElementById('d6').innerHTML = letters[6];
}

function make_guess()
{
    var user_guess = document.my_constants["user_guess"];
    if(document.my_constants["all_words"].includes(user_guess))
    {
        if(document.my_constants["target_word"].ordered() === user_guess.ordered() )
        {
            var solved_display = document.getElementById('solved');
            solved_display.innerHTML = (
                document.my_constants["target_word_shuffled"] 
                + "<br>"
                + solved_display.innerHTML
            );
            set_target_word();
            display_given_letters(document.my_constants["target_word_shuffled"]);
        }
    }
    else
    {
        alert('Not a legal word');
    }
}

