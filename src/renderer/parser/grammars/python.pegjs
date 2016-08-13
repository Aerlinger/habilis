{
  var implicitLineJoiningLevel = 0;
  var INDENT_STEP = 2;

  var indentLevel = 0;
}

string1
  = '"' chars:([^\n\r\f\\"] / "\\" nl:nl { return ""; } / escape)* '"' {
      return chars.join("");
    }

string2
  = "'" chars:([^\n\r\f\\'] / "\\" nl:nl { return ""; } / escape)* "'" {
      return chars.join("");
    }


// funcdef
//   = decorators? 'def' Name parameters COLON suite


Name
  = ([a-z]i / '_') [a-z0-9_]i*

Lparen= '(' {implicitLineJoiningLevel++;}
Rparen= ')' {implicitLineJoiningLevel--;}


parameters = Lparen /*(varargslist)?*/ Rparen

BlockDocumentation
  = "'''" [a-z]i* Doc+ [a-z]i* "'''"

BlockComment
  = "'''" [a-z]i* "'''"

Doc
  = ":doc:"

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*

escape
  = unicode
  / "\\" ch:[^\r\n\f0-9a-f]i { return ch; }

nl
  = "\n"
  / "\r\n"
  / "\r"
  / "\f"

hex
  = [0-9a-f]i

unicode
  = "\\" digits:$(hex hex? hex? hex? hex? hex?) ("\r\n" / [ \t\r\n\f])? {
      return String.fromCharCode(parseInt(digits, 16));
    }
