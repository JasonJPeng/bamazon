const asTable = require ('as-table').configure({
    "delimiter": ' | ',
    "right": true

});
 
var tt = asTable ([ { foo: true,  string: 'abcde',      num: 42 },
           { foo: false, string: 'qwertyuiop', num: 43.23 },
           {             string:  null,        num: 1.44 } ]);

console.log(tt);           
