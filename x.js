fs=require("fs");var delimiters={};delimiters["("]=true;delimiters[")"]=true;delimiters[";"]=true;delimiters["\n"]=true;var whitespace={};whitespace[" "]=true;whitespace["\t"]=true;whitespace["\n"]=true;var operators={};operators["+"]="+";operators["-"]="-";operators["<"]="<";operators[">"]=">";operators["and"]="&&";operators["or"]="||";operators["cat"]="+";operators["="]="==";var special={};special["set"]=compile_set;special["get"]=compile_get;special["not"]=compile_not;special["if"]=compile_if;special["function"]=compile_function;special["declare"]=compile_declare;special["while"]=compile_while;special["list"]=compile_list;function error(msg){throw(msg);}function make_stream(str){var s={};s.pos=0;s.string=str;s.len=str.length;return(s);}function read_file(filename){return(fs.readFileSync(filename,"utf8"));}function write_file(filename,data){return(fs.writeFileSync(filename,data,"utf8"));}function peek_char(s){if((s.pos<s.len)){return(s.string.charAt(s.pos));}}function read_char(s){var c=peek_char(s);if(c){s.pos=(s.pos+1);return(c);}}function skip_non_code(s){var c;while(true){c=peek_char(s);if(!(c)){break;}else if(whitespace[c]){read_char(s);}else if((c==";")){while((c&&!((c=="\n")))){c=read_char(s);}skip_non_code(s);}else if(true){break;}}}function read_atom(s){var c;var str="";while(true){c=peek_char(s);if((c&&(!(whitespace[c])&&!(delimiters[c])))){str=(str+c);read_char(s);}else if(true){break;}}var n=parseFloat(str);if(isNaN(n)){return(str);}else if(true){return(n);}}function read_list(s){read_char(s);var c;var l=[];while(true){skip_non_code(s);c=peek_char(s);if((c&&!((c==")")))){l.push(read(s));}else if(c){read_char(s);break;}else if(true){error(("Expected ) at "+s.pos));}}return(l);}function read_string(s){read_char(s);var c;var str="\"";while(true){c=peek_char(s);if((c&&!((c=="\"")))){if((c=="\\")){str=(str+read_char(s));}str=(str+read_char(s));}else if(c){read_char(s);break;}else if(true){error(("Expected \" at "+s.pos));}}return((str+"\""));}function read(s){skip_non_code(s);var c=peek_char(s);if((c=="(")){return(read_list(s));}else if((c==")")){error(("Unexpected ) at "+s.pos));}else if((c=="\"")){return(read_string(s));}else if(true){return(read_atom(s));}}function is_atom(form){return(((typeof(form)=="string")||(typeof(form)=="number")));}function is_call(form){return((Array.isArray(form)&&(typeof(form[0])=="string")));}function is_operator(form){return(!((operators[form[0]]==null)));}function is_special(form){return(!((special[form[0]]==null)));}function terminator(is_statement){if(is_statement){return(";");}else if(true){return("");}}function compile_args(forms,are_literal){var i=0;var str="(";while((i<forms.length)){if(are_literal){str=(str+forms[i]);}else if(true){str=(str+compile(forms[i],false));}if((i<(forms.length-1))){str=(str+",");}i=(i+1);}return((str+")"));}function compile_body(forms){var i=0;var str="{";while((i<forms.length)){str=(str+compile(forms[i],true));i=(i+1);}return((str+"}"));}function compile_atom(form,is_statement){return((form.toString()+terminator(is_statement)));}function compile_call(form,is_statement){var fn=compile(form[0],false);var args=compile_args(form.slice(1));return((fn+args+terminator(is_statement)));}function compile_operator(form){var i=1;var str="(";var op=operators[form[0]];while((i<form.length)){str=(str+compile(form[i],false));if((i<(form.length-1))){str=(str+op);}i=(i+1);}return((str+")"));}function compile_set(form,is_statement){if(!(is_statement)){error("Cannot compile assignment as an expression");}if(!(is_atom(form[0]))){error("Invalid left-hand side of assignment");}if((form.length<3)){error("Missing right-hand side in assignment");}var lh=compile(form[1],false);var rh=compile(form[2],false);return((lh+"="+rh+terminator(true)));}function compile_branch(branch){var condition=compile(branch[0],false);var body=compile_body(branch.slice(1));return(("if("+condition+")"+body));}function compile_if(form,is_statement){if(!(is_statement)){error("Cannot compile if as an expression");}var i=1;var str="";while((i<form.length)){str=(str+compile_branch(form[i]));if((i<(form.length-1))){str=(str+"else ");}i=(i+1);}return(str);}function compile_function(form,is_statement){var name=form[1];var args=compile_args(form[2],true);var body=compile_body(form.slice(3));return(("function "+name+args+body));}function compile_get(form,is_statement){var key=compile(form[2],false);return((form[1]+"["+key+"]"+terminator(is_statement)));}function compile_not(form,is_statement){var expr=compile(form[1],false);return(("!("+expr+")"+terminator(is_statement)));}function compile_declare(form,is_statement){if(!(is_statement)){error("Cannot compile declaration as an expression");}var lh=form[1];var tr=terminator(true);if((typeof(form[2])=="undefined")){return(("var "+lh+tr));}else if(true){var rh=compile(form[2],false);return(("var "+lh+"="+rh+tr));}}function compile_while(form,is_statement){if(!(is_statement)){error("Cannot compile while loop as an expression");}var condition=compile(form[1],false);var body=compile_body(form.slice(2));return(("while("+condition+")"+body));}function compile_list(form,is_statement,is_quoted){var i=1;var str="[";while((i<form.length)){var x=form[i];if(is_atom(x)){str=(str+x);}else if(true){var x1=compile(x,false);str=(str+x1);}if((i<(form.length-1))){str=(str+",");}i=(i+1);}return((str+"]"));}function compile(form,is_statement){if(is_atom(form)){return(compile_atom(form,is_statement));}else if(is_call(form)){if((is_operator(form)&&is_statement)){error(("Cannot compile operator application as a statement"));}else if(is_operator(form)){return(compile_operator(form));}else if(is_special(form)){var compiler=special[form[0]];return(compiler(form,is_statement));}else if(true){return(compile_call(form,is_statement));}}else if(true){error(("Unexpected form: "+form.toString()));}}function compile_file(filename){var form;var output="";var s=make_stream(read_file(filename));while(true){form=read(s);if(form){output=(output+compile(form,true));}else if(true){break;}}return(output);}function usage(){console.log("usage: x input [-o output]");}if((process.argv.length<3)){usage();}else if((process.argv[2]=="--help")){usage();}else if(true){var input=process.argv[2];var output;if(((process.argv.length>4)&&(process.argv[3]=="-o"))){output=process.argv[4];}else if(true){var name=input.slice(0,input.indexOf("."));output=(name+".js");}write_file(output,compile_file(input));}