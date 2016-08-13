/*
 * Simple Intentation-Based Language PEG.js Grammar
 * ================================================
 *
 * Describes a simple indentation-based language. A program in this language is
 * a possibly empty list of the following statements:
 *
 *   * S (simple)
 *
 *     Consists of the letter "S".
 *
 *   * I (indent)
 *
 *     Consists of the letter "I", optionally followed by a newline and a list
 *     of statements indented by one indentation level (2 spaces) relative to
 *     the I statement itself.
 *
 * Statements are terminated by a newline or EOF.
 *
 * Example:
 *
 *   I
 *     S
 *     I
 *       S
 *     S
 *
 * The grammar needs to be compiled without caching.
 */

{
  var INDENT_STEP = 2;

  var indentLevel = 0;
}

Start
  = Statements

Statements
  = Statement*

Statement
  = Samedent statement:(S / I) { return statement; }

S
  = "S" EOS {
  return "S";
}

I
  = "I" EOL Indent statements:Statements Dedent {
  return statements;
}
/ "I" EOS {
  return [];
}

Samedent "correct indentation"
  = spaces:" "* &{ return spaces.length === indentLevel * INDENT_STEP; }

Indent
  = &{ indentLevel++; return true; }

Dedent
  = &{ indentLevel--; return true; }

EOS
  = EOL
  / EOF

EOL
  = "\n"

EOF
  = !.
