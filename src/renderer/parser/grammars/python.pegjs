{
  var implicitLineJoiningLevel = 0;
  
  var INDENT_STEP = 2;
  var indentLevel = 0;
}

// funcdef
//   = decorators? 'def' Name parameters COLON suite
// parameters = LPAREN /*(varargslist)?*/ RPAREN

Start= cell

cell = doc:DOCblock _ func:funcdef {
  return {
    cell: {
      doc: doc,
      func: func
    }
  }
}

Statements= Statement*

Statement= Samedent statement:(SimpleStatement / block) { return statement; }

SimpleStatement
  = stmt:(DOCblock / funcdef / INTEGER) EOS {
    return stmt;
  }

funcdef = "def" _ name:NAME parameters:parameters COLON block:block {
  return {
    type: "function",
    name: name,
    parameters: parameters,
    block: block
  }
}

parameters= LPAREN /*(varargslist)?*/ RPAREN {
  return []
}

// decorator: AT dotted_attr (LPAREN arglist? RPAREN)? NEWLINE

block
  = EOL INDENT statements:Statements DEDENT {
    return statements;
  }
  / statement:SimpleStatement EOS {
    return statement;
  }

DOCblock
  = "'''" [a-z]i* DOCTAG+ doc:[a-z]i* "'''" {
    var doc_body = doc.join("");

    return {
      type: "doc",
      content: doc_body
    }
  }

STRINGblock= "'''" [a-z]i* "'''"

DOCTAG= ":doc:"

INTEGER "integer"
  = [0-9]+ { return parseInt(text(), 10); }

escape
  = UNICODE
  / "\\" ch:[^\r\n\f0-9a-f]i { return ch; }


STRINGDBL
  = '"' chars:([^\n\r\f\\"] / "\\" NEWLINE:NEWLINE { return ""; } / escape)* '"' {
    return chars.join("");
  }

STRINGSINGLE
  = "'" chars:([^\n\r\f\\'] / "\\" NEWLINE:NEWLINE { return ""; } / escape)* "'" {
    return chars.join("");
  }


Samedent "correct indentation"
  = spaces:" "* &{ return spaces.length === indentLevel * INDENT_STEP; }

INDENT= &{ indentLevel++; return true; }
DEDENT= &{ indentLevel--; return true; }

EOS = EOL / EOF
EOL = "\n"
EOF = !.

DOT="."

AT = '@'
COLON = ':'

HEX= [0-9a-f]i

NAME= head:([a-z]i / '_') tail:[a-z0-9_]i* {
  return head.concat(tail.join(""))
}

LPAREN= '(' { implicitLineJoiningLevel++; }
RPAREN= ')' { implicitLineJoiningLevel--; }


UNICODE
  = "\\" digits:$(HEX HEX? HEX? HEX? HEX? HEX?) ("\r\n" / [ \t\r\n\f])? {
      return String.fromCharCode(parseInt(digits, 16));
    }

NEWLINE
  = "\n" / "\r\n" / "\r" / "\f"

_ "whitespace"
  = [ \t\n\r]*

