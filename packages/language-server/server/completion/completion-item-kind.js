const { CompletionItemKind } = require("vscode-languageserver");

const FUNCTION_MATCHER = "=>";
const CLASS_MATCHER = "class";
const CONSTRUCTOR_MATCHER = "Constructor";

const kinds = [
  {
    itemKind: CompletionItemKind.Function,
    matcher: FUNCTION_MATCHER,
  },
  {
    itemKind(type) {
      return type.isConstant
        ? CompletionItemKind.Constant
        : CompletionItemKind.Variable;
    },
    matcher(type) {
      return (
        !String(type.name).includes(CLASS_MATCHER) &&
        !String(type.name).includes(FUNCTION_MATCHER) &&
        !String(type.name).includes(CONSTRUCTOR_MATCHER) &&
        type.properties === undefined &&
        !type.isVariableTypeAlias
      );
    },
  },
  {
    itemKind: CompletionItemKind.Class,
    matcher(type) {
      return (
        (String(type.name).includes(CLASS_MATCHER) ||
          type.properties !== undefined) &&
        !String(type.name).includes(CONSTRUCTOR_MATCHER)
      );
    },
  },
  {
    itemKind: CompletionItemKind.Constructor,
    matcher: CONSTRUCTOR_MATCHER,
  },
  {
    itemKind: CompletionItemKind.Interface,
    matcher(variableInfo) {
      return variableInfo.isVariableTypeAlias;
    }
  }
];

/**
 * Find type kind of variable.
 */
function getCompletionKind(variableInfo) {
  const isVariableTypeAlias = variableInfo.type === undefined;

  const possibleKind = kinds.find(({ matcher }) => {
    return typeof matcher === "string"
      ? String(
          isVariableTypeAlias ? variableInfo.name : variableInfo.type.name
        ).includes(matcher)
      : matcher({
          isVariableTypeAlias,
          ...(isVariableTypeAlias ? variableInfo : variableInfo.type),
        });
  });

  return possibleKind
    ? typeof possibleKind.itemKind === "function"
      ? possibleKind.itemKind(variableInfo)
      : possibleKind.itemKind
    : CompletionItemKind.Text;
}

exports.getCompletionKind = getCompletionKind;